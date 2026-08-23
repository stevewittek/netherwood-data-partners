:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '004_knowledge_location_index')
    THROW 51000, 'Migration 004_knowledge_location_index must be applied first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '005_articles_cms')
BEGIN
    BEGIN TRANSACTION;

    ALTER TABLE web.BlogPosts ADD
        Category nvarchar(100) NOT NULL
            CONSTRAINT DF_BlogPosts_Category DEFAULT N'General' WITH VALUES,
        TagsJson nvarchar(2000) NOT NULL
            CONSTRAINT DF_BlogPosts_TagsJson DEFAULT N'[]' WITH VALUES,
        Author nvarchar(200) NOT NULL
            CONSTRAINT DF_BlogPosts_Author DEFAULT N'Steven Wittek' WITH VALUES,
        FeaturedImage nvarchar(2048) NULL,
        PlainText nvarchar(max) NULL,
        ContentType varchar(30) NOT NULL
            CONSTRAINT DF_BlogPosts_ContentType DEFAULT 'article' WITH VALUES;

    ALTER TABLE web.BlogPosts ADD
        CONSTRAINT CK_BlogPosts_Category CHECK (LEN(Category) > 0),
        CONSTRAINT CK_BlogPosts_Author CHECK (LEN(Author) > 0),
        CONSTRAINT CK_BlogPosts_TagsJson CHECK (ISJSON(TagsJson) = 1),
        CONSTRAINT CK_BlogPosts_ContentType CHECK
            (ContentType IN ('article', 'case-study', 'technical-guide', 'company-news', 'toolkit', 'service-announcement', 'knowledge-base'));

    CREATE TABLE web.ArticleDrafts
    (
        ArticleId uniqueidentifier NOT NULL
            CONSTRAINT PK_ArticleDrafts PRIMARY KEY,
        Slug nvarchar(200) NOT NULL,
        Title nvarchar(300) NOT NULL,
        Summary nvarchar(1000) NOT NULL,
        SanitizedHtml nvarchar(max) NOT NULL,
        PlainText nvarchar(max) NOT NULL,
        Category nvarchar(100) NOT NULL,
        TagsJson nvarchar(2000) NOT NULL,
        Author nvarchar(200) NOT NULL,
        FeaturedImage nvarchar(2048) NULL,
        CreatedAtUtc datetime2(3) NOT NULL,
        ModifiedAtUtc datetime2(3) NOT NULL,
        CONSTRAINT FK_ArticleDrafts_BlogPosts
            FOREIGN KEY (ArticleId) REFERENCES web.BlogPosts(BlogPostId),
        CONSTRAINT CK_ArticleDrafts_Slug
            CHECK (LEN(Slug) > 0 AND Slug NOT LIKE N'%[^a-z0-9-]%'),
        CONSTRAINT CK_ArticleDrafts_Title CHECK (LEN(Title) > 0),
        CONSTRAINT CK_ArticleDrafts_Summary CHECK (LEN(Summary) > 0),
        CONSTRAINT CK_ArticleDrafts_Html CHECK (LEN(SanitizedHtml) > 0),
        CONSTRAINT CK_ArticleDrafts_PlainText CHECK (LEN(PlainText) > 0),
        CONSTRAINT CK_ArticleDrafts_Category CHECK (LEN(Category) > 0),
        CONSTRAINT CK_ArticleDrafts_Author CHECK (LEN(Author) > 0),
        CONSTRAINT CK_ArticleDrafts_TagsJson CHECK (ISJSON(TagsJson) = 1),
        CONSTRAINT CK_ArticleDrafts_ModifiedRange CHECK (ModifiedAtUtc >= CreatedAtUtc)
    );

    CREATE UNIQUE INDEX UX_ArticleDrafts_Slug ON web.ArticleDrafts(Slug);

    DROP INDEX IX_BlogPosts_Status_PublishedAtUtc ON web.BlogPosts;
    CREATE INDEX IX_BlogPosts_Status_PublishedAtUtc
        ON web.BlogPosts(Status, PublishedAtUtc DESC)
        INCLUDE (BlogPostId, Title, Slug, Summary, Category, Author, FeaturedImage, ModifiedAtUtc)
        WHERE Status = 'published';

    INSERT web.SchemaMigrations(MigrationId) VALUES ('005_articles_cms');
    COMMIT TRANSACTION;
END;
GO

CREATE OR ALTER PROCEDURE web.ListPublishedArticles
    @Category nvarchar(100) = NULL,
    @Tag nvarchar(50) = NULL,
    @Page int = 1,
    @PageSize int = 10
AS
BEGIN
    SET NOCOUNT ON;
    IF @Page < 1 OR @PageSize < 1 OR @PageSize > 50
        THROW 51011, 'Invalid article page.', 1;

    SELECT
        post.BlogPostId AS ArticleId,
        post.Title,
        post.Slug,
        post.Summary,
        post.Category,
        post.TagsJson,
        post.Author,
        post.Status,
        post.FeaturedImage,
        post.PublishedAtUtc AS PublishedDate,
        post.CreatedAtUtc AS CreatedDate,
        post.ModifiedAtUtc AS ModifiedDate,
        COUNT_BIG(*) OVER() AS TotalCount
    FROM web.BlogPosts AS post
    WHERE post.Status = 'published'
      AND post.ContentType = 'article'
      AND (@Category IS NULL OR post.Category = @Category)
      AND
      (
          @Tag IS NULL
          OR EXISTS
          (
              SELECT 1 FROM OPENJSON(post.TagsJson)
              WHERE CONVERT(nvarchar(50), [value]) = @Tag
          )
      )
    ORDER BY post.PublishedAtUtc DESC, post.BlogPostId
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO

CREATE OR ALTER PROCEDURE web.GetPublishedArticle
    @Slug nvarchar(200)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (1)
        BlogPostId AS ArticleId,
        Title,
        Slug,
        Summary,
        SanitizedHtml AS HtmlContent,
        PlainText,
        Category,
        TagsJson,
        Author,
        Status,
        FeaturedImage,
        PublishedAtUtc AS PublishedDate,
        CreatedAtUtc AS CreatedDate,
        ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts
    WHERE Slug = @Slug AND Status = 'published' AND ContentType = 'article';
END;
GO

CREATE OR ALTER PROCEDURE web.ListAdminArticles
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        post.BlogPostId AS ArticleId,
        COALESCE(draft.Title, post.Title) AS Title,
        COALESCE(draft.Slug, post.Slug) AS Slug,
        COALESCE(draft.Summary, post.Summary, N'') AS Summary,
        COALESCE(draft.Category, post.Category) AS Category,
        COALESCE(draft.TagsJson, post.TagsJson) AS TagsJson,
        COALESCE(draft.Author, post.Author) AS Author,
        post.Status,
        COALESCE(draft.FeaturedImage, post.FeaturedImage) AS FeaturedImage,
        post.PublishedAtUtc AS PublishedDate,
        post.CreatedAtUtc AS CreatedDate,
        COALESCE(draft.ModifiedAtUtc, post.ModifiedAtUtc) AS ModifiedDate,
        CONVERT(bit, CASE WHEN draft.ArticleId IS NULL THEN 0 ELSE 1 END) AS HasUnpublishedChanges
    FROM web.BlogPosts AS post
    LEFT JOIN web.ArticleDrafts AS draft ON draft.ArticleId = post.BlogPostId
    WHERE post.ContentType = 'article'
    ORDER BY COALESCE(draft.ModifiedAtUtc, post.ModifiedAtUtc) DESC;
END;
GO

CREATE OR ALTER PROCEDURE web.GetAdminArticle
    @ArticleId uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (1)
        post.BlogPostId AS ArticleId,
        COALESCE(draft.Title, post.Title) AS Title,
        COALESCE(draft.Slug, post.Slug) AS Slug,
        COALESCE(draft.Summary, post.Summary, N'') AS Summary,
        COALESCE(draft.SanitizedHtml, post.SanitizedHtml, N'') AS HtmlContent,
        COALESCE(draft.PlainText, post.PlainText, N'') AS PlainText,
        COALESCE(draft.Category, post.Category) AS Category,
        COALESCE(draft.TagsJson, post.TagsJson) AS TagsJson,
        COALESCE(draft.Author, post.Author) AS Author,
        post.Status,
        COALESCE(draft.FeaturedImage, post.FeaturedImage) AS FeaturedImage,
        post.PublishedAtUtc AS PublishedDate,
        post.CreatedAtUtc AS CreatedDate,
        COALESCE(draft.ModifiedAtUtc, post.ModifiedAtUtc) AS ModifiedDate,
        CONVERT(bit, CASE WHEN draft.ArticleId IS NULL THEN 0 ELSE 1 END) AS HasUnpublishedChanges
    FROM web.BlogPosts AS post
    LEFT JOIN web.ArticleDrafts AS draft ON draft.ArticleId = post.BlogPostId
    WHERE post.BlogPostId = @ArticleId AND post.ContentType = 'article';
END;
GO

CREATE OR ALTER PROCEDURE web.SaveArticleDraft
    @ArticleId uniqueidentifier,
    @Title nvarchar(300),
    @Slug nvarchar(200),
    @Summary nvarchar(1000),
    @HtmlContent nvarchar(max),
    @PlainText nvarchar(max),
    @Category nvarchar(100),
    @TagsJson nvarchar(2000),
    @Author nvarchar(200),
    @FeaturedImage nvarchar(2048) = NULL,
    @Now datetime2(3)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId <> @ArticleId AND Slug = @Slug)
       OR EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId <> @ArticleId AND Slug = @Slug)
        THROW 51010, 'Article slug is already in use.', 1;

    IF NOT EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId = @ArticleId)
    BEGIN
        INSERT web.BlogPosts
        (
            BlogPostId, Slug, Title, Summary, SanitizedHtml, Status,
            CreatedAtUtc, ModifiedAtUtc, PublishedAtUtc, Category, TagsJson,
            Author, FeaturedImage, PlainText, ContentType
        )
        VALUES
        (
            @ArticleId, @Slug, @Title, @Summary, @HtmlContent, 'draft',
            @Now, @Now, NULL, @Category, @TagsJson,
            @Author, @FeaturedImage, @PlainText, 'article'
        );
    END
    ELSE IF EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId = @ArticleId AND Status = 'published')
    BEGIN
        IF EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId = @ArticleId)
            UPDATE web.ArticleDrafts
            SET Slug = @Slug, Title = @Title, Summary = @Summary,
                SanitizedHtml = @HtmlContent, PlainText = @PlainText,
                Category = @Category, TagsJson = @TagsJson, Author = @Author,
                FeaturedImage = @FeaturedImage, ModifiedAtUtc = @Now
            WHERE ArticleId = @ArticleId;
        ELSE
            INSERT web.ArticleDrafts
            (
                ArticleId, Slug, Title, Summary, SanitizedHtml, PlainText,
                Category, TagsJson, Author, FeaturedImage, CreatedAtUtc, ModifiedAtUtc
            )
            VALUES
            (
                @ArticleId, @Slug, @Title, @Summary, @HtmlContent, @PlainText,
                @Category, @TagsJson, @Author, @FeaturedImage, @Now, @Now
            );
    END
    ELSE
    BEGIN
        UPDATE web.BlogPosts
        SET Slug = @Slug, Title = @Title, Summary = @Summary,
            SanitizedHtml = @HtmlContent, PlainText = @PlainText,
            Category = @Category, TagsJson = @TagsJson, Author = @Author,
            FeaturedImage = @FeaturedImage, Status = 'draft', ModifiedAtUtc = @Now
        WHERE BlogPostId = @ArticleId;
    END;

    COMMIT TRANSACTION;
    EXEC web.GetAdminArticle @ArticleId = @ArticleId;
END;
GO

CREATE OR ALTER PROCEDURE web.PublishArticle
    @ArticleId uniqueidentifier,
    @Now datetime2(3)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId = @ArticleId)
    BEGIN
        DECLARE @DraftSlug nvarchar(200) = (SELECT Slug FROM web.ArticleDrafts WHERE ArticleId = @ArticleId);
        IF EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId <> @ArticleId AND Slug = @DraftSlug)
            THROW 51010, 'Article slug is already in use.', 1;

        UPDATE post
        SET Slug = draft.Slug, Title = draft.Title, Summary = draft.Summary,
            SanitizedHtml = draft.SanitizedHtml, PlainText = draft.PlainText,
            Category = draft.Category, TagsJson = draft.TagsJson,
            Author = draft.Author, FeaturedImage = draft.FeaturedImage,
            Status = 'published', PublishedAtUtc = COALESCE(post.PublishedAtUtc, @Now),
            ModifiedAtUtc = @Now
        FROM web.BlogPosts AS post
        JOIN web.ArticleDrafts AS draft ON draft.ArticleId = post.BlogPostId
        WHERE post.BlogPostId = @ArticleId;
        DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
    END
    ELSE
    BEGIN
        UPDATE web.BlogPosts
        SET Status = 'published', PublishedAtUtc = COALESCE(PublishedAtUtc, @Now), ModifiedAtUtc = @Now
        WHERE BlogPostId = @ArticleId
          AND LEN(COALESCE(Summary, N'')) > 0
          AND LEN(COALESCE(SanitizedHtml, N'')) > 0
          AND LEN(COALESCE(PlainText, N'')) > 0;
    END;

    COMMIT TRANSACTION;
    EXEC web.GetAdminArticle @ArticleId = @ArticleId;
END;
GO

CREATE OR ALTER PROCEDURE web.ArchiveArticle
    @ArticleId uniqueidentifier,
    @Now datetime2(3)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;
    DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
    UPDATE web.BlogPosts SET Status = 'archived', ModifiedAtUtc = @Now WHERE BlogPostId = @ArticleId;
    COMMIT TRANSACTION;
    EXEC web.GetAdminArticle @ArticleId = @ArticleId;
END;
GO

CREATE OR ALTER PROCEDURE web.ListPublishedArticleKnowledge
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        BlogPostId AS ArticleId,
        Title,
        CONCAT(N'/articles/', Slug) AS Url,
        PlainText,
        Category,
        TagsJson,
        PublishedAtUtc AS PublishedDate,
        ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts
    WHERE Status = 'published' AND ContentType = 'article'
    ORDER BY PublishedAtUtc DESC;
END;
GO

IF DATABASE_PRINCIPAL_ID(N'web_article_author') IS NULL
    CREATE ROLE web_article_author AUTHORIZATION dbo;
GO

GRANT EXECUTE ON web.ListPublishedArticles TO web_runtime;
GRANT EXECUTE ON web.GetPublishedArticle TO web_runtime;
GRANT EXECUTE ON web.ListPublishedArticleKnowledge TO web_runtime;

GRANT EXECUTE ON web.ListAdminArticles TO web_article_author;
GRANT EXECUTE ON web.GetAdminArticle TO web_article_author;
GRANT EXECUTE ON web.SaveArticleDraft TO web_article_author;
GRANT EXECUTE ON web.PublishArticle TO web_article_author;
GRANT EXECUTE ON web.ArchiveArticle TO web_article_author;
GRANT EXECUTE ON web.ListPublishedArticles TO web_article_author;
GRANT EXECUTE ON web.GetPublishedArticle TO web_article_author;
DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogPosts TO web_article_author;
DENY SELECT, INSERT, UPDATE, DELETE ON web.ArticleDrafts TO web_article_author;
DENY DELETE ON SCHEMA::web TO web_article_author;
GO
