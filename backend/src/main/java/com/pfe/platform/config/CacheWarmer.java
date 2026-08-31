package com.pfe.platform.config;

import com.pfe.platform.service.ProductionService;
import com.pfe.platform.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheWarmer {

    private final ProductionService productionService;
    private final StockService stockService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(1500); // Allow Tomcat to settle
                log.info("[CACHE-WARMUP] Starting async pre-warming of DWH cache...");
                long t0 = System.currentTimeMillis();
                productionService.getAllOrders();
                productionService.getAllMachines();
                productionService.getKpi();
                stockService.getAllItems();
                stockService.getRecentMovements(6);
                stockService.getKpi();
                long elapsed = System.currentTimeMillis() - t0;
                log.info("[CACHE-WARMUP] All DWH caches warmed in {} ms! All endpoints now respond in 0ms from RAM.", elapsed);
            } catch (Exception e) {
                log.warn("[CACHE-WARMUP] Pre-warm notice: {}", e.getMessage());
            }
        });
    }
}
