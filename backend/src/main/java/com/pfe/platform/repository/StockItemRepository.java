package com.pfe.platform.repository;

import com.pfe.platform.entity.StockItem;
import com.pfe.platform.entity.StockItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, StockItemId> {
    @Query(value = """
        SELECT *
        FROM dbo.ASTOCKDATE WITH (NOLOCK)
        WHERE DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        """, nativeQuery = true)
    List<StockItem> findAllLatestSnapshot();

    @Query(value = """
        SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(s.[GroupeItem])), ''), 'Non classé') AS groupe,
            COUNT(DISTINCT s.[No_])                                       AS nbArticles,
            CAST(SUM(s.[Quantité]) AS FLOAT)                               AS totalQuantite,
            CAST(SUM(s.[Cout]) AS FLOAT)                                   AS totalValeur
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(s.[GroupeItem])), ''), 'Non classé')
        ORDER BY SUM(s.[Cout]) DESC
        """, nativeQuery = true)
    List<Object[]> findStockDistributionByGroup();

    @Query(value = """
        SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(s.[Site])), ''), 'Non renseigné') AS site,
            COUNT(DISTINCT s.[No_])                                     AS nbArticles,
            CAST(SUM(s.[Quantité]) AS FLOAT)                             AS totalQuantite,
            CAST(SUM(s.[Cout]) AS FLOAT)                                 AS totalValeur
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(s.[Site])), ''), 'Non renseigné')
        ORDER BY SUM(s.[Cout]) DESC
        """, nativeQuery = true)
    List<Object[]> findStockDistributionBySite();

    @Query(value = """
        SELECT MAX(DateStock) AS dateStock, COUNT(DISTINCT [No_]) AS articles,
               CAST(SUM([Quantité]) AS FLOAT) AS quantite, CAST(SUM([Cout]) AS FLOAT) AS valeur
        FROM dbo.ASTOCKDATE WITH (NOLOCK)
        WHERE DateStock = (SELECT MAX(DateStock) FROM dbo.ASTOCKDATE)
        """, nativeQuery = true)
    List<Object[]> findSnapshotTotals();

    // Consommation estimée à partir des instantanés de stock : baisse du stock (tous sites) d'un instantané au suivant.
    @Query(value = """
        WITH snap AS (SELECT MAX(DateStock) AS d FROM dbo.ASTOCKDATE),
        tracked AS (
            SELECT s.[No_] AS art,
                   MAX(s.[Description]) AS designation,
                   MAX(s.[GroupeItem]) AS categorie,
                   SUM(CASE WHEN s.[Quantité] > 0 THEN CAST(s.[Cout] AS FLOAT) ELSE 0 END)
                     / NULLIF(SUM(CASE WHEN s.[Quantité] > 0 THEN CAST(s.[Quantité] AS FLOAT) ELSE 0 END), 0) AS cout_unitaire
            FROM dbo.ASTOCKDATE s WITH (NOLOCK) CROSS JOIN snap
            WHERE s.DateStock > DATEADD(day, -:window, snap.d)
            GROUP BY s.[No_]
        ),
        cur AS (
            SELECT s.[No_] AS art, SUM(CAST(s.[Quantité] AS FLOAT)) AS qte, SUM(CAST(s.[Cout] AS FLOAT)) AS valeur
            FROM dbo.ASTOCKDATE s WITH (NOLOCK) JOIN snap ON s.DateStock = snap.d
            GROUP BY s.[No_]
        ),
        dates AS (
            SELECT d, LAG(d) OVER (ORDER BY d) AS prev_d
            FROM (SELECT DISTINCT s.DateStock AS d FROM dbo.ASTOCKDATE s WITH (NOLOCK) CROSS JOIN snap
                  WHERE s.DateStock > DATEADD(day, -:window, snap.d)) x
        ),
        art_day AS (
            SELECT s.[No_] AS art, s.DateStock AS d, SUM(CAST(s.[Quantité] AS FLOAT)) AS q
            FROM dbo.ASTOCKDATE s WITH (NOLOCK) CROSS JOIN snap
            WHERE s.DateStock > DATEADD(day, -:window, snap.d)
            GROUP BY s.[No_], s.DateStock
        ),
        moves AS (
            SELECT a.art, a.d, a.q, dt.prev_d,
                   LAG(a.q) OVER (PARTITION BY a.art ORDER BY a.d) AS prev_q,
                   LAG(a.d) OVER (PARTITION BY a.art ORDER BY a.d) AS prev_art_d,
                   LEAD(a.d) OVER (PARTITION BY a.art ORDER BY a.d) AS next_art_d
            FROM art_day a JOIN dates dt ON dt.d = a.d
        ),
        sorties AS (
            SELECT m.art, m.d,
                   CASE WHEN m.prev_q IS NULL THEN 0
                        WHEN m.prev_art_d = m.prev_d THEN CASE WHEN m.prev_q > m.q THEN m.prev_q - m.q ELSE 0 END
                        WHEN m.prev_q > 0 THEN m.prev_q ELSE 0 END
                 + CASE WHEN m.next_art_d IS NULL AND m.d < snap.d AND m.q > 0 THEN m.q ELSE 0 END AS sortie
            FROM moves m CROSS JOIN snap
        ),
        conso AS (
            SELECT so.art, SUM(so.sortie) AS conso,
                   SUM(CASE WHEN so.d > DATEADD(day, -:recent, snap.d) THEN so.sortie ELSE 0 END) AS conso_recente
            FROM sorties so CROSS JOIN snap
            GROUP BY so.art
        )
        SELECT t.art, t.designation, t.categorie, t.cout_unitaire,
               ISNULL(c.qte, 0) AS stock, ISNULL(c.valeur, 0) AS valeur,
               ISNULL(co.conso, 0) AS conso_fenetre, ISNULL(co.conso_recente, 0) AS conso_recente
        FROM tracked t
        LEFT JOIN cur c ON c.art = t.art
        LEFT JOIN conso co ON co.art = t.art
        """, nativeQuery = true)
    List<Object[]> findArticleCoverageData(@Param("window") int windowDays, @Param("recent") int recentDays);
}
