package com.pfe.platform.repository;

import com.pfe.platform.entity.ProductionPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductionPredictionRepository extends JpaRepository<ProductionPrediction, Long> {

    List<ProductionPrediction> findByHorizonDaysOrderByForecastDateAsc(Integer horizonDays);

    List<ProductionPrediction> findTop30ByOrderByCreatedAtDescForecastDateAsc();

    List<ProductionPrediction> findByForecastDateBetweenOrderByForecastDateAsc(LocalDate startDate, LocalDate endDate);
}
