:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '003_chatbot_knowledge')
    THROW 51000, 'Migration 003_chatbot_knowledge must be applied first.', 1;

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '004_knowledge_location_index')
BEGIN
    BEGIN TRANSACTION;
    IF EXISTS (SELECT 1 FROM web.KnowledgeSources WHERE LEN(SourceLocation) > 800)
        THROW 51000, 'A knowledge source location exceeds the supported 800 characters.', 1;

    IF COL_LENGTH(N'web.KnowledgeSources', N'SourceLocation') > 1600
    BEGIN
        ALTER TABLE web.KnowledgeSources DROP CONSTRAINT UQ_KnowledgeSources_SourceLocation;
        ALTER TABLE web.KnowledgeSources ALTER COLUMN SourceLocation nvarchar(800) NOT NULL;
        ALTER TABLE web.KnowledgeSources ADD CONSTRAINT UQ_KnowledgeSources_SourceLocation UNIQUE(SourceLocation);
    END;

    INSERT web.SchemaMigrations(MigrationId) VALUES ('004_knowledge_location_index');
    COMMIT TRANSACTION;
END;
GO
