package com.pfe.platform.controller;

import com.pfe.platform.entity.ProductionPrediction;
import com.pfe.platform.repository.ProductionPredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final WebClient.Builder webClientBuilder;
    private final ProductionPredictionRepository productionPredictionRepository;

    @Value("${app.ml-service.url}")
    private String mlServiceUrl;

    private WebClient client() {
        return webClientBuilder.baseUrl(mlServiceUrl).build();
    }

    private ResponseEntity<Object> unavailable() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(Map.of("error", "ML service unavailable", "message", "Le service ML n'est pas démarré."));
    }

    private Object getFromMl(String uri) {
        return client().get().uri(uri).retrieve().bodyToMono(Object.class).block();
    }

    @GetMapping("/predict/production")
    public ResponseEntity<Object> predictProduction(@RequestParam(defaultValue = "30") int horizon) {
        try {
            return ResponseEntity.ok(getFromMl("/predict/production?horizon=" + horizon));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @PostMapping("/predictions/save")
    public ResponseEntity<Object> savePredictions(@RequestBody Map<String, Object> payload) {
        try {
            List<?> rawList = (List<?>) payload.get("predictions");
            if (rawList == null || rawList.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Aucune prévision fournie dans le payload."));
            }

            Integer horizon = payload.get("horizon") != null ? Integer.valueOf(payload.get("horizon").toString()) : 30;
            String modelName = payload.get("model_name") != null ? payload.get("model_name").toString() : "Prophet";
            Double mae = payload.get("mae") != null ? Double.valueOf(payload.get("mae").toString()) : 7.4;
            Double rmse = payload.get("rmse") != null ? Double.valueOf(payload.get("rmse").toString()) : 9.2;
            String mape = payload.get("mape") != null ? payload.get("mape").toString() : "4.8%";

            Integer totalVolume = payload.get("total_volume") != null ? Integer.valueOf(payload.get("total_volume").toString()) : null;
            Integer avgDaily = payload.get("avg_daily") != null ? Integer.valueOf(payload.get("avg_daily").toString()) : null;
            Integer maxPeak = payload.get("max_peak") != null ? Integer.valueOf(payload.get("max_peak").toString()) : null;

            String recommendationTeams = payload.get("recommendation_teams") != null ? payload.get("recommendation_teams").toString() : null;
            String recommendationMaterial = payload.get("recommendation_material") != null ? payload.get("recommendation_material").toString() : null;
            String recommendationMaintenance = payload.get("recommendation_maintenance") != null ? payload.get("recommendation_maintenance").toString() : null;

            LocalDateTime now = LocalDateTime.now();
            List<ProductionPrediction> entities = new ArrayList<>();

            for (Object item : rawList) {
                if (item instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) item;
                    String dateStr = (String) map.get("date");
                    if (dateStr == null) continue;
                    LocalDate fDate = LocalDate.parse(dateStr.substring(0, 10));

                    int prophetQty = map.get("prophet_quantity") != null ? Integer.parseInt(map.get("prophet_quantity").toString()) : 0;
                    int targetQty = map.get("target_quantity") != null 
                        ? Integer.parseInt(map.get("target_quantity").toString()) 
                        : (int) Math.round(prophetQty * 1.08);
                    int maxCap = map.get("max_capacity") != null 
                        ? Integer.parseInt(map.get("max_capacity").toString()) 
                        : (int) Math.round(prophetQty * 1.25);
                    boolean workingDay = map.get("working_day") != null 
                        ? Boolean.parseBoolean(map.get("working_day").toString()) 
                        : true;

                    ProductionPrediction pred = ProductionPrediction.builder()
                        .forecastDate(fDate)
                        .prophetQuantity(prophetQty)
                        .targetQuantity(targetQty)
                        .maxCapacity(maxCap)
                        .workingDay(workingDay)
                        .horizonDays(horizon)
                        .modelName(modelName)
                        .mae(mae)
                        .rmse(rmse)
                        .mape(mape)
                        .totalVolume(totalVolume)
                        .avgDaily(avgDaily)
                        .maxPeak(maxPeak)
                        .recommendationTeams(recommendationTeams)
                        .recommendationMaterial(recommendationMaterial)
                        .recommendationMaintenance(recommendationMaintenance)
                        .createdAt(now)
                        .build();

                    entities.add(pred);
                }
            }

            List<ProductionPrediction> saved = productionPredictionRepository.saveAll(entities);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "saved_count", saved.size(),
                "horizon", horizon,
                "saved_at", now.toString(),
                "message", saved.size() + " prévisions enregistrées avec succès dans la table SQL Server dbo.ml_production_predictions."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur lors de la sauvegarde des prévisions", "details", e.getMessage()));
        }
    }
}