:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

CREATE TABLE #AdminArticle
(
    ArticleId uniqueidentifier,
    Title nvarchar(300),
    Slug nvarchar(200),
    Summary nvarchar(1000),
    HtmlContent nvarchar(max),
    PlainText nvarchar(max),
    Category nvarchar(100),
    TagsJson nvarchar(2000),
    Author nvarchar(200),
    Status varchar(20),
    FeaturedImage nvarchar(2048),
    SeoTitle nvarchar(300),
    SeoDescription nvarchar(500),
    IsFeatured bit,
    PublishedDate datetime2(3),
    CreatedDate datetime2(3),
    ModifiedDate datetime2(3),
    HasUnpublishedChanges bit
);

CREATE TABLE #PublicArticle
(
    ArticleId uniqueidentifier,
    Title nvarchar(300),
    Slug nvarchar(200),
    Summary nvarchar(1000),
    HtmlContent nvarchar(max),
    PlainText nvarchar(max),
    Category nvarchar(100),
    TagsJson nvarchar(2000),
    Author nvarchar(200),
    Status varchar(20),
    FeaturedImage nvarchar(2048),
    SeoTitle nvarchar(300),
    SeoDescription nvarchar(500),
    IsFeatured bit,
    PublishedDate datetime2(3),
    CreatedDate datetime2(3),
    ModifiedDate datetime2(3)
);

CREATE TABLE #DeletedArticle
(
    ArticleId uniqueidentifier,
    Deleted bit
);

DECLARE @Now datetime2(3) = SYSUTCDATETIME();
DECLARE @FuturePublishedAt datetime2(3) = DATEADD(day, 1, @Now);
DECLARE @VisibleId uniqueidentifier = NEWID();
DECLARE @FutureId uniqueidentifier = NEWID();
DECLARE @VisibleSlug nvarchar(200) = N'integration-visible-' + REPLACE(CONVERT(nvarchar(36), @VisibleId), N'-', N'');
DECLARE @FutureSlug nvarchar(200) = N'integration-future-' + REPLACE(CONVERT(nvarchar(36), @FutureId), N'-', N'');

BEGIN TRANSACTION;

INSERT #AdminArticle
EXEC web.SaveArticleDraft
    @ArticleId = @VisibleId,
    @Title = N'Integration test: SQL injection '' OR 1=1 -- remains text',
    @Slug = @VisibleSlug,
    @Summary = N'An integration-only draft that is rolled back.',
    @HtmlContent = N'<h2>Safe test</h2><p>Parameterized values remain data.</p>',
    @PlainText = N'Safe test Parameterized values remain data.',
    @Category = N'Integration Test',
    @TagsJson = N'["database","test"]',
    @Author = N'Netherwood automated test',
    @SeoTitle = N'Integration article metadata',
    @SeoDescription = N'Rollback-only integration verification.',
    @IsFeatured = 0,
    @PublishedAtUtc = '2026-08-01T12:30:00.000',
    @Now = @Now;

IF NOT EXISTS (SELECT 1 FROM #AdminArticle WHERE ArticleId = @VisibleId AND Status = 'draft')
    THROW 51000, 'Create-draft integration check failed.', 1;

TRUNCATE TABLE #PublicArticle;
INSERT #PublicArticle EXEC web.GetPublishedArticle @Slug = @VisibleSlug;
IF EXISTS (SELECT 1 FROM #PublicArticle)
    THROW 51000, 'Draft was returned by the public detail procedure.', 1;

TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle EXEC web.PublishArticle @ArticleId = @VisibleId, @Now = @Now;
IF NOT EXISTS
(
    SELECT 1 FROM #AdminArticle
    WHERE ArticleId = @VisibleId
      AND Status = 'published'
      AND SeoTitle = N'Integration article metadata'
      AND PublishedDate = CONVERT(datetime2(3), '2026-08-01T12:30:00.000', 126)
)
    THROW 51000, 'Publish or article metadata integration check failed.', 1;

TRUNCATE TABLE #PublicArticle;
INSERT #PublicArticle EXEC web.GetPublishedArticle @Slug = @VisibleSlug;
IF NOT EXISTS (SELECT 1 FROM #PublicArticle WHERE ArticleId = @VisibleId)
    THROW 51000, 'Published article was not returned publicly.', 1;

TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle
EXEC web.SaveArticleDraft
    @ArticleId = @FutureId,
    @Title = N'Future-dated integration article',
    @Slug = @FutureSlug,
    @Summary = N'An integration-only future article that is rolled back.',
    @HtmlContent = N'<p>This record must remain private until due.</p>',
    @PlainText = N'This record must remain private until due.',
    @Category = N'Integration Test',
    @TagsJson = N'[]',
    @Author = N'Netherwood automated test',
    @IsFeatured = 0,
    @PublishedAtUtc = @FuturePublishedAt,
    @Now = @Now;

TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle EXEC web.PublishArticle @ArticleId = @FutureId, @Now = @Now;
TRUNCATE TABLE #PublicArticle;
INSERT #PublicArticle EXEC web.GetPublishedArticle @Slug = @FutureSlug;
IF EXISTS (SELECT 1 FROM #PublicArticle)
    THROW 51000, 'Future-dated article was returned before its publication time.', 1;

TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle EXEC web.UnpublishArticle @ArticleId = @VisibleId, @Now = @Now;
TRUNCATE TABLE #PublicArticle;
INSERT #PublicArticle EXEC web.GetPublishedArticle @Slug = @VisibleSlug;
IF EXISTS (SELECT 1 FROM #PublicArticle)
    THROW 51000, 'Unpublished article remained publicly accessible.', 1;

TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle EXEC web.ArchiveArticle @ArticleId = @VisibleId, @Now = @Now;
IF NOT EXISTS (SELECT 1 FROM #AdminArticle WHERE ArticleId = @VisibleId AND Status = 'archived')
    THROW 51000, 'Archive integration check failed.', 1;

TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle EXEC web.UnpublishArticle @ArticleId = @FutureId, @Now = @Now;
INSERT #DeletedArticle EXEC web.DeleteArticle @ArticleId = @FutureId;
IF NOT EXISTS (SELECT 1 FROM #DeletedArticle WHERE ArticleId = @FutureId AND Deleted = 1)
    THROW 51000, 'Delete integration check failed.', 1;

ROLLBACK TRANSACTION;

DECLARE @DuplicateError int = 0;
DECLARE @FirstDuplicateId uniqueidentifier = NEWID();
DECLARE @SecondDuplicateId uniqueidentifier = NEWID();
DECLARE @DuplicateSlug nvarchar(200) = N'integration-duplicate-' + REPLACE(CONVERT(nvarchar(36), @FirstDuplicateId), N'-', N'');

BEGIN TRANSACTION;
TRUNCATE TABLE #AdminArticle;
INSERT #AdminArticle
EXEC web.SaveArticleDraft
    @ArticleId = @FirstDuplicateId,
    @Title = N'First duplicate check',
    @Slug = @DuplicateSlug,
    @Summary = N'First rollback-only duplicate check.',
    @HtmlContent = N'<p>First article.</p>',
    @PlainText = N'First article.',
    @Category = N'Integration Test',
    @TagsJson = N'[]',
    @Author = N'Netherwood automated test',
    @IsFeatured = 0,
    @Now = @Now;

BEGIN TRY
    TRUNCATE TABLE #AdminArticle;
    INSERT #AdminArticle
    EXEC web.SaveArticleDraft
        @ArticleId = @SecondDuplicateId,
        @Title = N'Second duplicate check',
        @Slug = @DuplicateSlug,
        @Summary = N'Second rollback-only duplicate check.',
        @HtmlContent = N'<p>Second article.</p>',
        @PlainText = N'Second article.',
        @Category = N'Integration Test',
        @TagsJson = N'[]',
        @Author = N'Netherwood automated test',
        @IsFeatured = 0,
        @Now = @Now;
END TRY
BEGIN CATCH
    SET @DuplicateError = ERROR_NUMBER();
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
END CATCH;

IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
IF @DuplicateError <> 51010
    THROW 51000, 'Duplicate-slug integration check did not return error 51010.', 1;

IF EXISTS
(
    SELECT 1 FROM web.BlogPosts
    WHERE BlogPostId IN (@VisibleId, @FutureId, @FirstDuplicateId, @SecondDuplicateId)
)
    THROW 51000, 'Article integration test failed to roll back its records.', 1;

SELECT N'articles_platform_integration_tests_passed' AS TestStatus;
GO
