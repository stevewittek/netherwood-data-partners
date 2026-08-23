:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '001_initial_schema')
    THROW 51000, 'Migration 001_initial_schema must be applied first.', 1;

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '002_retention_maintenance')
BEGIN
    BEGIN TRANSACTION;

    IF DATABASE_PRINCIPAL_ID(N'web_maintenance') IS NULL
        CREATE ROLE web_maintenance AUTHORIZATION dbo;

    EXEC(N'
    CREATE OR ALTER PROCEDURE web.PurgeExpiredData
        @AsOfUtc datetime2(3) = NULL,
        @BatchSize int = 1000
    WITH EXECUTE AS OWNER
    AS
    BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;

        IF @AsOfUtc IS NULL SET @AsOfUtc = SYSUTCDATETIME();
        IF @BatchSize < 1 OR @BatchSize > 10000
            THROW 51000, ''BatchSize must be from 1 through 10000.'', 1;

        DECLARE
            @PageViewDays int,
            @ChatDays int,
            @AuditDays int,
            @LeadDays int;

        SELECT @PageViewDays = RetentionDays FROM web.DataRetentionPolicies WHERE DataClass = ''page_view'';
        SELECT @ChatDays = RetentionDays FROM web.DataRetentionPolicies WHERE DataClass = ''chat'';
        SELECT @AuditDays = RetentionDays FROM web.DataRetentionPolicies WHERE DataClass = ''audit'';
        SELECT @LeadDays = RetentionDays FROM web.DataRetentionPolicies WHERE DataClass = ''lead'';

        IF @PageViewDays IS NULL OR @ChatDays IS NULL OR @AuditDays IS NULL OR @LeadDays IS NULL
            THROW 51000, ''A required data retention policy is missing.'', 1;

        DECLARE
            @HashesCleared int = 0,
            @LeadsDeleted int = 0,
            @ContactsDeleted int = 0,
            @ChatMessagesDeleted int = 0,
            @ChatSessionsDeleted int = 0,
            @PageViewsDeleted int = 0,
            @VisitorSessionsDeleted int = 0,
            @VisitorsDeleted int = 0,
            @AuditEventsDeleted int = 0;

        BEGIN TRANSACTION;

        UPDATE TOP (@BatchSize) web.VisitorSessions
        SET IpAbuseHash = NULL, IpAbuseHashExpiresAtUtc = NULL
        WHERE IpAbuseHashExpiresAtUtc <= @AsOfUtc;
        SET @HashesCleared = @@ROWCOUNT;

        DECLARE @ExpiredLeads table (LeadId uniqueidentifier PRIMARY KEY);
        INSERT @ExpiredLeads(LeadId)
        SELECT TOP (@BatchSize) LeadId
        FROM web.Leads
        WHERE ModifiedAtUtc < DATEADD(day, -@LeadDays, @AsOfUtc)
        ORDER BY ModifiedAtUtc;

        DELETE lead
        FROM web.Leads AS lead
        JOIN @ExpiredLeads AS expired ON expired.LeadId = lead.LeadId;
        SET @LeadsDeleted = @@ROWCOUNT;

        DELETE TOP (@BatchSize) contact
        FROM web.Contacts AS contact
        WHERE contact.ModifiedAtUtc < DATEADD(day, -@LeadDays, @AsOfUtc)
          AND NOT EXISTS (SELECT 1 FROM web.Leads AS lead WHERE lead.ContactId = contact.ContactId);
        SET @ContactsDeleted = @@ROWCOUNT;

        DECLARE @ExpiredChats table (ChatSessionId uniqueidentifier PRIMARY KEY);
        INSERT @ExpiredChats(ChatSessionId)
        SELECT TOP (@BatchSize) chat.ChatSessionId
        FROM web.ChatSessions AS chat
        WHERE chat.LastMessageAtUtc < DATEADD(day, -@ChatDays, @AsOfUtc)
          AND NOT EXISTS (SELECT 1 FROM web.Leads AS lead WHERE lead.ChatSessionId = chat.ChatSessionId)
        ORDER BY chat.LastMessageAtUtc;

        DELETE message
        FROM web.ChatMessages AS message
        JOIN @ExpiredChats AS expired ON expired.ChatSessionId = message.ChatSessionId;
        SET @ChatMessagesDeleted = @@ROWCOUNT;

        DELETE chat
        FROM web.ChatSessions AS chat
        JOIN @ExpiredChats AS expired ON expired.ChatSessionId = chat.ChatSessionId;
        SET @ChatSessionsDeleted = @@ROWCOUNT;

        DELETE TOP (@BatchSize) FROM web.PageViews
        WHERE ViewedAtUtc < DATEADD(day, -@PageViewDays, @AsOfUtc);
        SET @PageViewsDeleted = @@ROWCOUNT;

        DELETE TOP (@BatchSize) session
        FROM web.VisitorSessions AS session
        WHERE session.LastSeenUtc < DATEADD(day, -@PageViewDays, @AsOfUtc)
          AND NOT EXISTS (SELECT 1 FROM web.PageViews AS viewrow WHERE viewrow.SessionId = session.SessionId)
          AND NOT EXISTS (SELECT 1 FROM web.ChatSessions AS chat WHERE chat.VisitorSessionId = session.SessionId);
        SET @VisitorSessionsDeleted = @@ROWCOUNT;

        DELETE TOP (@BatchSize) visitor
        FROM web.Visitors AS visitor
        WHERE visitor.LastSeenUtc < DATEADD(day, -@PageViewDays, @AsOfUtc)
          AND NOT EXISTS (SELECT 1 FROM web.VisitorSessions AS session WHERE session.VisitorId = visitor.VisitorId);
        SET @VisitorsDeleted = @@ROWCOUNT;

        DELETE TOP (@BatchSize) FROM web.AuditLog
        WHERE CreatedAtUtc < DATEADD(day, -@AuditDays, @AsOfUtc);
        SET @AuditEventsDeleted = @@ROWCOUNT;

        COMMIT TRANSACTION;

        SELECT
            @HashesCleared AS HashesCleared,
            @LeadsDeleted AS LeadsDeleted,
            @ContactsDeleted AS ContactsDeleted,
            @ChatMessagesDeleted AS ChatMessagesDeleted,
            @ChatSessionsDeleted AS ChatSessionsDeleted,
            @PageViewsDeleted AS PageViewsDeleted,
            @VisitorSessionsDeleted AS VisitorSessionsDeleted,
            @VisitorsDeleted AS VisitorsDeleted,
            @AuditEventsDeleted AS AuditEventsDeleted;
    END;');

    GRANT EXECUTE ON web.PurgeExpiredData TO web_maintenance;

    INSERT web.SchemaMigrations(MigrationId)
    VALUES ('002_retention_maintenance');

    COMMIT TRANSACTION;
END;
GO
