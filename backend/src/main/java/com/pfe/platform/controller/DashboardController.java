package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.repository.StockItemRepository;
import com.pfe.platform.service.ProductionService;
import com.pfe.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductionService productionService;
    private final StockService stockService;
    private final StockItemRepository stockRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        ProductionDTO.KpiResponse productionKpi = productionService.getKpi();
        StockDTO.KpiResponse stockKpi = stockService.getKpi();
        summary.put("production", productionKpi);
        summary.put("stock", stockKpi);

        double totalValue = stockKpi.getValeurTotaleStock();
        List<Map<String, Object>> stockGroups = new ArrayList<>();
        for (Object[] r : stockRepository.findStockDistributionByGroup()) {
            double val = r[3] != null ? ((Number) r[3]).doubleValue() : 0.0;
            Map<String, Object> g = new LinkedHashMap<>();
            g.put("name", r[0].toString().trim());
            g.put("count", ((Number) r[1]).longValue());
            g.put("quantity", r[2] != null ? ((Number) r[2]).doubleValue() : 0.0);
            g.put("value", val);
            g.put("percentage", totalValue > 0 ? Math.round(val / totalValue * 1000.0) / 10.0 : 0.0);
            stockGroups.add(g);
        }
        summary.put("stockGroups", stockGroups);

        Map<String, Long> machinesBySite = productionService.getMachineCountBySite();
        List<Map<String, Object>> stockSites = new ArrayList<>();
        for (Object[] r : stockRepository.findStockDistributionBySite()) {
            String site = r[0].toString().trim();
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("site", site);
            s.put("count", ((Number) r[1]).longValue());
            s.put("quantity", r[2] != null ? ((Number) r[2]).doubleValue() : 0.0);
            s.put("value", r[3] != null ? ((Number) r[3]).doubleValue() : 0.0);
            s.put("machines", machinesBySite.entrySet().stream()
                .filter(e -> e.getKey().equalsIgnoreCase(site))
                .map(Map.Entry::getValue).findFirst().orElse(0L));
            stockSites.add(s);
        }
        summary.put("stockSites", stockSites);

        Map<String, Long> statuts = stockKpi.getStatuts();
        summary.put("alerts", Map.of(
            "stockRuptures", statuts.getOrDefault("RUPTURE", 0L),
            "stockCritiques", statuts.getOrDefault("CRITIQUE", 0L),
            "machinesBloquees", productionKpi.getMachinesBloquees()
        ));

        return ResponseEntity.ok(summary);
    }
}
