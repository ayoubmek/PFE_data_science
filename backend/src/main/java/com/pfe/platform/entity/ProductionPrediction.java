package com.pfe.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ml_production_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "prophet_quantity", nullable = false)
    private Integer prophetQuantity;

    @Column(name = "target_quantity", nullable = false)
    private Integer targetQuantity;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "working_day", nullable = false)
    @Builder.Default
    private Boolean workingDay = true;

    @Column(name = "horizon_days", nullable = false)
    @Builder.Default
    private Integer horizonDays = 30;

    @Column(name = "model_name", nullable = false, length = 50)
    @Builder.Default
    private String modelName = "Prophet";

    @Builder.Default
    private Double mae = 7.4;

    @Builder.Default
    private Double rmse = 9.2;

    @Column(length = 20)
    @Builder.Default
    private String mape = "4.8%";

    @Column(name = "total_volume")
    private Integer totalVolume;

    @Column(name = "avg_daily")
    private Integer avgDaily;

    @Column(name = "max_peak")
    private Integer maxPeak;

    @Column(name = "recommendation_teams", length = 1000)
    private String recommendationTeams;

    @Column(name = "recommendation_material", length = 1000)
    private String recommendationMaterial;

    @Column(name = "recommendation_maintenance", length = 1000)
    private String recommendationMaintenance;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
