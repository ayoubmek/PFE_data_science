package com.pfe.platform.dto;

import com.pfe.platform.entity.StockItem;
import com.pfe.platform.entity.StockMovement;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockDTO {

    @Data
    public static class ItemRequest {
        @NotBlank
        private String reference;
        @NotBlank
        private String designation;
        private String categorie;
        private String emplacement;
        private String unite;
        @Min(0)
        private BigDecimal quantite = BigDecimal.ZERO;
        @Min(0)
        private BigDecimal seuilCritique = BigDecimal.TEN;
        @Min(0)
        private BigDecimal seuilAlerte = BigDecimal.valueOf(20);
        private BigDecimal valeurUnitaire = BigDecimal.ZERO;
    }

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
    public static class MovementRequest {
        @NotNull
        private String stockItemReference;
        @NotNull
        private StockMovement.TypeMouvement type;
        @NotNull @Min(0)
        private BigDecimal quantite;
        private String motif;
        private String operateur;
        private String reference;
    }

    @Data
    public static class MovementResponse {
        private Long id;
        private String stockItemReference;
        private String stockItemDesignation;
        private StockMovement.TypeMouvement type;
        private BigDecimal quantite;
        private String motif;
        private String operateur;
        private String reference;
        private LocalDateTime date;
    }

    @Data
    public static class HistoryResponse {
        private java.time.LocalDate dateStock;
        private String reference;
        private String designation;
        private String genProdPostingGroup;
        private java.math.BigDecimal quantite;
        private java.math.BigDecimal cout;
        private String site;
        private Integer encours;
        private String nomAbrege;
        private String groupeItem;
        private String groupeClient;
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