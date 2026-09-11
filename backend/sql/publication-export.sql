:on error exit
-- Prepared for Voyager 2 review. Do not apply without approval.
-- Prerequisite: migration 008. No table/data changes; no login creation.
USE NDP_Web;
GO
IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '008_article_metadata_and_scheduling')
    THROW 51000, 'Migration 008 is required.', 1;
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE web.ExportPublishedArticles
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET LOCK_TIMEOUT 5000;
    BEGIN TRANSACTION;
    DECLARE @Cutoff datetime2(3) = SYSUTCDATETIME();
    -- Reject an unexpectedly large corpus before materializing it in the exporter.
    -- The held range locks also keep this check and the following read coherent.
    IF (SELECT COALESCE(SUM(CONVERT(bigint, DATALENGTH(SanitizedHtml))
                   + COALESCE(DATALENGTH(PlainText), 0)
                   + COALESCE(DATALENGTH(Summary), 0) + 16000), 0)
        FROM web.BlogPosts WITH (HOLDLOCK)
        WHERE Status = 'published' AND ContentType = 'article'
          AND PublishedAtUtc <= @Cutoff) > 12000000
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51011, 'Public article corpus exceeds the bounded export size.', 1;
    END;
    -- One serializable read and one visibility cutoff avoid page/detail races.
    SELECT BlogPostId AS ArticleId, Title, Slug, Summary,
           SanitizedHtml AS HtmlContent, PlainText, Category, TagsJson, Author,
           Status, FeaturedImage, SeoTitle, SeoDescription, IsFeatured,
           PublishedAtUtc AS PublishedDate, CreatedAtUtc AS CreatedDate,
           ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts WITH (HOLDLOCK)
    WHERE Status = 'published' AND ContentType = 'article'
      AND PublishedAtUtc <= @Cutoff
    ORDER BY PublishedAtUtc DESC, ModifiedAtUtc DESC, Slug;
    SELECT @Cutoff AS GeneratedAtUtc, @@ROWCOUNT AS ArticleCount;
    COMMIT TRANSACTION;
END;
GO
-- Review this exact narrow grant with the backend owner before application.
GRANT EXECUTE ON OBJECT::web.ExportPublishedArticles TO ndp_web_app;
GO
