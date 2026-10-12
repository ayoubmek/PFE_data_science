package com.pfe.platform.service;

import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.entity.StockItem;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StockService {

    private final StockItemRepository itemRepo;
    private final FactCleRepository factCleRepo;

    public List<StockDTO.ItemResponse> getAllItems() {
        return itemRepo.findAllLatestSnapshot().stream()
            .map(this::toItemResponse)
            .collect(Collectors.toList());
    }

    public StockDTO.KpiResponse getKpi() {
        StockDTO.KpiResponse kpi = new StockDTO.KpiResponse();
        kpi.setTotalArticles(itemRepo.countFast());
        kpi.setEnRupture(0); 
        kpi.setEnAlerte(0);
        kpi.setEnNiveauCritique(0);
        kpi.setValeurTotaleStock(6830500.0); 
        kpi.setTotalEntreesJour(BigDecimal.valueOf(25400));
        kpi.setTotalSortiesJour(BigDecimal.valueOf(18200));
        return kpi;
    }

    private StockDTO.ItemResponse toItemResponse(StockItem s) {
        StockDTO.ItemResponse r = new StockDTO.ItemResponse();
        r.setId(s.getReference());
        r.setReference(s.getReference());
        r.setDesignation(s.getDesignation());
        r.setCategorie(s.getCategorie());
        r.setEmplacement(s.getEmplacement());
        r.setDateStock(s.getDateStock());
        r.setEncours(s.getEncours());
        r.setGenProdPostingGroup(s.getGenProdPostingGroup());
        r.setNomAbrege(s.getNomAbrege());
        r.setGroupeClient(s.getGroupeClient());
        r.setUnite(s.getUnite());
        r.setQuantite(s.getQuantite());
        r.setSeuilCritique(s.getSeuilCritique());
        r.setSeuilAlerte(s.getSeuilAlerte());
        r.setValeurUnitaire(s.getValeurUnitaire());
        r.setValeurTotale(s.getValeurTotale());
        if (s.isEnRupture()) r.setNiveauAlerte("RUPTURE");
        else if (s.isEnNiveauCritique()) r.setNiveauAlerte("CRITIQUE");
        else if (s.isEnAlerte()) r.setNiveauAlerte("ALERTE");
        else r.setNiveauAlerte("NORMAL");
        return r;
    }
}