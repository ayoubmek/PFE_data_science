package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "ASTOCKDATE", schema = "dbo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(StockItemId.class)
public class StockItem {
    @Id
    @Column(name = "[No_]", nullable = false)
    private String reference;

    @Id
    @Column(name = "datestock", nullable = false)
    private java.time.LocalDate dateStock;

    @Id
    @Column(name = "[Site]", nullable = false)
    private String emplacement;

    @Id
    @Column(name = "[Encours]", nullable = false)
    private Integer encours;

    @Column(name = "[Description]")
    private String designation;

    @Column(name = "groupeitem")
    private String categorie;

    @Column(name = "[Quantité]", precision = 38, scale = 20)
    private BigDecimal quantite;

    @Column(name = "[Cout]", precision = 38, scale = 6)
    private BigDecimal valeurTotale;

    @Column(name = "[Gen_ Prod_ Posting Group]")
    private String genProdPostingGroup;

    @Column(name = "[Nom abrégé]")
    private String nomAbrege;

    @Column(name = "groupeclient")
    private String groupeClient;

    public BigDecimal getValeurUnitaire() {
        if (valeurTotale == null || quantite == null || quantite.signum() <= 0) return null;
        return valeurTotale.divide(quantite, 6, RoundingMode.HALF_UP);
    }
}
