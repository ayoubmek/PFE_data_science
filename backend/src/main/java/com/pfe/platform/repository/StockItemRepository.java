package com.pfe.platform.repository;

import com.pfe.platform.entity.StockItem;
import com.pfe.platform.entity.StockItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, StockItemId> {
    String REAL_STOCK = " AND NULLIF(LTRIM(RTRIM(s.[GroupeItem])), '') NOT IN ('Finance Accounting', 'For Work Centres') ";

    @Query(value = """
        SELECT s.*
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        """ + REAL_STOCK, nativeQuery = true)
    List<StockItem> findAllLatestSnapshot();

    @Query(value = """
        SELECT
            LTRIM(RTRIM(s.[GroupeItem]))                                  AS groupe,
            COUNT(DISTINCT s.[No_])                                       AS nbArticles,
            CAST(SUM(s.[Quantité]) AS FLOAT)                               AS totalQuantite,
            CAST(SUM(s.[Cout]) AS FLOAT)                                   AS totalValeur
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        """ + REAL_STOCK + """
        GROUP BY LTRIM(RTRIM(s.[GroupeItem]))
        ORDER BY SUM(s.[Cout]) DESC
        """, nativeQuery = true)
    List<Object[]> findStockDistributionByGroup();

    @Query(value = """
        SELECT MAX(s.DateStock) AS dateStock, CAST(SUM(s.[Cout]) AS FLOAT) AS valeur
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        """ + REAL_STOCK, nativeQuery = true)
    List<Object[]> findSnapshotTotals();
}
