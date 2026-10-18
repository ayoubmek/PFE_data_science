package com.pfe.platform.service;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.repository.FactCleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

import static com.pfe.platform.service.StockService.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionService {

    private final FactCleRepository factCleRepo;

    @Value("${app.production.kpi-period-days}")
    private int kpiPeriodDays;

    @Value("${app.production.chart-days}")
    private int chartDays;

    @Value("${app.production.orders-limit}")
    private int ordersLimit;

    @Cacheable(value = "productionOrders", sync = true)
    public List<ProductionDTO.Response> getLatestDeclarations() {
        List<ProductionDTO.Response> list = new ArrayList<>();
        long id = 1;
        for (Object[] r : factCleRepo.findLatestProductionDeclarations(ordersLimit)) {
            ProductionDTO.Response res = new ProductionDTO.Response();
            res.setId(id++);
            res.setReference(str(r[0]));
            res.setItemNo(str(r[1]));
            res.setArticle(str(r[2]));
            res.setQuantiteRealisee(toDouble(r[3]));
            res.setScrapQuantity(toDouble(r[4]));
            res.setRunTime(toDouble(r[5]));
            res.setDateDebut(toDate(r[6]));
            res.setWorkCenter(str(r[7]));
            res.setMachineNom(str(r[8]));
            res.setMachineCode(str(r[9]));
            res.setSite(str(r[10]));
            list.add(res);
        }
        return list;
    }

    @Cacheable(value = "productionKpi", sync = true)
    public ProductionDTO.KpiResponse getKpi() {
        ProductionDTO.KpiResponse kpi = new ProductionDTO.KpiResponse();
        kpi.setPeriodDays(kpiPeriodDays);
        LocalDate last = lastPostingDate();
        if (last == null) return kpi;
        LocalDate start = last.minusDays(kpiPeriodDays - 1L);
        kpi.setPeriodStart(start);
        kpi.setPeriodEnd(last);
        Object[] r = first(factCleRepo.findKpiStats(start));
        if (r != null) {
            kpi.setTotalOrdres(toLong(r[0]));
            kpi.setTotalOperations(toLong(r[1]));
            double output = toDouble(r[2]);
            double scrap = toDouble(r[3]);
            kpi.setTotalVolumeProduit(output);
            kpi.setTotalRebut(scrap);
            kpi.setTotalHeuresMarche(toDouble(r[4]));
            kpi.setTauxConformite(output + scrap > 0 ? Math.round(output / (output + scrap) * 10000.0) / 100.0 : null);
            kpi.setCentresDeCharge(toLong(r[5]));
            kpi.setMachinesActives(toLong(r[6]));
        }
        Object[] m = first(factCleRepo.findMachineCounts());
        if (m != null) {
            kpi.setMachinesTotal(toLong(m[0]));
            kpi.setMachinesBloquees(toLong(m[1]));
        }
        return kpi;
    }

    @Cacheable(value = "productionDaily", sync = true)
    public List<Map<String, Object>> getDailyStats() {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate last = lastPostingDate();
        if (last == null) return result;
        for (Object[] r : factCleRepo.findDailyStats(last.minusDays(chartDays - 1L))) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", toDate(r[0]));
            row.put("nbOperations", toLong(r[1]));
            row.put("totalOutput", toDouble(r[2]));
            row.put("totalScrap", toDouble(r[3]));
            row.put("totalRunTime", toDouble(r[4]));
            result.add(row);
        }
        return result;
    }

    @Cacheable(value = "productionMachines", sync = true)
    public List<Map<String, Object>> getAllMachines() {
        List<Map<String, Object>> result = new ArrayList<>();
        long id = 1;
        for (Object[] r : factCleRepo.findMachineCenterStats()) {
            double output = toDouble(r[6]);
            double scrap = toDouble(r[7]);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", id++);
            row.put("code", str(r[0]));
            row.put("nom", str(r[1]));
            row.put("workCenter", str(r[2]));
            row.put("family", str(r[3]));
            row.put("emplacement", str(r[4]));
            row.put("operationCount", toLong(r[5]));
            row.put("totalOutput", output);
            row.put("totalScrap", scrap);
            row.put("totalRunTime", toDouble(r[8]));
            row.put("tauxConformite", output + scrap > 0 ? Math.round(output / (output + scrap) * 1000.0) / 10.0 : null);
            row.put("efficaciteNominale", r[9] != null ? toDouble(r[9]) : null);
            row.put("capacite", r[10] != null ? toDouble(r[10]) : null);
            row.put("bloquee", toLong(r[11]) == 1);
            row.put("derniereDeclaration", toDate(r[12]));
            result.add(row);
        }
        return result;
    }

    @Cacheable(value = "machinesBySite", sync = true)
    public Map<String, Long> getMachineCountBySite() {
        Map<String, Long> bySite = new LinkedHashMap<>();
        for (Object[] r : factCleRepo.findMachineCountBySite()) {
            bySite.put(str(r[0]), toLong(r[1]));
        }
        return bySite;
    }

    private LocalDate lastPostingDate() {
        java.sql.Date d = factCleRepo.findLastPostingDate();
        return d != null ? d.toLocalDate() : null;
    }

    private static String str(Object o) {
        if (o == null) return null;
        String s = o.toString().trim();
        return s.isEmpty() ? null : s;
    }
}
