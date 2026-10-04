package com.pfe.platform.repository;

import com.pfe.platform.entity.ProductionPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionPredictionRepository extends JpaRepository<ProductionPrediction, Long> {
}
