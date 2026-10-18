package com.pfe.platform.service;

import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.entity.StockItem;
import com.pfe.platform.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final StockItemRepository itemRepo;
    private final StockCoverageService coverageService;

    @Cacheable(value = "stockItems", sync = true)
    public List<StockDTO.ItemResponse> getAllItems() {
        Map<String, StockDTO.ArticleStatus> statuses = coverageService.computeArticleStatuses();
        List<StockDTO.ItemResponse> items = new ArrayList<>();
        for (StockItem s : itemRepo.findAllLatestSnapshot()) {
            items.add(toItemResponse(s, statuses.get(s.getReference())));
        }
        return items;
    }

    public List<StockDTO.ArticleStatus> getArticleStatuses() {
        return new ArrayList<>(coverageService.computeArticleStatuses().values());
    }

    @Cacheable(value = "stockKpi", sync = true)
    public StockDTO.KpiResponse getKpi() {
        StockDTO.KpiResponse kpi = new StockDTO.KpiResponse();

        Object[] totals = first(itemRepo.findSnapshotTotals());
        if (totals != null) {
            kpi.setDateStock(toDate(totals[0]));
            kpi.setTotalArticles(toLong(totals[1]));
            kpi.setTotalLignes(toLong(totals[2]));
            kpi.setQuantiteTotale(toDouble(totals[3]));
            kpi.setValeurTotaleStock(toDouble(totals[4]));
        }

        Collection<StockDTO.ArticleStatus> articles = coverageService.computeArticleStatuses().values();
        kpi.setNbArticlesSuivis(articles.size());
        kpi.setStatuts(coverageService.countByStatus(articles));
        kpi.setReapprovisionnement(coverageService.replenishmentPlan(articles));
        kpi.setRegles(coverageService.rules());

        Object[] moves = first(itemRepo.findLastDayMovements());
        if (moves != null) {
            kpi.setDateMouvements(toDate(moves[0]));
            kpi.setTotalEntreesJour(moves[1] != null ? toDouble(moves[1]) : null);
            kpi.setTotalSortiesJour(moves[2] != null ? toDouble(moves[2]) : null);
        }
        return kpi;
    }

    private StockDTO.ItemResponse toItemResponse(StockItem s, StockDTO.ArticleStatus status) {
        StockDTO.ItemResponse r = new StockDTO.ItemResponse();
        r.setId(s.getReference() + "|" + s.getEmplacement() + "|" + s.getEncours());
        r.setReference(s.getReference());
        r.setDesignation(s.getDesignation());
        r.setCategorie(s.getCategorie());
        r.setEmplacement(s.getEmplacement());
        r.setDateStock(s.getDateStock());
        r.setEncours(s.getEncours());
        r.setGenProdPostingGroup(s.getGenProdPostingGroup());
        r.setNomAbrege(s.getNomAbrege());
        r.setGroupeClient(s.getGroupeClient());
        r.setQuantite(s.getQuantite());
        r.setValeurTotale(s.getValeurTotale());
        BigDecimal unit = s.getValeurUnitaire();
        r.setValeurUnitaire(unit);
        if (status != null) {
            r.setStatut(status.getStatut());
            r.setCouvertureJours(status.getCouvertureJours());
            r.setConsommationJournaliere(status.getConsommationJournaliere());
        }
        return r;
    }

    static Object[] first(List<Object[]> rows) {
        return rows == null || rows.isEmpty() ? null : rows.get(0);
    }

    static long toLong(Object o) {
        return o != null ? ((Number) o).longValue() : 0L;
    }

    static double toDouble(Object o) {
        return o != null ? ((Number) o).doubleValue() : 0.0;
    }

    static LocalDate toDate(Object o) {
        if (o == null) return null;
        if (o instanceof java.sql.Date d) return d.toLocalDate();
        if (o instanceof java.sql.Timestamp t) return t.toLocalDateTime().toLocalDate();
        if (o instanceof LocalDate d) return d;
        if (o instanceof java.time.LocalDateTime dt) return dt.toLocalDate();
        return LocalDate.parse(o.toString().substring(0, 10));
    }
}
