package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "FACT_CLE", schema = "dbo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(FactCleId.class)
public class FactCle {

    @Id
    @Column(name = "Entry No_", nullable = false)
    private Integer entryNo;

    @Id
    @Column(name = "Data Base", nullable = false)
    private String dataBase;

    @Column(name = "No_")
    private String no;

    @Column(name = "Posting Date")
    private LocalDateTime postingDate;

    @Column(name = "Type")
    private String type;

    @Column(name = "Document No_")
    private String documentNo;

    @Column(name = "Description")
    private String description;

    @Column(name = "Operation No_")
    private String operationNo;

    @Column(name = "Work Center No_")
    private String workCenterNo;

    @Column(name = "Quantity", precision = 38, scale = 20)
    private BigDecimal quantity;

    @Column(name = "Setup Time", precision = 38, scale = 20)
    private BigDecimal setupTime;

    @Column(name = "Run Time", precision = 38, scale = 20)
    private BigDecimal runTime;

    @Column(name = "Stop Time", precision = 38, scale = 20)
    private BigDecimal stopTime;

    @Column(name = "Output Quantity", precision = 38, scale = 20)
    private BigDecimal outputQuantity;

    @Column(name = "Scrap Quantity", precision = 38, scale = 20)
    private BigDecimal scrapQuantity;

    @Column(name = "Invoiced Quantity", precision = 38, scale = 20)
    private BigDecimal invoicedQuantity;

    @Column(name = "Item No_")
    private String itemNo;

    @Column(name = "Work Shift Code")
    private String workShiftCode;

    @Column(name = "Stop Code")
    private String stopCode;

    @Column(name = "Scrap Code")
    private String scrapCode;

    @Column(name = "Global Dimension 1 Code")
    private String globalDimension1Code;

    @Column(name = "Quantité produite TRS", precision = 38, scale = 20)
    private BigDecimal quantiteProduitesTrs;

    @Column(name = "N° Article rebuté")
    private String articleRebute;
}