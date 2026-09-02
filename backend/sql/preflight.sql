:on error exit

USE master;
GO

SET NOCOUNT ON;

DECLARE @ExpectedDataPath nvarchar(4000) = N'/var/opt/mssql/userdata/';
DECLARE @ExpectedLogPath nvarchar(4000) = N'/var/opt/mssql/userlog/';
DECLARE @ActualDataPath nvarchar(4000) =
    CONVERT(nvarchar(4000), SERVERPROPERTY('InstanceDefaultDataPath'));
DECLARE @ActualLogPath nvarchar(4000) =
    CONVERT(nvarchar(4000), SERVERPROPERTY('InstanceDefaultLogPath'));

SET @ActualDataPath = REPLACE(@ActualDataPath, N'\', N'/');
SET @ActualLogPath = REPLACE(@ActualLogPath, N'\', N'/');
IF RIGHT(@ActualDataPath, 1) <> N'/' SET @ActualDataPath += N'/';
IF RIGHT(@ActualLogPath, 1) <> N'/' SET @ActualLogPath += N'/';

SELECT
    CONVERT(nvarchar(128), SERVERPROPERTY('ServerName')) AS ServerName,
    CONVERT(nvarchar(128), SERVERPROPERTY('ProductVersion')) AS ProductVersion,
    CONVERT(nvarchar(128), SERVERPROPERTY('Edition')) AS Edition,
    CONVERT(nvarchar(260), @ActualDataPath) AS InstanceDefaultDataPath,
    CONVERT(nvarchar(260), @ActualLogPath) AS InstanceDefaultLogPath,
    HAS_PERMS_BY_NAME(NULL, NULL, 'CREATE ANY DATABASE') AS CanCreateDatabase,
    HAS_PERMS_BY_NAME(NULL, NULL, 'ALTER ANY LOGIN') AS CanAlterAnyLogin;

IF @ActualDataPath IS NULL OR @ActualLogPath IS NULL
    THROW 51000, 'SQL Server did not report both instance default paths.', 1;

IF LOWER(@ActualDataPath) <> LOWER(@ExpectedDataPath)
    THROW 51000, 'InstanceDefaultDataPath is not /var/opt/mssql/userdata/. Stop before database creation.', 1;

IF LOWER(@ActualLogPath) <> LOWER(@ExpectedLogPath)
    THROW 51000, 'InstanceDefaultLogPath is not /var/opt/mssql/userlog/. Stop before database creation.', 1;

IF ISNULL(HAS_PERMS_BY_NAME(NULL, NULL, 'CREATE ANY DATABASE'), 0) <> 1
    THROW 51000, 'The setup principal lacks CREATE ANY DATABASE.', 1;

IF ISNULL(HAS_PERMS_BY_NAME(NULL, NULL, 'ALTER ANY LOGIN'), 0) <> 1
    THROW 51000, 'The setup principal lacks ALTER ANY LOGIN.', 1;

IF DB_ID(N'NDP_Web') IS NOT NULL
BEGIN
    IF EXISTS
    (
        SELECT 1
        FROM sys.master_files
        WHERE database_id = DB_ID(N'NDP_Web')
          AND
          (
              (type = 0 AND LOWER(REPLACE(physical_name, N'\', N'/')) NOT LIKE LOWER(@ExpectedDataPath) + N'%')
              OR
              (type = 1 AND LOWER(REPLACE(physical_name, N'\', N'/')) NOT LIKE LOWER(@ExpectedLogPath) + N'%')
          )
    )
        THROW 51000, 'Existing NDP_Web files are outside the approved DATA/LOG paths.', 1;

    SELECT
        N'existing_database_verified' AS PreflightStatus,
        name AS LogicalName,
        type_desc AS FileType,
        physical_name AS PhysicalName
    FROM sys.master_files
    WHERE database_id = DB_ID(N'NDP_Web')
    ORDER BY file_id;
END
ELSE
BEGIN
    SELECT N'new_database_ready' AS PreflightStatus;
END;
GO
