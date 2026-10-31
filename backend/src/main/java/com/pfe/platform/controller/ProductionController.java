package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
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

    @GetMapping("/machines")
    public ResponseEntity<List<Map<String, Object>>> getAllMachines() {
        return ResponseEntity.ok(productionService.getAllMachines());
    }

    @GetMapping("/fact-cle/stats")
    public ResponseEntity<List<Map<String, Object>>> getFactCleStats(@RequestParam(defaultValue = ProductionService.PERIOD_MONTH) String period,
                                                                     @RequestParam(required = false) String month) {
        if (!ProductionService.PERIODS.contains(period)) return ResponseEntity.badRequest().build();
        YearMonth ym;
        try {
            ym = month == null || month.isBlank() ? null : YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productionService.getStats(period, ym));
    }
}
