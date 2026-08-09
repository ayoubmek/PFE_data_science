-- ============================================================
-- PFE Platform - SQL Server Init Script
-- Microsoft SQL Server 2019+
-- Run against the existing dbDWH database
--
-- NOTE: With ddl-auto=update, Hibernate auto-creates these tables.
-- Use this script only for manual setup or reference.
-- Table names are snake_case to match SpringPhysicalNamingStrategy.
-- ============================================================

USE dbDWH;
GO

-- ── USERS ────────────────────────────────────────────────────────────────────
-- Entity: User  @Table(name="AppUsers") → Hibernate generates: app_users
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='app_users' AND xtype='U')
CREATE TABLE app_users (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    username    NVARCHAR(50)  NOT NULL UNIQUE,
    password    NVARCHAR(255) NOT NULL,
    full_name   NVARCHAR(100) NOT NULL,
    email       NVARCHAR(100) NOT NULL UNIQUE,
    role        NVARCHAR(20)  NOT NULL DEFAULT 'OPERATEUR',
    enabled     BIT           NOT NULL DEFAULT 1,
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ── MACHINES ─────────────────────────────────────────────────────────────────
-- Entity: Machine  @Table(name="Machines") → Hibernate generates: machines
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='machines' AND xtype='U')
CREATE TABLE machines (
    id                    BIGINT IDENTITY(1,1) PRIMARY KEY,
    code                  NVARCHAR(50)   NOT NULL UNIQUE,
    nom                   NVARCHAR(100)  NOT NULL,
    type                  NVARCHAR(50),
    emplacement           NVARCHAR(100),
    statut                NVARCHAR(30)   NOT NULL DEFAULT 'DISPONIBLE',
    taux_rendement        FLOAT          DEFAULT 100.0,
    derniere_maintenance  DATETIME2,
    prochaine_maintenance DATETIME2,
    created_at            DATETIME2      NOT NULL DEFAULT GETDATE()
);
GO

-- ── PRODUCTION ORDERS ────────────────────────────────────────────────────────
-- Entity: ProductionOrder  @Table(name="ProductionOrders") → production_orders
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='production_orders' AND xtype='U')
CREATE TABLE production_orders (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    reference           NVARCHAR(50)   NOT NULL UNIQUE,
    article             NVARCHAR(200)  NOT NULL,
    quantite_prevue     INT            NOT NULL,
    quantite_realisee   INT            DEFAULT 0,
    statut              NVARCHAR(30)   NOT NULL DEFAULT 'EN_ATTENTE',
    date_debut          DATE,
    date_fin            DATE,
    machine_id          BIGINT         REFERENCES machines(id),
    responsable         NVARCHAR(100),
    notes               NVARCHAR(1000),
    created_at          DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2
);
GO

-- ── STOCK MOVEMENTS ──────────────────────────────────────────────────────────
-- Entity: StockMovement  @Table(name="StockMovements") → stock_movements
-- References items by reference string (joins to legacy dbo.ASTOCKDATE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='stock_movements' AND xtype='U')
CREATE TABLE stock_movements (
    id                    BIGINT IDENTITY(1,1) PRIMARY KEY,
    stock_item_reference  NVARCHAR(50)   NOT NULL,
    type                  NVARCHAR(20)   NOT NULL,
    quantite              DECIMAL(18,6)  NOT NULL,
    motif                 NVARCHAR(255),
    operateur             NVARCHAR(100),
    reference             NVARCHAR(50),
    date                  DATETIME2      NOT NULL DEFAULT GETDATE()
);
GO

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
-- Entity: Notification  @Table(name="Notifications") → notifications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
CREATE TABLE notifications (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    titre       NVARCHAR(200)  NOT NULL,
    message     NVARCHAR(1000) NOT NULL,
    type        NVARCHAR(30)   NOT NULL DEFAULT 'INFO',
    priorite    NVARCHAR(20)   NOT NULL DEFAULT 'NORMALE',
    lu          BIT            NOT NULL DEFAULT 0,
    module      NVARCHAR(50),
    entity_id   NVARCHAR(50),
    username    NVARCHAR(50),
    created_at  DATETIME2      NOT NULL DEFAULT GETDATE()
);
GO

-- ── KPI LOGS ─────────────────────────────────────────────────────────────────
-- No Java entity — used for raw logging if needed
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='kpi_logs' AND xtype='U')
CREATE TABLE kpi_logs (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    module      NVARCHAR(50)   NOT NULL,
    kpi_name    NVARCHAR(100)  NOT NULL,
    kpi_value   FLOAT          NOT NULL,
    logged_at   DATETIME2      NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'PFE Platform schema created successfully in dbDWH.';
GO
