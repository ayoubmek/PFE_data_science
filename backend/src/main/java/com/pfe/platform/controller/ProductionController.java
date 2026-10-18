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

    /** Dernières déclarations de production (dbo.FACT_CLE), les plus récentes d'abord. */
    @GetMapping("/orders")
    public ResponseEntity<List<ProductionDTO.Response>> getLatestDeclarations() {
        return ResponseEntity.ok(productionService.getLatestDeclarations());
    }

    @GetMapping("/kpi")
    public ResponseEntity<ProductionDTO.KpiResponse> getKpi() {
        return ResponseEntity.ok(productionService.getKpi());
    }

    @GetMapping("/machines")
    public ResponseEntity<List<Map<String, Object>>> getAllMachines() {
        return ResponseEntity.ok(productionService.getAllMachines());
    }

    @GetMapping("/fact-cle/stats")
    public ResponseEntity<List<Map<String, Object>>> getFactCleStats() {
        return ResponseEntity.ok(productionService.getDailyStats());
    }
}
