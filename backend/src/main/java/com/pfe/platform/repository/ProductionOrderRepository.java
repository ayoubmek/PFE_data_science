package com.pfe.platform.repository;

import com.pfe.platform.entity.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {

    List<ProductionOrder> findByStatut(ProductionOrder.Statut statut);

    List<ProductionOrder> findByMachineId(Long machineId);

    List<ProductionOrder> findByArticleContainingIgnoreCase(String article);

    @Query("SELECT p FROM ProductionOrder p WHERE p.statut = 'EN_COURS' AND p.dateFin < :today")
    List<ProductionOrder> findRetardes(LocalDate today);

    @Query("SELECT COUNT(p) FROM ProductionOrder p WHERE p.statut = :statut")
    long countByStatut(ProductionOrder.Statut statut);

    @Query("SELECT AVG((p.quantiteRealisee * 1.0 / p.quantitePrevue) * 100) FROM ProductionOrder p WHERE p.statut = 'TERMINE'")
    Double avgTauxRendement();

    @Query("SELECT p FROM ProductionOrder p WHERE p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<ProductionOrder> findRecentOrders(java.time.LocalDateTime since);
}
