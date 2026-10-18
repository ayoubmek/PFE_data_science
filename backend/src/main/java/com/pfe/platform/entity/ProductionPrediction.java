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
    private Integer horizonDays;

    @Column(name = "model_name", nullable = false, length = 50)
    private String modelName;

    private Double mae;

    private Double rmse;

    @Column(length = 20)
    private String mape;

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
