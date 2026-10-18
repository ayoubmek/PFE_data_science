package com.pfe.platform.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public class StockDTO {

    /** Ligne du dernier instantané de stock, enrichie du statut de couverture de son article. */
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
        /** RUPTURE, CRITIQUE, NORMAL, SURSTOCK, INACTIF ou SANS_CONSOMMATION (calculé au niveau article). */
        private String statut;
        private Double couvertureJours;
        private Double consommationJournaliere;
    }

    /** Statut de couverture d'un article (agrégé tous sites). */
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
        private long totalLignes;
        private double quantiteTotale;
        private double valeurTotaleStock;
        private long nbArticlesSuivis;
        /** Nombre d'articles par statut de couverture. */
        private Map<String, Long> statuts;
        private ReplenishmentPlan reapprovisionnement;
        private LocalDate dateMouvements;
        private Double totalEntreesJour;
        private Double totalSortiesJour;
        private Map<String, Integer> regles;
    }
}
