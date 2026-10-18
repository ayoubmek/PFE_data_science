package com.pfe.platform.config;

import com.pfe.platform.service.ProductionService;
import com.pfe.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Les requêtes DWH sont mises en cache pour la réactivité du portail, puis invalidées toutes les
 * {@code app.cache.ttl-minutes} minutes afin que les écrans reflètent les nouveaux chargements du DWH.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CacheWarmer {

    private final ProductionService productionService;
    private final StockService stockService;
    private final CacheManager cacheManager;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        CompletableFuture.runAsync(this::warm);
    }

    @Scheduled(fixedDelayString = "#{${app.cache.ttl-minutes} * 60000}", initialDelayString = "#{${app.cache.ttl-minutes} * 60000}")
    public void refresh() {
        cacheManager.getCacheNames().forEach(name -> {
            var cache = cacheManager.getCache(name);
            if (cache != null) cache.clear();
        });
        warm();
    }

    private void warm() {
        try {
            long t0 = System.currentTimeMillis();
            productionService.getLatestDeclarations();
            productionService.getAllMachines();
            productionService.getKpi();
            productionService.getDailyStats();
            productionService.getMachineCountBySite();
            stockService.getAllItems();
            stockService.getKpi();
            log.info("[CACHE] Données DWH chargées en {} ms.", System.currentTimeMillis() - t0);
        } catch (Exception e) {
            log.warn("[CACHE] Préchargement DWH impossible : {}", e.getMessage());
        }
    }
}
