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

    @Query("SELECT s FROM StockItem s WHERE s.dateStock = (SELECT MAX(si.dateStock) FROM StockItem si)")
    List<StockItem> findAllLatestSnapshot();



    @Query("SELECT s FROM StockItem s WHERE s.quantite = 0")
    List<StockItem> findEnRupture();

    @Query("SELECT SUM(s.quantite * s.valeurUnitaire) FROM StockItem s")
    Double getTotalValeurStock();

    @Query(value = "SELECT COUNT(*) FROM (SELECT TOP 1000 * FROM dbo.ASTOCKDATE WITH (NOLOCK)) s", nativeQuery = true)
    long countFast();


}