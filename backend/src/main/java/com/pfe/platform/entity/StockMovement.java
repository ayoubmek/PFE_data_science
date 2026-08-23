package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "StockMovements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stock_item_id", nullable = false)
    @Builder.Default
    private Long stockItemId = 0L;

    @Column(name = "stock_item_reference", nullable = false)
    private String stockItemReference;

    @Column(name = "stock_item_no", nullable = false)
    @Builder.Default
    private String stockItemNo = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMouvement type;

    @Column(nullable = false)
    private BigDecimal quantite;

    private String motif;
    private String operateur;
    private String reference;

    @Builder.Default
    private LocalDateTime date = LocalDateTime.now();

    public enum TypeMouvement {
        ENTREE, SORTIE, AJUSTEMENT, RETOUR
    }
}