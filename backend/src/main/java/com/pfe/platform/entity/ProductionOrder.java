package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ProductionOrders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String reference;

    @Column(nullable = false)
    private String article;

    @Column(nullable = false)
    private Integer quantitePrevue;

    @Builder.Default
    private Integer quantiteRealisee = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Statut statut = Statut.EN_ATTENTE;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    private String responsable;
    private String notes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public enum Statut {
        EN_ATTENTE, EN_COURS, TERMINE, ANNULE, EN_RETARD
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Auto-detect delay
        if (this.statut == Statut.EN_COURS && this.dateFin != null
                && LocalDate.now().isAfter(this.dateFin)) {
            this.statut = Statut.EN_RETARD;
        }
    }

    public double getTauxRendement() {
        if (quantitePrevue == null || quantitePrevue == 0) return 0;
        return Math.min(100.0, (quantiteRealisee * 100.0) / quantitePrevue);
    }
}
