package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.service.ProductionService;
import com.pfe.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductionService productionService;
    private final StockService stockService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        ProductionDTO.KpiResponse productionKpi = productionService.getKpi();
        StockDTO.KpiResponse stockKpi = stockService.getKpi();

        summary.put("production", productionKpi);
        summary.put("stock", stockKpi);
        summary.put("alerts", Map.of(
            "stockRuptures", stockKpi.getEnRupture(),
            "stockCritiques", stockKpi.getEnNiveauCritique(),
            "productionRetards", productionKpi.getEnRetard()
        ));

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "PFE Platform API"));
    }
}