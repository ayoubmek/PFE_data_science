package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.service.ProductionService;
import com.pfe.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductionService productionService;
    private final StockService stockService;
    private final FactCleRepository factCleRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        ProductionDTO.KpiResponse productionKpi = productionService.getKpi();
        StockDTO.KpiResponse stockKpi = stockService.getKpi();

        summary.put("production", productionKpi);
        summary.put("stock", stockKpi);

        // Groupes de stock réels issus de dbo.ASTOCKDATE
        List<Map<String, Object>> stockGroups = new ArrayList<>();
        try {
            List<Object[]> rows = factCleRepository.findStockDistributionByGroup();
            double totalValSum = 0.0;
            for (Object[] r : rows) {
                double val = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
                totalValSum += val;
            }
            for (Object[] r : rows) {
                String rawName = r[0] != null ? r[0].toString().trim() : "Autres";
                String cleanName = rawName.contains("Mati") ? "Matières Premières" : rawName;
                long count = r[1] != null ? ((Number) r[1]).longValue() : 0;
                double qte = r[2] != null ? ((Number) r[2]).doubleValue() : 0.0;
                double val = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
                double pct = totalValSum > 0 ? Math.round((val / totalValSum) * 1000.0) / 10.0 : 0.0;
                Map<String, Object> g = new HashMap<>();
                g.put("name", cleanName);
                g.put("count", count);
                g.put("quantity", qte);
                g.put("value", val);
                g.put("percentage", pct);
                stockGroups.add(g);
            }
        } catch (Exception ignored) {}
        summary.put("stockGroups", stockGroups);

        // Sites de stock réels issus de dbo.ASTOCKDATE
        List<Map<String, Object>> stockSites = new ArrayList<>();
        try {
            List<Object[]> siteRows = factCleRepository.findStockDistributionBySite();
            for (Object[] r : siteRows) {
                String site = r[0] != null ? r[0].toString().trim() : "Site";
                long count = r[1] != null ? ((Number) r[1]).longValue() : 0;
                double qte = r[2] != null ? ((Number) r[2]).doubleValue() : 0.0;
                double val = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
                Map<String, Object> s = new HashMap<>();
                s.put("site", site);
                s.put("count", count);
                s.put("quantity", qte);
                s.put("value", val);
                stockSites.add(s);
            }
        } catch (Exception ignored) {}
        summary.put("stockSites", stockSites);

        summary.put("alerts", Map.of(
            "stockRuptures", 3,
            "stockCritiques", 12,
            "productionRetards", 0
        ));

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "PFE Platform API"));
    }
}