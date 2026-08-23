:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;

IF DB_NAME() <> N'NDP_Web'
    THROW 51000, '001_initial_schema.sql must run in NDP_Web.', 1;

BEGIN TRANSACTION;

IF SCHEMA_ID(N'web') IS NULL
    EXEC(N'CREATE SCHEMA web AUTHORIZATION dbo;');

IF OBJECT_ID(N'web.SchemaMigrations', N'U') IS NULL
BEGIN
    CREATE TABLE web.SchemaMigrations
    (
        MigrationId varchar(100) NOT NULL
            CONSTRAINT PK_SchemaMigrations PRIMARY KEY,
        AppliedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_SchemaMigrations_AppliedAtUtc DEFAULT SYSUTCDATETIME()
    );
END;

IF NOT EXISTS
(
    SELECT 1
    FROM web.SchemaMigrations
    WHERE MigrationId = '001_initial_schema'
)
BEGIN
    CREATE TABLE web.Visitors
    (
        VisitorId uniqueidentifier NOT NULL
            CONSTRAINT PK_Visitors PRIMARY KEY,
        FirstSeenUtc datetime2(3) NOT NULL,
        LastSeenUtc datetime2(3) NOT NULL,
        BrowserLanguage nvarchar(32) NULL,
        CreatedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_Visitors_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_Visitors_SeenRange CHECK (LastSeenUtc >= FirstSeenUtc)
    );

    CREATE INDEX IX_Visitors_LastSeenUtc
        ON web.Visitors(LastSeenUtc);

    CREATE TABLE web.VisitorSessions
    (
        SessionId uniqueidentifier NOT NULL
            CONSTRAINT PK_VisitorSessions PRIMARY KEY,
        VisitorId uniqueidentifier NOT NULL,
        StartedAtUtc datetime2(3) NOT NULL,
        LastSeenUtc datetime2(3) NOT NULL,
        UtmSource nvarchar(200) NULL,
        UtmMedium nvarchar(200) NULL,
        UtmCampaign nvarchar(200) NULL,
        Referrer nvarchar(2048) NULL,
        UserAgent nvarchar(1024) NULL,
        RegionCode nvarchar(32) NULL,
        IpAbuseHash varbinary(32) NULL,
        IpAbuseHashExpiresAtUtc datetime2(3) NULL,
        CONSTRAINT FK_VisitorSessions_Visitors
            FOREIGN KEY (VisitorId) REFERENCES web.Visitors(VisitorId),
        CONSTRAINT CK_VisitorSessions_SeenRange
            CHECK (LastSeenUtc >= StartedAtUtc),
        CONSTRAINT CK_VisitorSessions_IpHashExpiry
            CHECK
            (
                (IpAbuseHash IS NULL AND IpAbuseHashExpiresAtUtc IS NULL)
                OR
                (IpAbuseHash IS NOT NULL AND IpAbuseHashExpiresAtUtc IS NOT NULL)
            )
    );

    CREATE INDEX IX_VisitorSessions_Visitor_StartedAtUtc
        ON web.VisitorSessions(VisitorId, StartedAtUtc DESC);
    CREATE INDEX IX_VisitorSessions_LastSeenUtc
        ON web.VisitorSessions(LastSeenUtc);

    CREATE TABLE web.PageViews
    (
        PageViewId bigint IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_PageViews PRIMARY KEY,
        SessionId uniqueidentifier NOT NULL,
        Path nvarchar(2048) NOT NULL,
        ViewedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_PageViews_ViewedAtUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PageViews_VisitorSessions
            FOREIGN KEY (SessionId) REFERENCES web.VisitorSessions(SessionId),
        CONSTRAINT CK_PageViews_Path CHECK (LEFT(Path, 1) = N'/')
    );

    CREATE INDEX IX_PageViews_Session_ViewedAtUtc
        ON web.PageViews(SessionId, ViewedAtUtc DESC);
    CREATE INDEX IX_PageViews_ViewedAtUtc
        ON web.PageViews(ViewedAtUtc);

    CREATE TABLE web.ChatSessions
    (
        ChatSessionId uniqueidentifier NOT NULL
            CONSTRAINT PK_ChatSessions PRIMARY KEY,
        VisitorSessionId uniqueidentifier NULL,
        StartedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_ChatSessions_StartedAtUtc DEFAULT SYSUTCDATETIME(),
        LastMessageAtUtc datetime2(3) NOT NULL,
        Status varchar(20) NOT NULL,
        CONSTRAINT FK_ChatSessions_VisitorSessions
            FOREIGN KEY (VisitorSessionId) REFERENCES web.VisitorSessions(SessionId),
        CONSTRAINT CK_ChatSessions_Status
            CHECK (Status IN ('active', 'closed', 'blocked')),
        CONSTRAINT CK_ChatSessions_MessageRange
            CHECK (LastMessageAtUtc >= StartedAtUtc)
    );

    CREATE INDEX IX_ChatSessions_VisitorSession_StartedAtUtc
        ON web.ChatSessions(VisitorSessionId, StartedAtUtc DESC);
    CREATE INDEX IX_ChatSessions_LastMessageAtUtc
        ON web.ChatSessions(LastMessageAtUtc);

    CREATE TABLE web.ChatMessages
    (
        ChatMessageId bigint IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_ChatMessages PRIMARY KEY,
        ChatSessionId uniqueidentifier NOT NULL,
        Role varchar(20) NOT NULL,
        Content nvarchar(max) NOT NULL,
        ProviderResponseId nvarchar(200) NULL,
        CreatedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_ChatMessages_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ChatMessages_ChatSessions
            FOREIGN KEY (ChatSessionId) REFERENCES web.ChatSessions(ChatSessionId),
        CONSTRAINT CK_ChatMessages_Role
            CHECK (Role IN ('user', 'assistant', 'system')),
        CONSTRAINT CK_ChatMessages_Content CHECK (LEN(Content) > 0)
    );

    CREATE INDEX IX_ChatMessages_Session_CreatedAtUtc
        ON web.ChatMessages(ChatSessionId, CreatedAtUtc);
    CREATE INDEX IX_ChatMessages_CreatedAtUtc
        ON web.ChatMessages(CreatedAtUtc);

    CREATE TABLE web.Contacts
    (
        ContactId uniqueidentifier NOT NULL
            CONSTRAINT PK_Contacts PRIMARY KEY,
        Name nvarchar(200) NOT NULL,
        Email nvarchar(320) NOT NULL,
        Company nvarchar(200) NULL,
        Phone nvarchar(50) NULL,
        CreatedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_Contacts_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        ModifiedAtUtc datetime2(3) NOT NULL,
        CONSTRAINT CK_Contacts_Name CHECK (LEN(Name) > 0),
        CONSTRAINT CK_Contacts_Email CHECK (Email LIKE N'%_@_%._%'),
        CONSTRAINT CK_Contacts_ModifiedRange
            CHECK (ModifiedAtUtc >= CreatedAtUtc)
    );

    CREATE INDEX IX_Contacts_Email
        ON web.Contacts(Email);

    CREATE TABLE web.Leads
    (
        LeadId uniqueidentifier NOT NULL
            CONSTRAINT PK_Leads PRIMARY KEY,
        ContactId uniqueidentifier NOT NULL,
        ChatSessionId uniqueidentifier NULL,
        ProjectInformation nvarchar(max) NOT NULL,
        Status varchar(20) NOT NULL
            CONSTRAINT DF_Leads_Status DEFAULT 'new',
        CreatedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_Leads_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        ModifiedAtUtc datetime2(3) NOT NULL,
        CONSTRAINT FK_Leads_Contacts
            FOREIGN KEY (ContactId) REFERENCES web.Contacts(ContactId),
        CONSTRAINT FK_Leads_ChatSessions
            FOREIGN KEY (ChatSessionId) REFERENCES web.ChatSessions(ChatSessionId),
        CONSTRAINT CK_Leads_ProjectInformation
            CHECK (LEN(ProjectInformation) > 0),
        CONSTRAINT CK_Leads_Status
            CHECK (Status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
        CONSTRAINT CK_Leads_ModifiedRange
            CHECK (ModifiedAtUtc >= CreatedAtUtc)
    );

    CREATE INDEX IX_Leads_Contact_CreatedAtUtc
        ON web.Leads(ContactId, CreatedAtUtc DESC);
    CREATE INDEX IX_Leads_Status_CreatedAtUtc
        ON web.Leads(Status, CreatedAtUtc DESC);

    CREATE TABLE web.BlogPosts
    (
        BlogPostId uniqueidentifier NOT NULL
            CONSTRAINT PK_BlogPosts PRIMARY KEY,
        Slug nvarchar(200) NOT NULL
            CONSTRAINT UQ_BlogPosts_Slug UNIQUE,
        Title nvarchar(300) NOT NULL,
        Summary nvarchar(1000) NULL,
        Markdown nvarchar(max) NULL,
        SanitizedHtml nvarchar(max) NULL,
        SeoTitle nvarchar(300) NULL,
        SeoDescription nvarchar(500) NULL,
        Status varchar(20) NOT NULL,
        CreatedAtUtc datetime2(3) NOT NULL,
        ModifiedAtUtc datetime2(3) NOT NULL,
        PublishedAtUtc datetime2(3) NULL,
        CONSTRAINT CK_BlogPosts_Slug
            CHECK (LEN(Slug) > 0 AND Slug NOT LIKE N'%[^a-z0-9-]%'),
        CONSTRAINT CK_BlogPosts_Title CHECK (LEN(Title) > 0),
        CONSTRAINT CK_BlogPosts_Status
            CHECK (Status IN ('draft', 'published', 'archived')),
        CONSTRAINT CK_BlogPosts_ModifiedRange
            CHECK (ModifiedAtUtc >= CreatedAtUtc),
        CONSTRAINT CK_BlogPosts_PublishedState
            CHECK
            (
                (Status = 'published' AND PublishedAtUtc IS NOT NULL)
                OR
                (Status <> 'published')
            )
    );

    CREATE INDEX IX_BlogPosts_Status_PublishedAtUtc
        ON web.BlogPosts(Status, PublishedAtUtc DESC);

    CREATE TABLE web.BlogImages
    (
        BlogImageId uniqueidentifier NOT NULL
            CONSTRAINT PK_BlogImages PRIMARY KEY,
        BlogPostId uniqueidentifier NOT NULL,
        StorageKey nvarchar(500) NOT NULL,
        MimeType nvarchar(100) NOT NULL,
        AltText nvarchar(500) NOT NULL,
        Caption nvarchar(1000) NULL,
        CreatedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_BlogImages_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_BlogImages_BlogPosts
            FOREIGN KEY (BlogPostId) REFERENCES web.BlogPosts(BlogPostId),
        CONSTRAINT UQ_BlogImages_StorageKey UNIQUE (StorageKey),
        CONSTRAINT CK_BlogImages_AltText CHECK (LEN(AltText) > 0)
    );

    CREATE INDEX IX_BlogImages_BlogPostId
        ON web.BlogImages(BlogPostId);

    CREATE TABLE web.ApplicationConfiguration
    (
        ConfigKey nvarchar(200) NOT NULL
            CONSTRAINT PK_ApplicationConfiguration PRIMARY KEY,
        ConfigValue nvarchar(max) NOT NULL,
        ModifiedAtUtc datetime2(3) NOT NULL,
        IsSecret bit NOT NULL
            CONSTRAINT DF_ApplicationConfiguration_IsSecret DEFAULT 0,
        CONSTRAINT CK_ApplicationConfiguration_Key CHECK (LEN(ConfigKey) > 0)
    );

    CREATE TABLE web.DataRetentionPolicies
    (
        DataClass varchar(50) NOT NULL
            CONSTRAINT PK_DataRetentionPolicies PRIMARY KEY,
        RetentionDays smallint NOT NULL,
        Description nvarchar(500) NOT NULL,
        ModifiedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_DataRetentionPolicies_ModifiedAtUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_DataRetentionPolicies_RetentionDays
            CHECK (RetentionDays BETWEEN 1 AND 3650)
    );

    INSERT web.DataRetentionPolicies(DataClass, RetentionDays, Description)
    VALUES
        ('ip_abuse_hash', 7, N'Keyed IP abuse hashes; clear after seven days.'),
        ('page_view', 90, N'First-party aggregate traffic records.'),
        ('chat', 90, N'Chat sessions and messages without an active lead.'),
        ('audit', 180, N'Operational audit events.'),
        ('lead', 730, N'Voluntarily submitted project and contact details.');

    CREATE TABLE web.AuditLog
    (
        AuditId bigint IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_AuditLog PRIMARY KEY,
        EventType nvarchar(100) NOT NULL,
        SubjectId nvarchar(200) NULL,
        DetailJson nvarchar(max) NULL,
        CreatedAtUtc datetime2(3) NOT NULL
            CONSTRAINT DF_AuditLog_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_AuditLog_EventType CHECK (LEN(EventType) > 0),
        CONSTRAINT CK_AuditLog_DetailJson
            CHECK (DetailJson IS NULL OR ISJSON(DetailJson) = 1)
    );

    CREATE INDEX IX_AuditLog_CreatedAtUtc
        ON web.AuditLog(CreatedAtUtc);

    INSERT web.SchemaMigrations(MigrationId)
    VALUES ('001_initial_schema');
END;

COMMIT TRANSACTION;
