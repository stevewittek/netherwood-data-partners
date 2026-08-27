:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;

IF NOT EXISTS
(
    SELECT 1
    FROM web.SchemaMigrations
    WHERE MigrationId = '001_initial_schema'
)
    THROW 51000, 'The initial schema migration is not recorded.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM web.SchemaMigrations
    WHERE MigrationId = '002_retention_maintenance'
)
    THROW 51000, 'The retention maintenance migration is not recorded.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM web.SchemaMigrations
    WHERE MigrationId = '003_chatbot_knowledge'
)
    THROW 51000, 'The chatbot knowledge migration is not recorded.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM web.SchemaMigrations
    WHERE MigrationId = '004_knowledge_location_index'
)
    THROW 51000, 'The knowledge location index hardening migration is not recorded.', 1;

IF OBJECT_ID(N'web.PurgeExpiredData', N'P') IS NULL
    THROW 51000, 'The retention maintenance procedure is missing.', 1;

IF DATABASE_PRINCIPAL_ID(N'web_maintenance') IS NULL
    THROW 51000, 'The maintenance database role is missing.', 1;

DECLARE @ExpectedTables table (TableName sysname PRIMARY KEY);
INSERT @ExpectedTables(TableName)
VALUES
    (N'ApplicationConfiguration'),
    (N'AuditLog'),
    (N'BlogImages'),
    (N'BlogPosts'),
    (N'ChatMessages'),
    (N'ChatSessions'),
    (N'ChatbotStructuredContent'),
    (N'Contacts'),
    (N'DataRetentionPolicies'),
    (N'Leads'),
    (N'KnowledgeChunks'),
    (N'KnowledgeSources'),
    (N'PageViews'),
    (N'SchemaMigrations'),
    (N'Visitors'),
    (N'VisitorSessions');

IF EXISTS
(
    SELECT TableName FROM @ExpectedTables
    EXCEPT
    SELECT name FROM sys.tables WHERE schema_id = SCHEMA_ID(N'web')
)
    THROW 51000, 'One or more required web tables are missing.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.columns AS columnrow
    JOIN sys.tables AS tablerow ON tablerow.object_id = columnrow.object_id
    WHERE tablerow.schema_id = SCHEMA_ID(N'web')
      AND tablerow.name = N'KnowledgeChunks'
      AND columnrow.name = N'Embedding'
      AND TYPE_NAME(columnrow.user_type_id) = N'vector'
      AND columnrow.vector_dimensions = 768
)
    THROW 51000, 'KnowledgeChunks.Embedding is not VECTOR(768).', 1;

DECLARE @ExpectedProcedures table (ProcedureName sysname PRIMARY KEY);
INSERT @ExpectedProcedures(ProcedureName)
VALUES
    (N'GetApprovedStructuredContent'),
    (N'HideKnowledgeSource'),
    (N'ListIndexedKnowledgeSources'),
    (N'ReplaceKnowledgeSource'),
    (N'SearchChatbotKnowledge');

IF EXISTS
(
    SELECT ProcedureName FROM @ExpectedProcedures
    EXCEPT
    SELECT name FROM sys.procedures WHERE schema_id = SCHEMA_ID(N'web')
)
    THROW 51000, 'One or more chatbot knowledge procedures are missing.', 1;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.database_principals AS member
    JOIN sys.database_role_members AS drm
        ON drm.member_principal_id = member.principal_id
    JOIN sys.database_principals AS role
        ON role.principal_id = drm.role_principal_id
    WHERE member.name = N'ndp_web_app'
      AND role.name = N'web_runtime'
)
    THROW 51000, 'ndp_web_app is not a member of web_runtime.', 1;

SELECT
    N'database_verified' AS VerificationStatus,
    DB_NAME() AS DatabaseName,
    (SELECT COUNT(*) FROM @ExpectedTables) AS RequiredTableCount,
    (SELECT COUNT(*) FROM @ExpectedProcedures) AS KnowledgeProcedureCount,
    (SELECT COUNT(*) FROM web.DataRetentionPolicies) AS RetentionPolicyCount,
    (SELECT MAX(AppliedAtUtc) FROM web.SchemaMigrations) AS LastMigrationAtUtc;
GO
