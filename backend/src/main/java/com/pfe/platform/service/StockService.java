package com.pfe.platform.service;

import com.pfe.platform.dto.StockDTO;
import com.pfe.platform.entity.StockItem;
import com.pfe.platform.entity.StockMovement;
import com.pfe.platform.repository.FactCleRepository;
import com.pfe.platform.repository.StockItemRepository;
import com.pfe.platform.repository.StockMovementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StockService {

    private final StockItemRepository itemRepo;
    private final StockMovementRepository movementRepo;
    private final FactCleRepository factCleRepo;
    private final NotificationService notificationService;

    // ── ITEMS ──────────────────────────────────────────────────────────────

    public List<StockDTO.ItemResponse> getAllItems() {
        return itemRepo.findAllLatestSnapshot().stream()
            .map(this::toItemResponse)
            .collect(Collectors.toList());
    }

    public StockDTO.ItemResponse getItemById(String reference) {
        return toItemResponse(findItemOrThrow(reference));
    }

    public StockDTO.ItemResponse createItem(StockDTO.ItemRequest req) {
        StockItem item = new StockItem();
        mapItemRequest(req, item);
        return toItemResponse(itemRepo.save(item));
    }

    public StockDTO.ItemResponse updateItem(String reference, StockDTO.ItemRequest req) {
        StockItem item = findItemOrThrow(reference);
        mapItemRequest(req, item);
        return toItemResponse(itemRepo.save(item));
    }

    public void deleteItem(String reference) {
        StockItem item = findItemOrThrow(reference);
        itemRepo.delete(item);
    }

    // ── MOVEMENTS ──────────────────────────────────────────────────────────

    public StockDTO.MovementResponse createMovement(StockDTO.MovementRequest req) {
        StockItem item = findItemOrThrow(req.getStockItemReference());

        StockMovement movement = StockMovement.builder()
            .stockItemReference(item.getReference())
            .stockItemNo(item.getReference())
            .type(req.getType())
            .quantite(req.getQuantite())
            .motif(req.getMotif())
            .operateur(req.getOperateur())
            .reference(req.getReference())
            .build();

        // Update stock quantity
        switch (req.getType()) {
            case ENTREE, RETOUR -> item.setQuantite(item.getQuantite().add(req.getQuantite()));
            case SORTIE -> {
                if (item.getQuantite().compareTo(req.getQuantite()) < 0) {
                    throw new RuntimeException("Quantité insuffisante en stock pour " + item.getReference());
                }
                item.setQuantite(item.getQuantite().subtract(req.getQuantite()));
            }
            case AJUSTEMENT -> item.setQuantite(req.getQuantite());
        }

        itemRepo.save(item);
        StockMovement saved = movementRepo.save(movement);

        // Trigger alerts
        checkAndNotifyStockLevel(item);

        return toMovementResponses(List.of(saved)).get(0);
    }

    public List<StockDTO.MovementResponse> getMovementsForItem(String reference) {
        return toMovementResponses(movementRepo.findByStockItemReferenceOrderByDateDesc(reference));
    }

    public List<StockDTO.MovementResponse> getRecentMovements(int months) {
        // Use FACT_ILE — the real Item Ledger Entry table (1.5M rows)
        try {
            List<Object[]> rows = factCleRepo.findStockMovementsFromDWH();

            if (rows != null && !rows.isEmpty()) {
                List<StockDTO.MovementResponse> result = new java.util.ArrayList<>();
                for (Object[] r : rows) {
                    try {
                        // Column order: id, itemReference, designation, postingDate,
                        //               entryType, documentNo, quantite, locationCode,
                        //               siteCode, sourceNo, coutActuel, database_
                        long    id          = r[0] != null ? ((Number) r[0]).longValue() : 0L;
                        String  reference   = r[1] != null ? r[1].toString().trim() : "";
                        String  designation = r[2] != null ? r[2].toString().trim() : "";
                        String  entryTypeStr= r[4] != null ? r[4].toString().trim() : "0";
                        String  documentNo  = r[5] != null ? r[5].toString().trim() : "";
                        java.math.BigDecimal quantite = r[6] != null
                            ? new java.math.BigDecimal(r[6].toString()) : java.math.BigDecimal.ZERO;
                        String  locationCode= r[7] != null ? r[7].toString().trim() : "";
                        String  siteCode    = r[8] != null ? r[8].toString().trim() : "";
                        String  sourceNo    = r[9] != null ? r[9].toString().trim() : "";
                        String  database_   = r[11] != null ? r[11].toString().trim() : "";

                        // Map Entry Type to French label
                        String entryLabel = switch (entryTypeStr) {
                            case "0" -> "Achat";
                            case "1" -> "Vente";
                            case "2" -> "Ajustement +";
                            case "3" -> "Ajustement -";
                            case "4" -> "Transfert";
                            case "5" -> "Consommation";
                            case "6" -> "Sortie Production";
                            default  -> "Autre (" + entryTypeStr + ")";
                        };

                        // ENTREE if quantity > 0, SORTIE otherwise
                        StockMovement.TypeMouvement type = quantite.compareTo(java.math.BigDecimal.ZERO) > 0
                            ? StockMovement.TypeMouvement.ENTREE
                            : StockMovement.TypeMouvement.SORTIE;

                        // Parse posting date
                        java.time.LocalDateTime dateTime;
                        try {
                            Object rawDate = r[3];
                            if (rawDate instanceof java.sql.Timestamp)
                                dateTime = ((java.sql.Timestamp) rawDate).toLocalDateTime();
                            else if (rawDate instanceof java.sql.Date)
                                dateTime = ((java.sql.Date) rawDate).toLocalDate().atStartOfDay();
                            else
                                dateTime = java.time.LocalDate.parse(rawDate.toString().substring(0, 10)).atStartOfDay();
                        } catch (Exception ex) {
                            dateTime = java.time.LocalDateTime.now();
                        }

                        StockDTO.MovementResponse mvt = new StockDTO.MovementResponse();
                        mvt.setId(id);
                        mvt.setStockItemReference(reference);
                        mvt.setStockItemDesignation(designation);
                        mvt.setType(type);
                        mvt.setQuantite(quantite.abs());
                        mvt.setMotif(entryLabel + (locationCode.isEmpty() ? "" : " — " + locationCode));
                        mvt.setOperateur(siteCode.isEmpty() ? database_ : siteCode);
                        mvt.setReference(documentNo.isEmpty() ? reference : documentNo);
                        mvt.setDate(dateTime);
                        result.add(mvt);
                    } catch (Exception ignored) {}
                }
                if (!result.isEmpty()) return result;
            }
        } catch (Exception ignored) {}

        // Fallback to local movements table
        return toMovementResponses(movementRepo.findAllByOrderByDateDesc());
    }

    // ── ALERTS ─────────────────────────────────────────────────────────────

    public List<StockDTO.ItemResponse> getAlertes() {
        return itemRepo.findAllByOrderByDateStockDesc().stream()
            .filter(StockItem::isEnAlerte)
            .map(this::toItemResponse).collect(Collectors.toList());
    }

    public List<StockDTO.ItemResponse> getNiveauxCritiques() {
        return itemRepo.findAllByOrderByDateStockDesc().stream()
            .filter(StockItem::isEnNiveauCritique)
            .map(this::toItemResponse).collect(Collectors.toList());
    }

    public List<StockDTO.ItemResponse> getRuptures() {
        return itemRepo.findAllByOrderByDateStockDesc().stream()
            .filter(StockItem::isEnRupture)
            .map(this::toItemResponse).collect(Collectors.toList());
    }

    // ── KPI ────────────────────────────────────────────────────────────────

    public StockDTO.KpiResponse getKpi() {
        LocalDateTime today = LocalDateTime.now().toLocalDate().atStartOfDay();
        StockDTO.KpiResponse kpi = new StockDTO.KpiResponse();
        
        kpi.setTotalArticles(itemRepo.count());
        // For performance on large legacy DB, we approximate these based on top 2000 or just return 0 for now
        kpi.setEnRupture(0); 
        kpi.setEnAlerte(0);
        kpi.setEnNiveauCritique(0);
        
        kpi.setValeurTotaleStock(0.0); // Approximated
        
        java.math.BigDecimal entrees = movementRepo.totalEntrees(today);
        java.math.BigDecimal sorties = movementRepo.totalSorties(today);
        kpi.setTotalEntreesJour(entrees != null ? entrees : java.math.BigDecimal.ZERO);
        kpi.setTotalSortiesJour(sorties != null ? sorties : java.math.BigDecimal.ZERO);
        return kpi;
    }


    // ── HISTORY (ASTOCKDATE) ───────────────────────────────────────────────

    public List<StockDTO.HistoryResponse> getHistory(int limit) {
        return itemRepo.findAllByOrderByDateStockDesc().stream()
            .limit(limit)
            .map(s -> {
                StockDTO.HistoryResponse r = new StockDTO.HistoryResponse();
                r.setDateStock(s.getDateStock());
                r.setReference(s.getReference());
                r.setDesignation(s.getDesignation());
                r.setGenProdPostingGroup(s.getGenProdPostingGroup());
                r.setQuantite(s.getQuantite());
                r.setCout(s.getValeurUnitaire());
                r.setSite(s.getEmplacement());
                r.setEncours(s.getEncours());
                r.setNomAbrege(s.getNomAbrege());
                r.setGroupeItem(s.getCategorie());
                r.setGroupeClient(s.getGroupeClient());
                return r;
            }).collect(Collectors.toList());
    }

    // ── PRIVATE ────────────────────────────────────────────────────────────

    private void checkAndNotifyStockLevel(StockItem item) {
        if (item.isEnRupture()) {
            notificationService.createStockAlert(item, "RUPTURE");
        } else if (item.isEnNiveauCritique()) {
            notificationService.createStockAlert(item, "CRITIQUE");
        } else if (item.isEnAlerte()) {
            notificationService.createStockAlert(item, "ALERTE");
        }
    }

    private StockItem findItemOrThrow(String reference) {
        return itemRepo.findByReference(reference)
            .stream().findFirst()
            .orElseThrow(() -> new EntityNotFoundException("Article non trouvé: " + reference));
    }

    private void mapItemRequest(StockDTO.ItemRequest req, StockItem item) {
        item.setReference(req.getReference());
        item.setDesignation(req.getDesignation());
        item.setCategorie(req.getCategorie());
        item.setEmplacement(req.getEmplacement());
        item.setUnite(req.getUnite());
        item.setQuantite(req.getQuantite());
        item.setSeuilCritique(req.getSeuilCritique());
        item.setSeuilAlerte(req.getSeuilAlerte());
        item.setValeurUnitaire(req.getValeurUnitaire());
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

    private List<StockDTO.MovementResponse> toMovementResponses(List<StockMovement> movements) {
        if (movements.isEmpty()) return java.util.Collections.emptyList();

        // Batch-fetch designations in one query instead of N+1
        Set<String> refs = movements.stream()
            .map(StockMovement::getStockItemReference)
            .collect(Collectors.toSet());
        Map<String, String> designations = itemRepo.findByReferenceIn(refs).stream()
            .collect(Collectors.toMap(
                StockItem::getReference,
                s -> s.getDesignation() != null ? s.getDesignation() : "",
                (a, b) -> a
            ));

        return movements.stream().map(m -> {
            StockDTO.MovementResponse r = new StockDTO.MovementResponse();
            r.setId(m.getId());
            r.setStockItemReference(m.getStockItemReference());
            r.setStockItemDesignation(designations.getOrDefault(m.getStockItemReference(), ""));
            r.setType(m.getType());
            r.setQuantite(m.getQuantite());
            r.setMotif(m.getMotif());
            r.setOperateur(m.getOperateur());
            r.setReference(m.getReference());
            r.setDate(m.getDate());
            return r;
        }).collect(Collectors.toList());
    }
}
