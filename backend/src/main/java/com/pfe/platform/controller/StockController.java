package com.pfe.platform.controller;

import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;



    // ── ITEMS ──────────────────────────────────────────────────────────────

    @GetMapping("/items")
    public ResponseEntity<List<StockDTO.ItemResponse>> getAllItems() {
        return ResponseEntity.ok(stockService.getAllItems());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<StockDTO.ItemResponse> getItemById(@PathVariable String id) {
        return ResponseEntity.ok(stockService.getItemById(id));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StockDTO.ItemResponse> createItem(@Valid @RequestBody StockDTO.ItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.createItem(request));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<StockDTO.ItemResponse> updateItem(
            @PathVariable String id,
            @Valid @RequestBody StockDTO.ItemRequest request) {
        return ResponseEntity.ok(stockService.updateItem(id, request));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        stockService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // ── MOVEMENTS ──────────────────────────────────────────────────────────

    @PostMapping("/movements")
    public ResponseEntity<StockDTO.MovementResponse> createMovement(
            @Valid @RequestBody StockDTO.MovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.createMovement(request));
    }

    @GetMapping("/movements/item/{reference}")
    public ResponseEntity<List<StockDTO.MovementResponse>> getMovementsForItem(@PathVariable String reference) {
        return ResponseEntity.ok(stockService.getMovementsForItem(reference));
    }

    @GetMapping("/movements/recent")
    public ResponseEntity<List<StockDTO.MovementResponse>> getRecentMovements(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(stockService.getRecentMovements(months));
    }

    // ── ALERTS ──────────────────────────────────────────────────────────────

    @GetMapping("/alerts")
    public ResponseEntity<List<StockDTO.ItemResponse>> getAlertes() {
        return ResponseEntity.ok(stockService.getAlertes());
    }

    @GetMapping("/alerts/critiques")
    public ResponseEntity<List<StockDTO.ItemResponse>> getCritiques() {
        return ResponseEntity.ok(stockService.getNiveauxCritiques());
    }

    @GetMapping("/alerts/ruptures")
    public ResponseEntity<List<StockDTO.ItemResponse>> getRuptures() {
        return ResponseEntity.ok(stockService.getRuptures());
    }

    // ── KPI ──────────────────────────────────────────────────────────────

    @GetMapping("/kpi")
    public ResponseEntity<StockDTO.KpiResponse> getKpi() {
        return ResponseEntity.ok(stockService.getKpi());
    }

    @GetMapping("/history")
    public ResponseEntity<List<StockDTO.HistoryResponse>> getHistory(
            @RequestParam(defaultValue = "200") int limit) {
        return ResponseEntity.ok(stockService.getHistory(limit));
    }
}
