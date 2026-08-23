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
    private String reference; 
    private LocalDate dateStock; 
    private String emplacement; 
    private Integer encours; 
}