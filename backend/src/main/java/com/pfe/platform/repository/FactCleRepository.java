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
        SELECT TOP 5000
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
        SELECT TOP 5000
            f.[Document No_] AS code,
            f.[Description] AS articleNom,
            CAST(ISNULL(f.[Output Quantity], 100) AS INT) AS quantiteObjectif,
            CAST(ISNULL(f.[Output Quantity], 0) AS INT) AS quantiteProduite,
            f.[Posting Date] AS dateDebut,
            f.[Work Center No_] AS machineNom,
            f.[Data Base] AS responsable
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Document No_] IS NOT NULL
        ORDER BY f.[Entry No_] DESC
        """, nativeQuery = true)
    List<Object[]> findProductionOrdersFromFactCle();

    @Query(value = """
        SELECT TOP 30
            CAST(f.[Posting Date] AS DATE) AS date,
            COUNT(*) AS nb_operations,
            SUM(f.[Output Quantity]) AS total_output,
            SUM(f.[Scrap Quantity]) AS total_scrap,
            SUM(f.[Run Time]) AS total_run_time
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Output Quantity] > 0
        GROUP BY CAST(f.[Posting Date] AS DATE)
        ORDER BY CAST(f.[Posting Date] AS DATE) DESC
        """, nativeQuery = true)
    List<Object[]> findDailyStats();

    @Query(value = """
        SELECT
            f.[Work Center No_],
            COUNT(*) AS operationCount,
            SUM(f.[Output Quantity]) AS totalOutput,
            SUM(f.[Scrap Quantity]) AS totalScrap,
            SUM(f.[Run Time]) AS totalRunTime
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Output Quantity] > 0
        GROUP BY f.[Work Center No_]
        ORDER BY SUM(f.[Output Quantity]) DESC
        """, nativeQuery = true)
    List<Object[]> findWorkCenterStats();

    @Query(value = """
        SELECT
            COUNT(DISTINCT f.[Document No_]) AS totalDocuments,
            COUNT(*) AS totalOperations,
            SUM(f.[Output Quantity]) AS totalOutput,
            SUM(f.[Scrap Quantity]) AS totalScrap,
            SUM(f.[Run Time]) AS totalRunTime,
            COUNT(DISTINCT f.[Work Center No_]) AS totalWorkCenters,
            COUNT(DISTINCT f.[Item No_]) AS totalItems
        FROM dbo.FACT_CLE f WITH (NOLOCK)
        WHERE f.[Output Quantity] > 0
        """, nativeQuery = true)
    List<Object[]> findKpiStats();

    @Query(value = """
        SELECT TOP 5000
            f.[Entry No_]               AS id,
            f.[Item No_]                AS itemReference,
            f.[Description]             AS designation,
            f.[Posting Date]            AS postingDate,
            f.[Entry Type]              AS entryType,
            f.[Document No_]            AS documentNo,
            f.[Quantity]                AS quantite,
            f.[Location Code]           AS locationCode,
            f.[Site Code]               AS siteCode,
            f.[Source No_]              AS sourceNo,
            f.[Cost Amount  (Actual)]   AS coutActuel,
            f.[Data Base]               AS database_
        FROM dbo.FACT_ILE f WITH (NOLOCK)
        WHERE f.[Quantity] <> 0
        ORDER BY f.[Entry No_] DESC
        """, nativeQuery = true)
    List<Object[]> findStockMovementsFromDWH();
}