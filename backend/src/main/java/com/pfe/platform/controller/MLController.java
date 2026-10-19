package com.pfe.platform.controller;

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
import java.util.Map;
import java.util.function.Supplier;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MLController {
    private final WebClient.Builder webClientBuilder;

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
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (WebClientRequestException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "ML service unavailable", "message", "Le service ML est injoignable : " + mlServiceUrl));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body(Map.of("error", "ML service timeout", "message", e.getMessage()));
        }
    }

    @GetMapping("/predict/production")
    public ResponseEntity<Object> predictProduction(@RequestParam(defaultValue = "30") int horizon,
                                                    @RequestParam(required = false) LocalDate start) {
        String uri = "/predict/production?horizon=" + horizon + (start != null ? "&start=" + start : "");
        return call(() -> client().get().uri(uri).retrieve().bodyToMono(Object.class)
            .block(Duration.ofSeconds(timeoutSeconds)));
    }

    @PostMapping("/predict/custom")
    public ResponseEntity<Object> predictCustom(@RequestBody Map<String, Object> payload) {
        return call(() -> client().post().uri("/predict/custom").bodyValue(payload).retrieve().bodyToMono(Object.class)
            .block(Duration.ofSeconds(timeoutSeconds)));
    }
}
