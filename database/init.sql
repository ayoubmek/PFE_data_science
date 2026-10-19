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

PRINT 'Nexora schema created successfully in dbDWH.';
GO
