package com.pfe.platform.service;

import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StockCoverageService {
    public static final List<String> STATUSES =
        List.of("RUPTURE", "CRITIQUE", "NORMAL", "SURSTOCK", "INACTIF", "SANS_CONSOMMATION");

    private final StockItemRepository stockRepo;

    @Value("${app.stock.conso-window-days}")
    private int windowDays;
    @Value("${app.stock.rupture-recent-days}")
    private int recentDays;
    @Value("${app.stock.critique-days}")
    private int critiqueDays;
    @Value("${app.stock.surstock-days}")
    private int surstockDays;
    @Value("${app.stock.coverage-target-days}")
    private int coverageTargetDays;

    @Cacheable(value = "stockCoverage", sync = true)
    public Map<String, StockDTO.ArticleStatus> computeArticleStatuses() {
        Map<String, StockDTO.ArticleStatus> result = new LinkedHashMap<>();
        for (Object[] r : stockRepo.findArticleCoverageData(windowDays, recentDays)) {
            StockDTO.ArticleStatus a = new StockDTO.ArticleStatus();
            a.setReference(str(r[0]));
            a.setDesignation(str(r[1]));
            a.setCategorie(str(r[2]));
            a.setCoutUnitaire(r[3] != null ? ((Number) r[3]).doubleValue() : null);
            a.setStock(num(r[4]));
            a.setValeur(num(r[5]));
            double daily = Math.max(0.0, num(r[6])) / windowDays;
            double recentOut = num(r[7]);
            a.setConsommationJournaliere(daily);
            classify(a, daily, recentOut);
            if ("RUPTURE".equals(a.getStatut()) || "CRITIQUE".equals(a.getStatut())) {
                double need = Math.ceil(daily * coverageTargetDays) - Math.max(0.0, a.getStock());
                a.setQuantiteACommander(Math.max(0.0, need));
                a.setMontantCommande(a.getCoutUnitaire() != null ? a.getQuantiteACommander() * a.getCoutUnitaire() : null);
            }
            result.put(a.getReference(), a);
        }
        return result;
    }

    private void classify(StockDTO.ArticleStatus a, double daily, double recentOut) {
        double stock = a.getStock();
        if (daily <= 0) {
            a.setStatut(stock <= 0 ? "INACTIF" : "SANS_CONSOMMATION");
            return;
        }
        if (stock <= 0) {
            a.setStatut(recentOut > 0 ? "RUPTURE" : "INACTIF");
            a.setCouvertureJours(0.0);
            return;
        }
        double coverage = stock / daily;
        a.setCouvertureJours(coverage);
        a.setStatut(coverage < critiqueDays ? "CRITIQUE" : coverage < surstockDays ? "NORMAL" : "SURSTOCK");
    }

    public Map<String, Long> countByStatus(Collection<StockDTO.ArticleStatus> articles) {
        Map<String, Long> counts = new LinkedHashMap<>();
        STATUSES.forEach(s -> counts.put(s, 0L));
        articles.forEach(a -> counts.merge(a.getStatut(), 1L, Long::sum));
        return counts;
    }

    public StockDTO.ReplenishmentPlan replenishmentPlan(Collection<StockDTO.ArticleStatus> articles) {
        StockDTO.ReplenishmentPlan plan = new StockDTO.ReplenishmentPlan();
        plan.setHorizonJours(coverageTargetDays);
        for (StockDTO.ArticleStatus a : articles) {
            if (a.getQuantiteACommander() <= 0) continue;
            plan.setNbReferences(plan.getNbReferences() + 1);
            plan.setQuantiteTotale(plan.getQuantiteTotale() + a.getQuantiteACommander());
            if (a.getMontantCommande() != null) {
                plan.setBudgetTnd(plan.getBudgetTnd() + a.getMontantCommande());
            } else {
                plan.setNbReferencesSansCout(plan.getNbReferencesSansCout() + 1);
            }
        }
        return plan;
    }

    private static String str(Object o) {
        return o != null ? o.toString().trim() : null;
    }

    private static double num(Object o) {
        return o != null ? ((Number) o).doubleValue() : 0.0;
    }
}
