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

    /** Lignes du dernier instantané dbo.ASTOCKDATE, avec le statut de couverture de leur article. */
    @GetMapping("/items")
    public ResponseEntity<List<StockDTO.ItemResponse>> getAllItems() {
        return ResponseEntity.ok(stockService.getAllItems());
    }

    /** Statut de couverture et besoin de réapprovisionnement par article (y compris articles en rupture). */
    @GetMapping("/articles")
    public ResponseEntity<List<StockDTO.ArticleStatus>> getArticleStatuses() {
        return ResponseEntity.ok(stockService.getArticleStatuses());
    }

    @GetMapping("/kpi")
    public ResponseEntity<StockDTO.KpiResponse> getKpi() {
        return ResponseEntity.ok(stockService.getKpi());
    }
}
