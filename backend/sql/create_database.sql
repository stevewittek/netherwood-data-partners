:on error exit

USE master;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @CreatedDatabase bit = 0;

IF DB_ID(N'NDP_Web') IS NULL
BEGIN
    CREATE DATABASE NDP_Web
    ON PRIMARY
    (
        NAME = N'NDP_Web_Data',
        FILENAME = N'/var/opt/mssql/data/NDP_Web.mdf',
        SIZE = 128MB,
        FILEGROWTH = 64MB
    )
    LOG ON
    (
        NAME = N'NDP_Web_Log',
        FILENAME = N'/var/opt/mssql/logdata/NDP_Web_log.ldf',
        SIZE = 64MB,
        FILEGROWTH = 64MB
    );

    SET @CreatedDatabase = 1;
END;

ALTER DATABASE NDP_Web SET AUTO_CLOSE OFF;
ALTER DATABASE NDP_Web SET AUTO_SHRINK OFF;
ALTER DATABASE NDP_Web SET PAGE_VERIFY CHECKSUM;

-- SIMPLE is the safe initial state while no tested log-backup chain exists.
-- Do not silently undo a later, deliberate switch to FULL on a rerun.
IF @CreatedDatabase = 1
    ALTER DATABASE NDP_Web SET RECOVERY SIMPLE;
GO
