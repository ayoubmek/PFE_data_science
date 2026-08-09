package com.pfe.platform.repository;

import com.pfe.platform.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByStockItemReferenceOrderByDateDesc(String reference);

    List<StockMovement> findByType(StockMovement.TypeMouvement type);

    List<StockMovement> findAllByOrderByDateDesc();

    @Query("SELECT m FROM StockMovement m WHERE m.date >= :since ORDER BY m.date DESC")
    List<StockMovement> findRecentMovements(LocalDateTime since);

    @Query("SELECT SUM(m.quantite) FROM StockMovement m WHERE m.type = 'ENTREE' AND m.date >= :since")
    java.math.BigDecimal totalEntrees(LocalDateTime since);

    @Query("SELECT SUM(m.quantite) FROM StockMovement m WHERE m.type = 'SORTIE' AND m.date >= :since")
    java.math.BigDecimal totalSorties(LocalDateTime since);
}
