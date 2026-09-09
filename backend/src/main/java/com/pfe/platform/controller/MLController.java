package com.pfe.platform.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final WebClient.Builder webClientBuilder;

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

    private Object postToMl(String uri, Object body) {
        return client().post().uri(uri).bodyValue(body).retrieve().bodyToMono(Object.class).block();
    }

    @GetMapping("/predict/stock")
    public ResponseEntity<Object> predictStock(
            @RequestParam(defaultValue = "1") Long itemId,
            @RequestParam(defaultValue = "30") int horizon) {
        try {
            return ResponseEntity.ok(getFromMl("/predict/stock?item_id=" + itemId + "&horizon=" + horizon));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @GetMapping("/predict/production")
    public ResponseEntity<Object> predictProduction(@RequestParam(defaultValue = "30") int horizon) {
        try {
            return ResponseEntity.ok(getFromMl("/predict/production?horizon=" + horizon));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @PostMapping("/detect/anomaly")
    public ResponseEntity<Object> detectAnomaly(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(postToMl("/detect/anomaly", payload));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @PostMapping("/predict/custom")
    public ResponseEntity<Object> predictCustom(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(postToMl("/predict/custom", payload));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @PostMapping("/cluster/custom")
    public ResponseEntity<Object> clusterCustom(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(postToMl("/cluster/custom", payload));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @PostMapping("/simulate/scenario")
    public ResponseEntity<Object> simulateScenario(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(postToMl("/simulate/scenario", payload));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @GetMapping("/analyze/abc")
    public ResponseEntity<Object> analyzeAbc() {
        try {
            return ResponseEntity.ok(getFromMl("/analyze/abc"));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @GetMapping("/analyze/stats")
    public ResponseEntity<Object> analyzeStats() {
        try {
            return ResponseEntity.ok(getFromMl("/analyze/stats"));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @GetMapping("/cluster/items")
    public ResponseEntity<Object> clusterItems() {
        try {
            return ResponseEntity.ok(getFromMl("/cluster/items"));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @GetMapping("/insights")
    public ResponseEntity<Object> getInsights() {
        try {
            return ResponseEntity.ok(getFromMl("/insights"));
        } catch (Exception e) {
            return unavailable();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Object> mlHealth() {
        try {
            return ResponseEntity.ok(getFromMl("/health"));
        } catch (Exception e) {
            return unavailable();
        }
    }
}