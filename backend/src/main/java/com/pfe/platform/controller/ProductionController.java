package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {
    private final ProductionService productionService;

    @GetMapping("/orders")
    public ResponseEntity<List<ProductionDTO.Response>> getLatestDeclarations() {
        return ResponseEntity.ok(productionService.getLatestDeclarations());
    }

    @GetMapping("/kpi")
    public ResponseEntity<ProductionDTO.KpiResponse> getKpi(@RequestParam(defaultValue = ProductionService.PERIOD_MONTH) String period) {
        if (!ProductionService.PERIODS.contains(period)) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(productionService.getKpi(period));
    }

    @GetMapping("/machines")
    public ResponseEntity<List<Map<String, Object>>> getAllMachines() {
        return ResponseEntity.ok(productionService.getAllMachines());
    }

    @GetMapping("/fact-cle/stats")
    public ResponseEntity<List<Map<String, Object>>> getFactCleStats(@RequestParam(defaultValue = ProductionService.PERIOD_MONTH) String period) {
        if (!ProductionService.PERIODS.contains(period)) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(productionService.getStats(period));
    }
}
