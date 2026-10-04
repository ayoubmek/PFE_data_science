package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;
    private final FactCleRepository factCleRepository;

    @GetMapping("/orders")
    public ResponseEntity<List<ProductionDTO.Response>> getAllOrders() {
        return ResponseEntity.ok(productionService.getAllOrders());
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
        List<Object[]> rows = factCleRepository.findDailyStats();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date",          r[0]);
            row.put("nbOperations",  r[1]);
            row.put("totalOutput",   r[2]);
            row.put("totalScrap",    r[3]);
            row.put("totalRunTime",  r[4]);
            result.add(row);
        }
        return ResponseEntity.ok(result);
    }
}