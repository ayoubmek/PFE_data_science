package com.pfe.platform.service;

import com.pfe.platform.dto.ProductionDTO;
import com.pfe.platform.repository.FactCleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import static com.pfe.platform.service.StockService.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionService {
    public static final String PERIOD_MONTH = "mois";
    public static final String PERIOD_YEAR = "annee";
    public static final String PERIOD_ALL = "tout";
    public static final List<String> PERIODS = List.of(PERIOD_MONTH, PERIOD_YEAR, PERIOD_ALL);

    private final FactCleRepository factCleRepo;

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
    public ProductionDTO.KpiResponse getKpi(String period) {
        ProductionDTO.KpiResponse kpi = new ProductionDTO.KpiResponse();
        kpi.setPeriod(period);
        LocalDate last = lastPostingDate();
        if (last == null) return kpi;
        LocalDate start = periodStart(period, last);
        kpi.setPeriodStart(start);
        kpi.setPeriodEnd(last);
        java.sql.Date first = factCleRepo.findFirstPostingDate();
        kpi.setDataStart(first != null ? first.toLocalDate() : null);
        Object[] r = first(factCleRepo.findKpiStats(start));
        if (r != null) {
            kpi.setTotalVolumeProduit(toDouble(r[0]));
            kpi.setTotalRebut(toDouble(r[1]));
        }
        Object[] m = first(factCleRepo.findMachineCounts());
        if (m != null) {
            kpi.setMachinesTotal(toLong(m[0]));
        }
        return kpi;
    }

    @Cacheable(value = "productionDaily", sync = true)
    public List<Map<String, Object>> getStats(String period, YearMonth month) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate last = lastPostingDate();
        if (last == null) return result;
        boolean monthly = isMonthly(period);
        boolean chosenMonth = month != null && !monthly;
        LocalDate start = chosenMonth ? month.atDay(1) : periodStart(period, last);
        LocalDate end = chosenMonth ? month.plusMonths(1).atDay(1) : last.plusDays(1);
        List<Object[]> rows = monthly ? factCleRepo.findMonthlyStats(start) : factCleRepo.findDailyStats(start, end);
        for (Object[] r : rows) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", toDate(r[0]));
            row.put("totalOutput", toDouble(r[1]));
            row.put("totalScrap", toDouble(r[2]));
            row.put("totalTrs", toDouble(r[3]));
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
            row.put("tauxConformite", output + scrap > 0 ? Math.round(output / (output + scrap) * 1000.0) / 10.0 : null);
            row.put("efficaciteNominale", r[8] != null ? toDouble(r[8]) : null);
            row.put("bloquee", toLong(r[9]) == 1);
            row.put("derniereDeclaration", toDate(r[10]));
            result.add(row);
        }
        return result;
    }

    public static boolean isMonthly(String period) {
        return PERIOD_YEAR.equals(period) || PERIOD_ALL.equals(period);
    }

    private LocalDate periodStart(String period, LocalDate last) {
        return switch (period) {
            case PERIOD_YEAR -> last.withDayOfMonth(1).minusMonths(11);
            case PERIOD_ALL -> {
                java.sql.Date first = factCleRepo.findFirstPostingDate();
                yield first != null ? first.toLocalDate() : last;
            }
            default -> last.withDayOfMonth(1);
        };
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
