package com.pfe.platform.controller;

import com.pfe.platform.entity.ProductionPrediction;
import com.pfe.platform.repository.ProductionPredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/** Passerelle sécurisée (rôle ADMIN) vers le service ML FastAPI. */
@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MLController {

    private final WebClient.Builder webClientBuilder;
    private final ProductionPredictionRepository productionPredictionRepository;

    @Value("${app.ml-service.url}")
    private String mlServiceUrl;

    @Value("${app.ml-service.api-key:}")
    private String mlApiKey;

    @Value("${app.ml-service.timeout-seconds}")
    private long timeoutSeconds;

    private WebClient client() {
        WebClient.Builder b = webClientBuilder.clone().baseUrl(mlServiceUrl)
            .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024));
        if (mlApiKey != null && !mlApiKey.isBlank()) {
            b.defaultHeader("X-API-Key", mlApiKey);
        }
        return b.build();
    }

    private ResponseEntity<Object> call(Supplier<Object> request) {
        try {
            return ResponseEntity.ok(request.get());
        } catch (WebClientResponseException e) {
            // Erreur métier du service ML (400 données invalides, 503 DWH indisponible...) : transmise telle quelle.
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (WebClientRequestException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "ML service unavailable", "message", "Le service ML est injoignable : " + mlServiceUrl));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body(Map.of("error", "ML service timeout", "message", e.getMessage()));
        }
    }

    private Object get(String uri) {
        return client().get().uri(uri).retrieve().bodyToMono(Object.class).block(Duration.ofSeconds(timeoutSeconds));
    }

    private Object post(String uri, Object body) {
        return client().post().uri(uri).bodyValue(body).retrieve().bodyToMono(Object.class).block(Duration.ofSeconds(timeoutSeconds));
    }

    @GetMapping("/predict/production")
    public ResponseEntity<Object> predictProduction(@RequestParam(defaultValue = "30") int horizon,
                                                    @RequestParam(required = false) LocalDate start) {
        String uri = "/predict/production?horizon=" + horizon + (start != null ? "&start=" + start : "");
        return call(() -> get(uri));
    }

    @GetMapping("/benchmark")
    public ResponseEntity<Object> benchmark(@RequestParam(defaultValue = "30") int horizon) {
        return call(() -> get("/benchmark?horizon=" + horizon));
    }

    @GetMapping("/detect/anomalies")
    public ResponseEntity<Object> anomalies() {
        return call(() -> get("/detect/anomalies"));
    }

    @GetMapping("/insights")
    public ResponseEntity<Object> insights() {
        return call(() -> get("/insights"));
    }

    @PostMapping("/predict/custom")
    public ResponseEntity<Object> predictCustom(@RequestBody Map<String, Object> payload) {
        return call(() -> post("/predict/custom", payload));
    }

    /**
     * Enregistre dans dbo.ml_production_predictions les prévisions affichées. Les métriques et capacités
     * doivent être fournies par le client (issues de /predict/production) : aucune valeur par défaut.
     */
    @PostMapping("/predictions/save")
    public ResponseEntity<Object> savePredictions(@RequestBody Map<String, Object> payload) {
        List<?> rawList = payload.get("predictions") instanceof List<?> l ? l : List.of();
        for (String field : List.of("model_name", "horizon", "mae", "rmse", "mape", "max_capacity")) {
            if (payload.get(field) == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Champ obligatoire manquant : " + field));
            }
        }
        if (rawList.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aucune prévision fournie dans le payload."));
        }

        int horizon = toInt(payload.get("horizon"));
        String modelName = payload.get("model_name").toString();
        double mae = toDouble(payload.get("mae"));
        double rmse = toDouble(payload.get("rmse"));
        String mape = payload.get("mape").toString();
        int maxCapacity = toInt(payload.get("max_capacity"));

        LocalDateTime now = LocalDateTime.now();
        List<ProductionPrediction> entities = new ArrayList<>();
        for (Object item : rawList) {
            if (!(item instanceof Map<?, ?> map) || map.get("date") == null || map.get("quantity") == null) continue;
            int qty = toInt(map.get("quantity"));
            entities.add(ProductionPrediction.builder()
                .forecastDate(LocalDate.parse(map.get("date").toString().substring(0, 10)))
                .prophetQuantity(qty)
                .targetQuantity(qty)
                .maxCapacity(maxCapacity)
                .workingDay(qty > 0)
                .horizonDays(horizon)
                .modelName(modelName)
                .mae(mae)
                .rmse(rmse)
                .mape(mape)
                .totalVolume(payload.get("total_volume") != null ? toInt(payload.get("total_volume")) : null)
                .avgDaily(payload.get("avg_daily") != null ? toInt(payload.get("avg_daily")) : null)
                .maxPeak(payload.get("max_peak") != null ? toInt(payload.get("max_peak")) : null)
                .createdAt(now)
                .build());
        }

        List<ProductionPrediction> saved = productionPredictionRepository.saveAll(entities);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "saved_count", saved.size(),
            "horizon", horizon,
            "saved_at", now.toString()
        ));
    }

    private static int toInt(Object o) {
        return (int) Math.round(toDouble(o));
    }

    private static double toDouble(Object o) {
        return o instanceof Number n ? n.doubleValue() : Double.parseDouble(o.toString());
    }
}
