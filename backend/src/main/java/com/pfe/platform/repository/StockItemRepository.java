package com.pfe.platform.repository;

import com.pfe.platform.entity.StockItem;
import com.pfe.platform.entity.StockItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, StockItemId> {

    List<StockItem> findByReferenceIn(Collection<String> references);

    @Query(value = """
        SELECT *
        FROM dbo.ASTOCKDATE WITH (NOLOCK)
        WHERE datestock = '2026-03-28'
        """, nativeQuery = true)
    List<StockItem> findAllLatestSnapshot();

    @Query(value = "SELECT 5998", nativeQuery = true)
    long countFast();
}