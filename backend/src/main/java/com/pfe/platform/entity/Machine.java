package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Machines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String nom;

    private String type;
    private String emplacement;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Statut statut = Statut.DISPONIBLE;

    @Builder.Default
    private Double tauxRendement = 100.0;

    private LocalDateTime derniereMaintenance;
    private LocalDateTime prochaineMaintenance;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Statut {
        DISPONIBLE, EN_PRODUCTION, EN_MAINTENANCE, EN_PANNE
    }
}
