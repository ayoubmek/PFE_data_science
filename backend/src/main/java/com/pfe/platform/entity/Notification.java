package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Type type = Type.INFO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priorite priorite = Priorite.NORMALE;

    @Builder.Default
    private boolean lu = false;

    private String module;
    private String entityId;
    private String username;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        INFO, SUCCES, AVERTISSEMENT, ERREUR, ALERTE_STOCK, ALERTE_PRODUCTION
    }

    public enum Priorite {
        FAIBLE, NORMALE, HAUTE, CRITIQUE
    }
}
