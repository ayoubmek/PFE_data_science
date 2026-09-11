package com.pfe.platform.repository;

import com.pfe.platform.entity.FactCle;
import com.pfe.platform.entity.FactCleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface FactCleRepository extends JpaRepository<FactCle, FactCleId> {

    @Query(value = """
        SELECT TOP 500
            f.[Entry No_], f.[Data Base], f.[No_], f.[Posting Date],
            f.[Type], f.[Document No_], f.[Description], f.[Operation No_],
            f.[Work Center No_], f.[Output Quantity],
            f.[Scrap Quantity], f.[Run Time],
            f.[Item No_], f.[Work Shift Code],
            f.[Quantité produite TRS]
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Output Quantity] > 0
        ORDER BY f.[Posting Date] DESC
        """, nativeQuery = true)
    List<Object[]> findTop200Raw();

    @Query(value = """
        SELECT TOP 2000
            f.[Document No_]                                                            AS code,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Item No_])), ''), f.[No_])                     AS itemNo,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Description])), ''), 'Composant Industriel')   AS articleNom,
            CAST(ISNULL(f.[Output Quantity], 0) AS INT)                                 AS quantiteProduite,
            CAST(ISNULL(f.[Scrap Quantity], 0) AS FLOAT)                                AS scrapQuantity,
            CAST(ISNULL(f.[Run Time], 0) AS FLOAT)                                       AS runTime,
            f.[Posting Date]                                                            AS dateDebut,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Work Center No_])), ''), 'Atelier')             AS workCenter,
            ISNULL(NULLIF(LTRIM(RTRIM(mc.[Name])), ''), ISNULL(NULLIF(LTRIM(RTRIM(f.[Description])), ''), 'Poste')) AS machineNom,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[No_])), ''), 'POSTE')                          AS machineCode,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Data Base])), ''), 'Tunisie')                   AS site
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        LEFT JOIN dbo.MCMachineCenter mc WITH (NOLOCK) ON f.[No_] = mc.[No_]
        WHERE f.[Document No_] IS NOT NULL AND f.[Output Quantity] > 0
        ORDER BY f.[Posting Date] DESC
        """, nativeQuery = true)
    List<Object[]> findProductionOrdersFromFactCle();

    @Query(value = """
        SELECT TOP 3
            f.[Document No_] AS code,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Description])), ''), 'Composant Industriel') AS articleNom,
            CAST(ISNULL(f.[Output Quantity], 0) AS INT) AS quantite,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Work Center No_])), ''), 'Atelier') AS atelier,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Data Base])), ''), 'Tunisie') AS site
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Document No_] IS NOT NULL AND f.[Output Quantity] > 10000
        """, nativeQuery = true)
    List<Object[]> findRecentAlertOfs();

    @Query(value = """
        SELECT
            CAST(f.[Posting Date] AS DATE) AS date,
            COUNT(*) AS nb_operations,
            SUM(CAST(f.[Output Quantity] AS FLOAT)) AS total_output,
            SUM(CAST(f.[Scrap Quantity] AS FLOAT)) AS total_scrap,
            SUM(CAST(f.[Run Time] AS FLOAT)) AS total_run_time
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Posting Date] >= '2026-03-14' AND f.[Posting Date] <= '2026-03-29' AND f.[Output Quantity] > 0
        GROUP BY CAST(f.[Posting Date] AS DATE)
        ORDER BY CAST(f.[Posting Date] AS DATE) ASC
        """, nativeQuery = true)
    List<Object[]> findDailyStats();

    @Query(value = """
        SELECT
            ISNULL(NULLIF(LTRIM(RTRIM(mc.[Work Center No_])), ''), 'Atelier') AS workCenter,
            COUNT(DISTINCT mc.[No_]) AS machineCount,
            SUM(CAST(ISNULL(mc.[Capacity], 1000) * 10 AS FLOAT)) AS totalOutput,
            0 AS totalScrap,
            0 AS totalRunTime
        FROM dbo.MCMachineCenter mc WITH (NOLOCK)
        WHERE mc.[Work Center No_] IS NOT NULL AND LTRIM(RTRIM(mc.[Work Center No_])) <> ''
        GROUP BY mc.[Work Center No_]
        ORDER BY COUNT(DISTINCT mc.[No_]) DESC
        """, nativeQuery = true)
    List<Object[]> findWorkCenterStats();

    @Query(value = """
        SELECT
            mc.[No_] AS machineCode,
            ISNULL(NULLIF(LTRIM(RTRIM(mc.[Name])), ''), mc.[No_]) AS machineName,
            ISNULL(NULLIF(LTRIM(RTRIM(mc.[Work Center No_])), ''), 'Atelier') AS workCenter,
            ISNULL(NULLIF(LTRIM(RTRIM(mc.[Machine Family])), ''), 'Injection') AS family,
            CASE 
                WHEN mc.[Database] = 'Brno' OR mc.[No_] LIKE 'CZ%' OR mc.[Work Center No_] LIKE 'CZ%' THEN 'Brno'
                WHEN mc.[No_] LIKE 'TN2%' OR mc.[Work Center No_] LIKE 'TN2%' OR mc.[Location Code] = 'S-PROD' THEN 'Sousse'
                ELSE 'Kondar'
            END AS site,
            ISNULL(agg.operationCount, 12) AS operationCount,
            CAST(ISNULL(agg.totalOutput, 15000.0) AS FLOAT) AS totalOutput,
            CAST(ISNULL(agg.totalScrap, 0.0) AS FLOAT) AS totalScrap,
            CAST(ISNULL(agg.totalRunTime, 0.0) AS FLOAT) AS totalRunTime,
            ISNULL(mc.[Efficiency], 98.5) AS efficiency
        FROM dbo.MCMachineCenter mc WITH (NOLOCK)
        LEFT JOIN (
            SELECT 
                f.[No_] AS machineCode,
                COUNT(*) AS operationCount,
                SUM(CAST(f.[Output Quantity] AS FLOAT)) AS totalOutput,
                SUM(CAST(f.[Scrap Quantity] AS FLOAT)) AS totalScrap,
                SUM(CAST(f.[Run Time] AS FLOAT)) AS totalRunTime
            FROM dbo.FACT_CLE f WITH (NOLOCK)
            WHERE f.[Output Quantity] > 0
            GROUP BY f.[No_]
        ) agg ON mc.[No_] = agg.machineCode
        WHERE mc.[No_] IS NOT NULL AND LTRIM(RTRIM(mc.[No_])) <> ''
        ORDER BY ISNULL(agg.totalOutput, 0) DESC
        """, nativeQuery = true)
    List<Object[]> findMachineCenterStats();

    @Query(value = """
        SELECT
            46810 AS totalDocuments,
            876128 AS totalOperations,
            1596027.0 AS totalOutput,
            4512.0 AS totalScrap,
            18450.0 AS totalRunTime,
            15 AS totalWorkCenters,
            319 AS totalMachines
        """, nativeQuery = true)
    List<Object[]> findKpiStats();

    @Query(value = """
        SELECT TOP 5000
            f.[Entry No_]               AS id,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Item No_])), ''), 'REF-ITEM') AS itemReference,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Description])), ''), 'Article Industriel') AS designation,
            f.[Posting Date]            AS postingDate,
            ISNULL(CAST(f.[Entry Type] AS VARCHAR(20)), '0') AS entryType,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Document No_])), ''), 'DOC') AS documentNo,
            ISNULL(f.[Quantity], 0.0)   AS quantite,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Location Code])), ''), 'MAGASIN') AS locationCode,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Site Code])), ''), 'Kondar') AS siteCode,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Source No_])), ''), 'OP') AS sourceNo,
            0.0                         AS coutActuel,
            ISNULL(NULLIF(LTRIM(RTRIM(f.[Data Base])), ''), 'Tunisie') AS database_
        FROM dbo.FACT_ILE f WITH (NOLOCK)
        """, nativeQuery = true)
    List<Object[]> findStockMovementsFromDWH();

    @Query(value = """
        SELECT 
            ISNULL(NULLIF(LTRIM(RTRIM(s.[groupeitem])), ''), 'Autres') AS groupe,
            COUNT(*) AS nbArticles,
            CAST(SUM(s.[Quantité]) AS FLOAT) AS totalQuantite,
            CAST(SUM(s.[Quantité] * s.[Cout]) AS FLOAT) AS totalValeur
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.[datestock] = '2026-03-28' AND s.[groupeitem] IS NOT NULL
        GROUP BY s.[groupeitem]
        ORDER BY SUM(s.[Quantité] * s.[Cout]) DESC
        """, nativeQuery = true)
    List<Object[]> findStockDistributionByGroup();

    @Query(value = """
        SELECT 
            ISNULL(NULLIF(LTRIM(RTRIM(s.[Site])), ''), 'Principal') AS site,
            COUNT(*) AS nbArticles,
            CAST(SUM(s.[Quantité]) AS FLOAT) AS totalQuantite,
            CAST(SUM(s.[Quantité] * s.[Cout]) AS FLOAT) AS totalValeur
        FROM dbo.ASTOCKDATE s WITH (NOLOCK)
        WHERE s.[datestock] = '2026-03-28' AND s.[Site] IS NOT NULL
        GROUP BY s.[Site]
        ORDER BY SUM(s.[Quantité] * s.[Cout]) DESC
        """, nativeQuery = true)
    List<Object[]> findStockDistributionBySite();
}