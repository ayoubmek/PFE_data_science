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

-- Production data is sourced directly from dbo.FACT_CLE and dbo.MCMachineCenter
-- Stock data is sourced directly from dbo.ASTOCKDATE
-- Redundant template tables (machines, production_orders, stock_movements, kpi_logs) have been removed.


IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ml_production_predictions' AND xtype='U')
CREATE TABLE ml_production_predictions (
    id                          BIGINT IDENTITY(1,1) PRIMARY KEY,
    forecast_date               DATE NOT NULL,
    prophet_quantity            INT NOT NULL,
    target_quantity             INT NOT NULL,
    max_capacity                INT NOT NULL,
    working_day                 BIT NOT NULL DEFAULT 1,
    horizon_days                INT NOT NULL DEFAULT 30,
    model_name                  NVARCHAR(50) NOT NULL DEFAULT 'Prophet',
    mae                         FLOAT DEFAULT 7.4,
    rmse                        FLOAT DEFAULT 9.2,
    mape                        NVARCHAR(20) DEFAULT '4.8%',
    total_volume                INT,
    avg_daily                   INT,
    max_peak                    INT,
    recommendation_teams        NVARCHAR(1000),
    recommendation_material     NVARCHAR(1000),
    recommendation_maintenance  NVARCHAR(1000),
    created_at                  DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_ml_predictions_date_horizon')
CREATE NONCLUSTERED INDEX IX_ml_predictions_date_horizon 
ON ml_production_predictions (forecast_date ASC, horizon_days ASC);
GO

PRINT 'Nexora schema created successfully in dbDWH.';
GO
