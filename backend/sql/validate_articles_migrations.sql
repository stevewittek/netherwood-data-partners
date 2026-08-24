:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
GO

:r migrations/006_articles_content_workflow.sql
:r migrations/007_starter_articles.sql

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '006_articles_content_workflow')
    THROW 51000, 'Migration 006 was not recorded during validation.', 1;
IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '007_starter_articles')
    THROW 51000, 'Migration 007 was not recorded during validation.', 1;

DECLARE @ExpectedStarterIds table (ArticleId uniqueidentifier PRIMARY KEY);
INSERT @ExpectedStarterIds(ArticleId)
VALUES
    ('5c914054-7d6a-5bb4-89e9-7fa3093cae76'),
    ('f818df3d-9435-5d62-b629-0dd5485ef3bf'),
    ('daac638e-a853-5827-bc1d-4696a5b6fb54'),
    ('73b4a094-1235-5e5a-9658-8c36059b7cc4'),
    ('a838f245-99b9-5e29-b2e6-03ca364c98af'),
    ('776c5f54-dfed-52fe-8e5f-255f789403f9'),
    ('24ab5744-8afe-5b54-ac6b-c19cd4d46306'),
    ('ac33f77f-3520-57a6-8456-9e1b4cbe7b7e'),
    ('121fdae9-e7e9-52f2-9574-94dbbf680d6e'),
    ('a43d9fba-4c7e-5804-9459-93f324f7c3d5');

IF (SELECT COUNT(*) FROM web.BlogPosts AS post JOIN @ExpectedStarterIds AS expected ON expected.ArticleId = post.BlogPostId) <> 10
    THROW 51000, 'Starter article validation did not find all ten records.', 1;
IF EXISTS
(
    SELECT Slug FROM web.BlogPosts
    WHERE BlogPostId IN (SELECT ArticleId FROM @ExpectedStarterIds)
    GROUP BY Slug HAVING COUNT(*) > 1
)
    THROW 51000, 'Starter article slugs are not unique.', 1;
IF (SELECT COUNT(*) FROM web.BlogPosts WHERE Status = 'published' AND ContentType = 'article' AND IsFeatured = 1) > 1
    THROW 51000, 'More than one published article is featured.', 1;
IF NOT EXISTS
(
    SELECT 1 FROM web.BlogPosts
    WHERE BlogPostId IN (SELECT ArticleId FROM @ExpectedStarterIds)
      AND Title LIKE N'%Query Store%'
      AND LEN(COALESCE(PlainText, N'')) > 500
      AND LEN(COALESCE(SeoDescription, N'')) > 0
)
    THROW 51000, 'Starter searchable content or SEO metadata is missing.', 1;

IF @@TRANCOUNT <> 1
    THROW 51000, 'Article migration validation changed the outer transaction boundary.', 1;
ROLLBACK TRANSACTION;

SELECT N'articles_migrations_validated_with_rollback' AS ValidationStatus;
GO
