:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '002_retention_maintenance')
    THROW 51000, 'Migration 002_retention_maintenance must be applied first.', 1;

IF OBJECT_ID(N'web.KnowledgeSources', N'U') IS NULL
BEGIN
    CREATE TABLE web.KnowledgeSources
    (
        SourceId uniqueidentifier NOT NULL
            CONSTRAINT PK_KnowledgeSources PRIMARY KEY,
        SourceType varchar(20) NOT NULL,
        DisplayName nvarchar(300) NOT NULL,
        SourceLocation nvarchar(800) NOT NULL,
        SourceUrl nvarchar(2048) NULL,
        LastModifiedUtc datetime2(3) NOT NULL,
        ContentHash binary(32) NOT NULL,
        ChatbotVisible bit NOT NULL
            CONSTRAINT DF_KnowledgeSources_ChatbotVisible DEFAULT 0,
        CreatedUtc datetime2(3) NOT NULL
            CONSTRAINT DF_KnowledgeSources_CreatedUtc DEFAULT SYSUTCDATETIME(),
        UpdatedUtc datetime2(3) NOT NULL,
        CONSTRAINT UQ_KnowledgeSources_SourceLocation UNIQUE (SourceLocation),
        CONSTRAINT CK_KnowledgeSources_SourceType CHECK (SourceType IN ('document', 'database')),
        CONSTRAINT CK_KnowledgeSources_DisplayName CHECK (LEN(DisplayName) > 0),
        CONSTRAINT CK_KnowledgeSources_Location CHECK
        (
            (SourceType = 'document' AND SourceLocation LIKE N'file:%')
            OR
            (SourceType = 'database' AND SourceLocation LIKE N'sql:%')
        ),
        CONSTRAINT CK_KnowledgeSources_UpdatedRange CHECK (UpdatedUtc >= CreatedUtc)
    );

    CREATE INDEX IX_KnowledgeSources_VisibilityType
        ON web.KnowledgeSources(ChatbotVisible, SourceType, UpdatedUtc DESC)
        INCLUDE(DisplayName, SourceUrl, ContentHash);
END;

IF OBJECT_ID(N'web.KnowledgeChunks', N'U') IS NULL
BEGIN
    CREATE TABLE web.KnowledgeChunks
    (
        ChunkId uniqueidentifier NOT NULL
            CONSTRAINT PK_KnowledgeChunks PRIMARY KEY,
        SourceId uniqueidentifier NOT NULL,
        ChunkNumber int NOT NULL,
        Content nvarchar(max) NOT NULL,
        Embedding vector(768) NOT NULL,
        CreatedUtc datetime2(3) NOT NULL
            CONSTRAINT DF_KnowledgeChunks_CreatedUtc DEFAULT SYSUTCDATETIME(),
        UpdatedUtc datetime2(3) NOT NULL,
        CONSTRAINT FK_KnowledgeChunks_KnowledgeSources
            FOREIGN KEY (SourceId) REFERENCES web.KnowledgeSources(SourceId) ON DELETE CASCADE,
        CONSTRAINT UQ_KnowledgeChunks_SourceChunk UNIQUE (SourceId, ChunkNumber),
        CONSTRAINT CK_KnowledgeChunks_Number CHECK (ChunkNumber > 0),
        CONSTRAINT CK_KnowledgeChunks_Content CHECK (LEN(Content) BETWEEN 1 AND 8000),
        CONSTRAINT CK_KnowledgeChunks_UpdatedRange CHECK (UpdatedUtc >= CreatedUtc)
    );

    CREATE INDEX IX_KnowledgeChunks_SourceId
        ON web.KnowledgeChunks(SourceId, ChunkNumber)
        INCLUDE(CreatedUtc, UpdatedUtc);
END;

IF OBJECT_ID(N'web.ChatbotStructuredContent', N'U') IS NULL
BEGIN
    CREATE TABLE web.ChatbotStructuredContent
    (
        ContentKey nvarchar(200) NOT NULL
            CONSTRAINT PK_ChatbotStructuredContent PRIMARY KEY,
        ContentType varchar(30) NOT NULL,
        DisplayName nvarchar(300) NOT NULL,
        Content nvarchar(max) NOT NULL,
        SourceUrl nvarchar(2048) NULL,
        ChatbotVisible bit NOT NULL
            CONSTRAINT DF_ChatbotStructuredContent_ChatbotVisible DEFAULT 0,
        CreatedUtc datetime2(3) NOT NULL
            CONSTRAINT DF_ChatbotStructuredContent_CreatedUtc DEFAULT SYSUTCDATETIME(),
        UpdatedUtc datetime2(3) NOT NULL,
        CONSTRAINT CK_ChatbotStructuredContent_Type
            CHECK (ContentType IN ('service', 'service_package', 'faq', 'business', 'article', 'case_study', 'contact', 'pricing')),
        CONSTRAINT CK_ChatbotStructuredContent_DisplayName CHECK (LEN(DisplayName) > 0),
        CONSTRAINT CK_ChatbotStructuredContent_Content CHECK (LEN(Content) > 0),
        CONSTRAINT CK_ChatbotStructuredContent_UpdatedRange CHECK (UpdatedUtc >= CreatedUtc)
    );

    CREATE INDEX IX_ChatbotStructuredContent_VisibleType
        ON web.ChatbotStructuredContent(ChatbotVisible, ContentType, UpdatedUtc DESC)
        INCLUDE(DisplayName, SourceUrl);
END;

DECLARE @SeedUtc datetime2(3) = SYSUTCDATETIME();
IF NOT EXISTS (SELECT 1 FROM web.ChatbotStructuredContent WHERE ContentKey = N'service-performance')
    INSERT web.ChatbotStructuredContent(ContentKey, ContentType, DisplayName, Content, SourceUrl, ChatbotVisible, CreatedUtc, UpdatedUtc)
    VALUES(N'service-performance', 'service', N'SQL Server Performance and Troubleshooting',
        N'Netherwood Data Partners helps with slow queries, poor execution plans, blocking, waits, deadlocks, index tuning, and capacity pressure. The work starts with evidence and focuses on root causes.',
        N'/#services', 1, @SeedUtc, @SeedUtc);
IF NOT EXISTS (SELECT 1 FROM web.ChatbotStructuredContent WHERE ContentKey = N'service-reliability')
    INSERT web.ChatbotStructuredContent(ContentKey, ContentType, DisplayName, Content, SourceUrl, ChatbotVisible, CreatedUtc, UpdatedUtc)
    VALUES(N'service-reliability', 'service', N'Database Administration and Reliability',
        N'Netherwood Data Partners provides monitoring, backup and recovery review, configuration drift and stability investigation, temporary DBA coverage, and operational support.',
        N'/#services', 1, @SeedUtc, @SeedUtc);
IF NOT EXISTS (SELECT 1 FROM web.ChatbotStructuredContent WHERE ContentKey = N'service-migrations')
    INSERT web.ChatbotStructuredContent(ContentKey, ContentType, DisplayName, Content, SourceUrl, ChatbotVisible, CreatedUtc, UpdatedUtc)
    VALUES(N'service-migrations', 'service', N'Migrations, Upgrades, and Data Conversions',
        N'Netherwood Data Partners helps plan upgrades, supports cutovers, moves and validates data across systems, and sequences production changes to reduce risk.',
        N'/#services', 1, @SeedUtc, @SeedUtc);
IF NOT EXISTS (SELECT 1 FROM web.ChatbotStructuredContent WHERE ContentKey = N'service-reporting')
    INSERT web.ChatbotStructuredContent(ContentKey, ContentType, DisplayName, Content, SourceUrl, ChatbotVisible, CreatedUtc, UpdatedUtc)
    VALUES(N'service-reporting', 'service', N'Reporting and Data Engineering',
        N'Netherwood Data Partners designs warehouse and reporting pipelines, investigates reporting workloads that affect production, and performs operational data cleanup and quality checks.',
        N'/#services', 1, @SeedUtc, @SeedUtc);
IF NOT EXISTS (SELECT 1 FROM web.ChatbotStructuredContent WHERE ContentKey = N'business-contact')
    INSERT web.ChatbotStructuredContent(ContentKey, ContentType, DisplayName, Content, SourceUrl, ChatbotVisible, CreatedUtc, UpdatedUtc)
    VALUES(N'business-contact', 'contact', N'Contact Netherwood Data Partners',
        N'Prospective clients can contact Netherwood Data Partners at contact@netherwooddatapartners.com. Helpful context includes the database platform, issue or project, urgency, and approximate environment size when known.',
        N'/#contact', 1, @SeedUtc, @SeedUtc);
GO

CREATE OR ALTER PROCEDURE web.SearchChatbotKnowledge
    @QueryEmbedding nvarchar(max),
    @ResultLimit int = 5,
    @MaxDistance float = 0.65
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    IF @ResultLimit < 1 OR @ResultLimit > 10
        THROW 51000, 'ResultLimit must be from 1 through 10.', 1;
    IF @MaxDistance < 0 OR @MaxDistance > 2
        THROW 51000, 'MaxDistance must be from 0 through 2.', 1;
    DECLARE @Vector vector(768) = TRY_CONVERT(vector(768), @QueryEmbedding);
    IF @Vector IS NULL
        THROW 51000, 'QueryEmbedding must contain 768 finite values.', 1;

    SELECT TOP (@ResultLimit)
        source.SourceId,
        source.SourceType,
        source.DisplayName,
        source.SourceUrl,
        chunk.Content,
        distance.Value AS Distance
    FROM web.KnowledgeChunks AS chunk
    JOIN web.KnowledgeSources AS source ON source.SourceId = chunk.SourceId
    CROSS APPLY (VALUES(VECTOR_DISTANCE('cosine', chunk.Embedding, @Vector))) AS distance(Value)
    WHERE source.ChatbotVisible = 1
      AND distance.Value <= @MaxDistance
    ORDER BY distance.Value, source.SourceId, chunk.ChunkNumber;
END;
GO

CREATE OR ALTER PROCEDURE web.ListIndexedKnowledgeSources
    @SourceType varchar(20)
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    IF @SourceType NOT IN ('document', 'database')
        THROW 51000, 'SourceType is not allowed.', 1;
    SELECT SourceLocation, ContentHash, ChatbotVisible
    FROM web.KnowledgeSources
    WHERE SourceType = @SourceType
    ORDER BY SourceLocation;
END;
GO

CREATE OR ALTER PROCEDURE web.GetApprovedStructuredContent
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ContentKey, ContentType, DisplayName, Content, SourceUrl, UpdatedUtc
    FROM web.ChatbotStructuredContent
    WHERE ChatbotVisible = 1
    ORDER BY ContentKey;
END;
GO

CREATE OR ALTER PROCEDURE web.ReplaceKnowledgeSource
    @SourceType varchar(20),
    @DisplayName nvarchar(300),
    @SourceLocation nvarchar(800),
    @SourceUrl nvarchar(2048) = NULL,
    @LastModifiedUtc datetime2(3),
    @ContentHash varbinary(32),
    @ChunksJson nvarchar(max)
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @SourceType NOT IN ('document', 'database')
        THROW 51000, 'SourceType is not allowed.', 1;
    IF (@SourceType = 'document' AND @SourceLocation NOT LIKE N'file:%')
       OR (@SourceType = 'database' AND @SourceLocation NOT LIKE N'sql:%')
        THROW 51000, 'SourceLocation does not match SourceType.', 1;
    IF DATALENGTH(@ContentHash) <> 32 OR ISJSON(@ChunksJson) <> 1
        THROW 51000, 'ContentHash or chunks are invalid.', 1;
    IF NOT EXISTS (SELECT 1 FROM OPENJSON(@ChunksJson))
        THROW 51000, 'At least one knowledge chunk is required.', 1;
    IF EXISTS
    (
        SELECT 1
        FROM OPENJSON(@ChunksJson)
        WITH
        (
            ChunkNumber int '$.chunkNumber',
            Content nvarchar(max) '$.content',
            EmbeddingJson nvarchar(max) '$.embedding' AS JSON
        ) AS item
        WHERE item.ChunkNumber < 1
           OR LEN(item.Content) NOT BETWEEN 1 AND 8000
           OR (SELECT COUNT(*) FROM OPENJSON(item.EmbeddingJson)) <> 768
    )
        THROW 51000, 'A knowledge chunk is invalid.', 1;

    DECLARE @Now datetime2(3) = SYSUTCDATETIME();
    DECLARE @SourceId uniqueidentifier;
    BEGIN TRANSACTION;
    SELECT @SourceId = SourceId
    FROM web.KnowledgeSources WITH (UPDLOCK, HOLDLOCK)
    WHERE SourceLocation = @SourceLocation;

    IF @SourceId IS NOT NULL
       AND EXISTS
       (
           SELECT 1 FROM web.KnowledgeSources
           WHERE SourceId = @SourceId AND ContentHash = @ContentHash AND ChatbotVisible = 1
       )
    BEGIN
        COMMIT TRANSACTION;
        SELECT CAST(0 AS bit) AS Changed;
        RETURN;
    END;

    IF @SourceId IS NULL
    BEGIN
        SET @SourceId = NEWID();
        INSERT web.KnowledgeSources
            (SourceId, SourceType, DisplayName, SourceLocation, SourceUrl, LastModifiedUtc, ContentHash, ChatbotVisible, CreatedUtc, UpdatedUtc)
        VALUES
            (@SourceId, @SourceType, @DisplayName, @SourceLocation, @SourceUrl, @LastModifiedUtc, @ContentHash, 1, @Now, @Now);
    END
    ELSE
    BEGIN
        UPDATE web.KnowledgeSources
        SET SourceType = @SourceType,
            DisplayName = @DisplayName,
            SourceUrl = @SourceUrl,
            LastModifiedUtc = @LastModifiedUtc,
            ContentHash = @ContentHash,
            ChatbotVisible = 1,
            UpdatedUtc = @Now
        WHERE SourceId = @SourceId;
        DELETE FROM web.KnowledgeChunks WHERE SourceId = @SourceId;
    END;

    INSERT web.KnowledgeChunks(ChunkId, SourceId, ChunkNumber, Content, Embedding, CreatedUtc, UpdatedUtc)
    SELECT NEWID(), @SourceId, item.ChunkNumber, item.Content,
        CONVERT(vector(768), item.EmbeddingJson), @Now, @Now
    FROM OPENJSON(@ChunksJson)
    WITH
    (
        ChunkNumber int '$.chunkNumber',
        Content nvarchar(max) '$.content',
        EmbeddingJson nvarchar(max) '$.embedding' AS JSON
    ) AS item;

    COMMIT TRANSACTION;
    SELECT CAST(1 AS bit) AS Changed;
END;
GO

CREATE OR ALTER PROCEDURE web.HideKnowledgeSource
    @SourceType varchar(20),
    @SourceLocation nvarchar(800)
WITH EXECUTE AS OWNER
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @SourceType NOT IN ('document', 'database')
        THROW 51000, 'SourceType is not allowed.', 1;
    BEGIN TRANSACTION;
    UPDATE web.KnowledgeSources
    SET ChatbotVisible = 0, UpdatedUtc = SYSUTCDATETIME()
    WHERE SourceType = @SourceType AND SourceLocation = @SourceLocation;
    DELETE chunk
    FROM web.KnowledgeChunks AS chunk
    JOIN web.KnowledgeSources AS source ON source.SourceId = chunk.SourceId
    WHERE source.SourceType = @SourceType
      AND source.SourceLocation = @SourceLocation
      AND source.ChatbotVisible = 0;
    COMMIT TRANSACTION;
END;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '003_chatbot_knowledge')
    INSERT web.SchemaMigrations(MigrationId) VALUES ('003_chatbot_knowledge');
GO
