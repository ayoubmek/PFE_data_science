package com.pfe.platform.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

public class StockDTO {
    @Data
    public static class ItemResponse {
        private String reference;
        private String designation;
        private String categorie;
        private String emplacement;
        private LocalDate dateStock;
        private String genProdPostingGroup;
        private String nomAbrege;
        private String groupeClient;
        private BigDecimal quantite;
        private BigDecimal valeurTotale;
    }

    @Data
    public static class KpiResponse {
        private LocalDate dateStock;
        private double valeurTotaleStock;
    }
}
