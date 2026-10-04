package com.pfe.platform.controller;

import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/items")
    public ResponseEntity<List<StockDTO.ItemResponse>> getAllItems() {
        return ResponseEntity.ok(stockService.getAllItems());
    }

    @GetMapping("/movements/recent")
    public ResponseEntity<List<StockDTO.MovementResponse>> getRecentMovements(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(stockService.getRecentMovements(months));
    }

    @GetMapping("/kpi")
    public ResponseEntity<StockDTO.KpiResponse> getKpi() {
        return ResponseEntity.ok(stockService.getKpi());
    }
}