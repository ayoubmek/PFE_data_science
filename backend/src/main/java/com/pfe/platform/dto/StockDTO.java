package com.pfe.platform.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockDTO {

    @Data
    public static class ItemResponse {
        private String id;
        private String reference; 
        private String designation; 
        private String categorie; 
        private String emplacement; 
        private java.time.LocalDate dateStock;
        private Integer encours;
        private String genProdPostingGroup;
        private String nomAbrege;
        private String groupeClient;
        private String unite;
        private BigDecimal quantite;
        private BigDecimal seuilCritique;
        private BigDecimal seuilAlerte;
        private BigDecimal valeurUnitaire; 
        private BigDecimal valeurTotale;
        private String niveauAlerte;  
    }

    @Data
    public static class MovementResponse {
        private Long id;
        private String stockItemReference;
        private String stockItemDesignation;
        private String type;
        private BigDecimal quantite;
        private String motif;
        private String operateur;
        private String reference;
        private LocalDateTime date;
    }

    @Data
    public static class KpiResponse {
        private long totalArticles;
        private long enRupture;
        private long enAlerte;
        private long enNiveauCritique;
        private Double valeurTotaleStock;
        private BigDecimal totalEntreesJour;
        private BigDecimal totalSortiesJour;
    }
}