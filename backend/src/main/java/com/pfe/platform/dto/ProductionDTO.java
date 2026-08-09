package com.pfe.platform.dto;

import com.pfe.platform.entity.ProductionOrder;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProductionDTO {

    @Data
    public static class Request {
        @NotBlank
        private String reference;
        @NotBlank
        private String article;
        @NotNull @Min(1)
        private Integer quantitePrevue;
        private Integer quantiteRealisee;
        private ProductionOrder.Statut statut;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private Long machineId;
        private String responsable;
        private String notes;
    }

    @Data
    public static class Response {
        private Long id;
        private String reference;
        private String article;
        private Integer quantitePrevue;
        private Integer quantiteRealisee;
        private ProductionOrder.Statut statut;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private String machineNom;
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
    }
}
