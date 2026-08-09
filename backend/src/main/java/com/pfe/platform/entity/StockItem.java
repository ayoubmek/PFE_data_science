package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    @Builder.Default
    private BigDecimal quantite = BigDecimal.ZERO;

    @Column(name = "[Cout]", precision = 38, scale = 6)
    @Builder.Default
    private BigDecimal valeurUnitaire = BigDecimal.ZERO;

    @Column(name = "[Gen_ Prod_ Posting Group]")
    private String genProdPostingGroup;

    @Column(name = "[Nom abrégé]")
    private String nomAbrege;

    @Column(name = "groupeclient")
    private String groupeClient;

    @Transient
    @Builder.Default
    private BigDecimal seuilCritique = BigDecimal.TEN;

    @Transient
    @Builder.Default
    private BigDecimal seuilAlerte = BigDecimal.valueOf(20);

    @Transient
    @Builder.Default
    private String unite = "U";

    @Transient
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public boolean isEnRupture() {
        return quantite == null || quantite.compareTo(BigDecimal.ZERO) <= 0;
    }

    public boolean isEnAlerte() {
        return quantite != null && quantite.compareTo(BigDecimal.ZERO) > 0 && quantite.compareTo(seuilAlerte) <= 0;
    }

    public boolean isEnNiveauCritique() {
        return quantite != null && quantite.compareTo(BigDecimal.ZERO) > 0 && quantite.compareTo(seuilCritique) <= 0;
    }

    public BigDecimal getValeurTotale() {
        if (valeurUnitaire == null || quantite == null) return BigDecimal.ZERO;
        return valeurUnitaire.multiply(quantite);
    }

}
