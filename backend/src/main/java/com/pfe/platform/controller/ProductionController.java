package com.pfe.platform.controller;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.entity.Machine;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.repository.MachineRepository;
import com.pfe.platform.service.ProductionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.pfe.platform.service.SseService;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;
    private final MachineRepository machineRepository;
    private final FactCleRepository factCleRepository;
    private final SseService sseService;

    // ── PRODUCTION ORDERS ─────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<ProductionDTO.Response>> getAllOrders() {
        return ResponseEntity.ok(productionService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ProductionDTO.Response> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(productionService.getOrderById(id));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProductionDTO.Response> createOrder(@Valid @RequestBody ProductionDTO.Request request) {
        ProductionDTO.Response res = productionService.createOrder(request);
        sseService.broadcastMachineEvent("ORDER_CREATED", res);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PutMapping("/orders/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProductionDTO.Response> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody ProductionDTO.Request request) {
        ProductionDTO.Response res = productionService.updateOrder(id, request);
        sseService.broadcastMachineEvent("ORDER_UPDATED", res);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/orders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        productionService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders/retardes")
    public ResponseEntity<List<ProductionDTO.Response>> getRetardes() {
        return ResponseEntity.ok(productionService.getRetardes());
    }

    // ── KPI ───────────────────────────────────────────────────────────────

    @GetMapping("/kpi")
    public ResponseEntity<ProductionDTO.KpiResponse> getKpi() {
        return ResponseEntity.ok(productionService.getKpi());
    }

    // ── MACHINES (Work Centers from FACT_CLE) ────────────────────────────────

    @GetMapping("/machines")
    public ResponseEntity<List<Map<String, Object>>> getAllMachines() {
        List<Object[]> rows = factCleRepository.findWorkCenterStats();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            String wc      = r[0] != null ? r[0].toString().trim() : "N/A";
            long opCount   = r[1] != null ? ((Number) r[1]).longValue() : 0;
            double output  = r[2] != null ? ((Number) r[2]).doubleValue() : 0;
            double scrap   = r[3] != null ? ((Number) r[3]).doubleValue() : 0;
            double runTime = r[4] != null ? ((Number) r[4]).doubleValue() : 0;
            double efficiency = (output + scrap) > 0
                ? Math.round(output / (output + scrap) * 1000.0) / 10.0 : 100.0;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("nom",            wc);
            row.put("code",           wc);
            row.put("type",           "Poste de travail");
            row.put("emplacement",    "Atelier Production");
            row.put("statut",         "DISPONIBLE");
            row.put("tauxRendement",  efficiency);
            row.put("totalOutput",    Math.round(output));
            row.put("totalScrap",     Math.round(scrap));
            row.put("totalRunTime",   Math.round(runTime));
            row.put("operationCount", opCount);
            result.add(row);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/machines/{id}")
    public ResponseEntity<Machine> getMachineById(@PathVariable Long id) {
        return ResponseEntity.ok(machineRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Machine non trouvée: " + id)));
    }

    @PostMapping("/machines")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Machine> createMachine(@RequestBody Machine machine) {
        return ResponseEntity.status(HttpStatus.CREATED).body(machineRepository.save(machine));
    }

    @PutMapping("/machines/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Machine> updateMachine(@PathVariable Long id, @RequestBody Machine updated) {
        Machine machine = machineRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Machine non trouvée: " + id));
        machine.setNom(updated.getNom());
        machine.setType(updated.getType());
        machine.setEmplacement(updated.getEmplacement());
        machine.setStatut(updated.getStatut());
        machine.setTauxRendement(updated.getTauxRendement());
        machine.setDerniereMaintenance(updated.getDerniereMaintenance());
        machine.setProchaineMaintenance(updated.getProchaineMaintenance());
        return ResponseEntity.ok(machineRepository.save(machine));
    }

    @DeleteMapping("/machines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMachine(@PathVariable Long id) {
        machineRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── FACT_CLE (Real SQL Server production data) ────────────────────────

    @GetMapping("/fact-cle")
    public ResponseEntity<List<Map<String, Object>>> getFactCle() {
        List<Object[]> rows = factCleRepository.findTop200Raw();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("entryNo",              r[0]);
            row.put("dataBase",             r[1]);
            row.put("no",                   r[2]);
            row.put("postingDate",          r[3]);
            row.put("type",                 r[4]);
            row.put("documentNo",           r[5]);
            row.put("description",          r[6]);
            row.put("operationNo",          r[7]);
            row.put("workCenterNo",         r[8]);
            row.put("outputQuantity",       r[9]);
            row.put("scrapQuantity",        r[10]);
            row.put("runTime",              r[11]);
            row.put("itemNo",               r[12]);
            row.put("workShiftCode",        r[13]);
            row.put("quantiteProduitesTrs", r[14]);
            result.add(row);
        }
        return ResponseEntity.ok(result);
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
