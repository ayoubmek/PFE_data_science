package com.pfe.platform.entity;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactCleId implements Serializable {
    private Integer entryNo;
    private String dataBase;
}