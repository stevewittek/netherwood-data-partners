:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;

IF SUSER_SNAME() <> N'ndp_web_app' OR USER_NAME() <> N'ndp_web_app'
    THROW 51000, 'Runtime verification must connect as ndp_web_app.', 1;

IF IS_ROLEMEMBER(N'web_runtime') <> 1
    THROW 51000, 'ndp_web_app is not a member of web_runtime.', 1;

IF ISNULL(HAS_PERMS_BY_NAME(N'web.Visitors', N'OBJECT', N'SELECT'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.Visitors', N'OBJECT', N'INSERT'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.Visitors', N'OBJECT', N'UPDATE'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.PageViews', N'OBJECT', N'INSERT'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.ChatMessages', N'OBJECT', N'INSERT'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.Contacts', N'OBJECT', N'INSERT'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.Leads', N'OBJECT', N'INSERT'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.AuditLog', N'OBJECT', N'INSERT'), 0) <> 1
    THROW 51000, 'ndp_web_app lacks a required runtime permission.', 1;

IF ISNULL(HAS_PERMS_BY_NAME(N'web.Visitors', N'OBJECT', N'DELETE'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.BlogPosts', N'OBJECT', N'SELECT'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.ApplicationConfiguration', N'OBJECT', N'SELECT'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.SchemaMigrations', N'OBJECT', N'SELECT'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web', N'SCHEMA', N'ALTER'), 0) <> 0
    THROW 51000, 'ndp_web_app has a prohibited runtime permission.', 1;

SELECT
    N'runtime_login_verified' AS VerificationStatus,
    DB_NAME() AS DatabaseName,
    SUSER_SNAME() AS LoginName,
    USER_NAME() AS DatabaseUser;
GO
