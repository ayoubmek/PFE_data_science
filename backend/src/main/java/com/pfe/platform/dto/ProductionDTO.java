package com.pfe.platform.dto;

import lombok.Data;

import java.time.LocalDate;

public class ProductionDTO {

    /** Déclaration de production (ligne de dbo.FACT_CLE). */
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

    /** KPI de production sur la période [periodStart, periodEnd] (fin = dernière date de dbo.FACT_CLE). */
    @Data
    public static class KpiResponse {
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private int periodDays;
        private long totalOrdres;
        private long totalOperations;
        private double totalVolumeProduit;
        private double totalRebut;
        private double totalHeuresMarche;
        /** Pièces conformes / (conformes + rebuts), en %. Null si aucune déclaration sur la période. */
        private Double tauxConformite;
        private long centresDeCharge;
        private long machinesActives;
        private long machinesTotal;
        private long machinesBloquees;
    }
}
