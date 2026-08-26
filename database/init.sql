USE dbDWH;
GO

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
