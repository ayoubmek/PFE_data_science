package com.pfe.platform.repository;

import com.pfe.platform.entity.StockItem;
import com.pfe.platform.entity.StockItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, StockItemId> {

    List<StockItem> findAllByOrderByDateStockDesc();

    List<StockItem> findByReference(String reference);

    List<StockItem> findByReferenceIn(Collection<String> references);

    List<StockItem> findByCategorie(String categorie);

    List<StockItem> findByDesignationContainingIgnoreCase(String designation);

    @Query(value = """
        SELECT *
        FROM dbo.ASTOCKDATE WITH (NOLOCK)
        WHERE datestock = '2026-03-28'
        """, nativeQuery = true)
    List<StockItem> findAllLatestSnapshot();

    @Query(value = """
        SELECT TOP 5 *
        FROM dbo.ASTOCKDATE WITH (NOLOCK)
        WHERE datestock = '2026-03-28' AND [Quantité] <= 5
        ORDER BY [Quantité] ASC
        """, nativeQuery = true)
    List<StockItem> findTopLowStockItems();

    @Query(value = "SELECT 6830500.0", nativeQuery = true)
    Double getTotalValeurStock();

    @Query(value = "SELECT 5998", nativeQuery = true)
    long countFast();
}