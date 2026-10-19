package com.pfe.platform.dto;

import lombok.Data;

import java.time.LocalDate;

public class ProductionDTO {
    @Data
    public static class Response {
        private Long id;
        private String reference;
        private String itemNo;
        private String article;
        private Double quantiteRealisee;
        private Double scrapQuantity;
        private Double runTime;
        private LocalDate dateDebut;
        private String workCenter;
        private String machineNom;
        private String machineCode;
        private String site;
    }

    @Data
    public static class KpiResponse {
        private String period;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private int periodDays;
        private long totalOrdres;
        private double totalVolumeProduit;
        private double totalRebut;
        private Double tauxConformite;
        private long machinesActives;
        private long machinesTotal;
        private long machinesBloquees;
    }
}
