package com.pfe.platform.repository;

import com.pfe.platform.entity.FactCle;
import com.pfe.platform.entity.FactCleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Requêtes de production sur dbo.FACT_CLE et dbo.MCMachineCenter.
 * Les périodes sont toujours relatives à la dernière date présente dans dbo.FACT_CLE.
 */
@Repository
public interface FactCleRepository extends JpaRepository<FactCle, FactCleId> {

    /** Règle de rattachement d'une machine à un site (codes Navision : CZ* = Brno, TN2* = Sousse, sinon Kondar). */
    String MACHINE_SITE = """
        CASE
            WHEN mc.[Database] = 'Brno' OR mc.[No_] LIKE 'CZ%' OR mc.[Work Center No_] LIKE 'CZ%' THEN 'Brno'
            WHEN mc.[No_] LIKE 'TN2%' OR mc.[Work Center No_] LIKE 'TN2%' OR mc.[Location Code] = 'S-PROD' THEN 'Sousse'
            ELSE 'Kondar'
        END""";

    @Query(value = """
        SELECT TOP (:limit)
            f.[Document No_]                                                            AS code,
            NULLIF(LTRIM(RTRIM(f.[Item No_])), '')                                      AS itemNo,
            NULLIF(LTRIM(RTRIM(f.[Description])), '')                                   AS articleNom,
            CAST(ISNULL(f.[Output Quantity], 0) AS FLOAT)                               AS quantiteProduite,
            CAST(ISNULL(f.[Scrap Quantity], 0) AS FLOAT)                                AS scrapQuantity,
            CAST(ISNULL(f.[Run Time], 0) AS FLOAT)                                      AS runTime,
            f.[Posting Date]                                                            AS dateDebut,
            NULLIF(LTRIM(RTRIM(f.[Work Center No_])), '')                               AS workCenter,
            NULLIF(LTRIM(RTRIM(mc.[Name])), '')                                         AS machineNom,
            NULLIF(LTRIM(RTRIM(f.[No_])), '')                                           AS machineCode,
            NULLIF(LTRIM(RTRIM(f.[Data Base])), '')                                     AS site
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        LEFT JOIN dbo.MCMachineCenter mc WITH (NOLOCK) ON f.[No_] = mc.[No_]
        WHERE f.[Document No_] IS NOT NULL AND f.[Output Quantity] > 0
        ORDER BY f.[Posting Date] DESC, f.[Entry No_] DESC
        """, nativeQuery = true)
    List<Object[]> findLatestProductionDeclarations(@Param("limit") int limit);

    /** Dernière date de déclaration. Calculée à part : une jointure sur MAX() dans les requêtes d'agrégat
     *  produit un plan d'exécution de plusieurs minutes sur SQL Server. */
    @Query(value = "SELECT CAST(MAX([Posting Date]) AS DATE) FROM dbo.FACT_CLE WITH (NOLOCK)", nativeQuery = true)
    java.sql.Date findLastPostingDate();

    @Query(value = """
        SELECT
            CAST(f.[Posting Date] AS DATE)          AS date,
            COUNT(*)                                AS nb_operations,
            SUM(CAST(f.[Output Quantity] AS FLOAT)) AS total_output,
            SUM(CAST(f.[Scrap Quantity] AS FLOAT))  AS total_scrap,
            SUM(CAST(f.[Run Time] AS FLOAT))        AS total_run_time
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Posting Date] >= :start
        GROUP BY CAST(f.[Posting Date] AS DATE)
        ORDER BY CAST(f.[Posting Date] AS DATE) ASC
        """, nativeQuery = true)
    List<Object[]> findDailyStats(@Param("start") LocalDate start);

    @Query(value = """
        SELECT
            mc.[No_]                                                AS machineCode,
            NULLIF(LTRIM(RTRIM(mc.[Name])), '')                     AS machineName,
            NULLIF(LTRIM(RTRIM(mc.[Work Center No_])), '')          AS workCenter,
            NULLIF(LTRIM(RTRIM(mc.[Machine Family])), '')           AS family,
        """ + MACHINE_SITE + """
                                                                    AS site,
            ISNULL(agg.operationCount, 0)                           AS operationCount,
            CAST(ISNULL(agg.totalOutput, 0) AS FLOAT)               AS totalOutput,
            CAST(ISNULL(agg.totalScrap, 0) AS FLOAT)                AS totalScrap,
            CAST(ISNULL(agg.totalRunTime, 0) AS FLOAT)              AS totalRunTime,
            CAST(mc.[Efficiency] AS FLOAT)                          AS nominalEfficiency,
            CAST(mc.[Capacity] AS FLOAT)                            AS capacity,
            CAST(ISNULL(mc.[Blocked], 0) AS INT)                    AS blocked,
            agg.lastPosting                                         AS lastPosting
        FROM dbo.MCMachineCenter mc WITH (NOLOCK)
        LEFT JOIN (
            SELECT
                f.[No_] AS machineCode,
                COUNT(*) AS operationCount,
                SUM(CAST(f.[Output Quantity] AS FLOAT)) AS totalOutput,
                SUM(CAST(f.[Scrap Quantity] AS FLOAT)) AS totalScrap,
                SUM(CAST(f.[Run Time] AS FLOAT)) AS totalRunTime,
                MAX(f.[Posting Date]) AS lastPosting
            FROM dbo.FACT_CLE f WITH (NOLOCK)
            GROUP BY f.[No_]
        ) agg ON mc.[No_] = agg.machineCode
        WHERE mc.[No_] IS NOT NULL AND LTRIM(RTRIM(mc.[No_])) <> ''
        ORDER BY ISNULL(agg.totalOutput, 0) DESC
        """, nativeQuery = true)
    List<Object[]> findMachineCenterStats();

    @Query(value = """
        SELECT
            COUNT(DISTINCT f.[Document No_])            AS totalDocuments,
            COUNT(*)                                    AS totalOperations,
            SUM(CAST(f.[Output Quantity] AS FLOAT))     AS totalOutput,
            SUM(CAST(f.[Scrap Quantity] AS FLOAT))      AS totalScrap,
            SUM(CAST(f.[Run Time] AS FLOAT))            AS totalRunTime,
            COUNT(DISTINCT f.[Work Center No_])         AS totalWorkCenters,
            COUNT(DISTINCT f.[No_])                     AS activeMachines
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Posting Date] >= :start
        """, nativeQuery = true)
    List<Object[]> findKpiStats(@Param("start") LocalDate start);

    @Query(value = """
        SELECT COUNT(*) AS total, SUM(CASE WHEN ISNULL(mc.[Blocked], 0) = 1 THEN 1 ELSE 0 END) AS blocked
        FROM dbo.MCMachineCenter mc WITH (NOLOCK)
        """, nativeQuery = true)
    List<Object[]> findMachineCounts();

    @Query(value = "SELECT site, COUNT(*) AS machines FROM (SELECT " + MACHINE_SITE + """
         AS site FROM dbo.MCMachineCenter mc WITH (NOLOCK)) t
        GROUP BY site
        """, nativeQuery = true)
    List<Object[]> findMachineCountBySite();
}
