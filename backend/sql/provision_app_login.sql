:on error exit

USE master;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF N'$(AppPasswordHex)' = N''
   OR N'$(AppPasswordHex)' LIKE N'%[^0-9A-Fa-f]%'
   OR LEN(N'$(AppPasswordHex)') % 4 <> 0
    THROW 51000, 'AppPasswordHex is missing or invalid.', 1;

DECLARE @AppPassword nvarchar(128) = CONVERT
(
    nvarchar(128),
    CONVERT(varbinary(256), N'$(AppPasswordHex)', 2)
);

IF LEN(@AppPassword) < 24 OR LEN(@AppPassword) > 128
    THROW 51000, 'The application password must contain 24 to 128 characters.', 1;

IF SUSER_ID(N'ndp_web_app') IS NULL
BEGIN
    DECLARE @CreateLogin nvarchar(max) =
        N'CREATE LOGIN ndp_web_app WITH PASSWORD = '
        + QUOTENAME(@AppPassword, N'''')
        + N', CHECK_POLICY = ON, CHECK_EXPIRATION = OFF, DEFAULT_DATABASE = NDP_Web;';
    EXEC(@CreateLogin);
END;
GO

USE NDP_Web;
GO

IF USER_ID(N'ndp_web_app') IS NULL
    CREATE USER ndp_web_app FOR LOGIN ndp_web_app;

IF DATABASE_PRINCIPAL_ID(N'web_runtime') IS NULL
    CREATE ROLE web_runtime AUTHORIZATION dbo;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.database_role_members
    WHERE role_principal_id = DATABASE_PRINCIPAL_ID(N'web_runtime')
      AND member_principal_id = DATABASE_PRINCIPAL_ID(N'ndp_web_app')
)
    ALTER ROLE web_runtime ADD MEMBER ndp_web_app;

GRANT SELECT, INSERT, UPDATE ON web.Visitors TO web_runtime;
GRANT SELECT, INSERT, UPDATE ON web.VisitorSessions TO web_runtime;
GRANT SELECT, INSERT ON web.PageViews TO web_runtime;
GRANT SELECT, INSERT, UPDATE ON web.ChatSessions TO web_runtime;
GRANT SELECT, INSERT ON web.ChatMessages TO web_runtime;
GRANT SELECT, INSERT, UPDATE ON web.Contacts TO web_runtime;
GRANT SELECT, INSERT, UPDATE ON web.Leads TO web_runtime;
GRANT INSERT ON web.AuditLog TO web_runtime;

DENY DELETE ON SCHEMA::web TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.ApplicationConfiguration TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.DataRetentionPolicies TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogPosts TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogImages TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.SchemaMigrations TO web_runtime;
GO

SELECT
    DB_NAME() AS DatabaseName,
    dp.name AS DatabaseUser,
    rp.name AS DatabaseRole
FROM sys.database_principals AS dp
JOIN sys.database_role_members AS drm
    ON drm.member_principal_id = dp.principal_id
JOIN sys.database_principals AS rp
    ON rp.principal_id = drm.role_principal_id
WHERE dp.name = N'ndp_web_app';
GO
