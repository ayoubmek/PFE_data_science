package com.pfe.platform.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProductionDTO {

    @Data
    public static class Response {
        private Long id;
        private String reference;
        private String itemNo;
        private String article;
        private Integer quantitePrevue;
        private Integer quantiteRealisee;
        private Double scrapQuantity;
        private Double runTime;
        private String statut;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private String machineNom;
        private String machineCode;
        private Long machineId;
        private String responsable;
        private String notes;
        private Double tauxRendement;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class KpiResponse {
        private long totalOrdres;
        private long enCours;
        private long termines;
        private long enRetard;
        private long enAttente;
        private Double tauxRendementMoyen;
        private long machinesDisponibles;
        private long machinesEnPanne;
        private Double totalVolumeProduit;
    }
}