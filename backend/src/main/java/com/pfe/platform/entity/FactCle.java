package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "FACT_CLE", schema = "dbo")
@Data
@NoArgsConstructor
@IdClass(FactCleId.class)
public class FactCle {
    @Id
    @Column(name = "Entry No_", nullable = false)
    private Integer entryNo;

    @Id
    @Column(name = "Data Base", nullable = false)
    private String dataBase;
}
