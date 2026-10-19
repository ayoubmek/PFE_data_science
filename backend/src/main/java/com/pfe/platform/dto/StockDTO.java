package com.pfe.platform.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public class StockDTO {
    @Data
    public static class ItemResponse {
        private String id;
        private String reference;
        private String designation;
        private String categorie;
        private String emplacement;
        private LocalDate dateStock;
        private Integer encours;
        private String genProdPostingGroup;
        private String nomAbrege;
        private String groupeClient;
        private BigDecimal quantite;
        private BigDecimal valeurUnitaire;
        private BigDecimal valeurTotale;
        private String statut;
        private Double couvertureJours;
        private Double consommationJournaliere;
    }

    @Data
    public static class ArticleStatus {
        private String reference;
        private String designation;
        private String categorie;
        private double stock;
        private double valeur;
        private Double coutUnitaire;
        private double consommationJournaliere;
        private Double couvertureJours;
        private String statut;
        private double quantiteACommander;
        private Double montantCommande;
    }

    @Data
    public static class ReplenishmentPlan {
        private int horizonJours;
        private long nbReferences;
        private double quantiteTotale;
        private double budgetTnd;
        private long nbReferencesSansCout;
    }

    @Data
    public static class KpiResponse {
        private LocalDate dateStock;
        private long totalArticles;
        private double quantiteTotale;
        private double valeurTotaleStock;
        private Map<String, Long> statuts;
        private ReplenishmentPlan reapprovisionnement;
    }
}
