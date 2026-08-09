package com.pfe.platform.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockItemId implements Serializable {
    private String reference; // Maps to No_
    private LocalDate dateStock; // Maps to DateStock
    private String emplacement; // Maps to Site
    private Integer encours; // Maps to Encours
}
