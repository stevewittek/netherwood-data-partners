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
SET NUMERIC_ROUNDABORT OFF;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '005_articles_cms')
    THROW 51000, 'Migration 005_articles_cms must be applied first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '006_articles_content_workflow')
BEGIN
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'web.BlogPosts', N'IsFeatured') IS NULL
        EXEC(N'ALTER TABLE web.BlogPosts ADD
            IsFeatured bit NOT NULL
                CONSTRAINT DF_BlogPosts_IsFeatured DEFAULT (0) WITH VALUES;');

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.default_constraints AS defaultrow
        JOIN sys.columns AS columnrow
          ON columnrow.object_id = defaultrow.parent_object_id
         AND columnrow.column_id = defaultrow.parent_column_id
        WHERE defaultrow.parent_object_id = OBJECT_ID(N'web.BlogPosts')
          AND columnrow.name = N'IsFeatured'
    )
        EXEC(N'ALTER TABLE web.BlogPosts ADD
            CONSTRAINT DF_BlogPosts_IsFeatured DEFAULT (0) FOR IsFeatured;');

    IF COL_LENGTH(N'web.ArticleDrafts', N'SeoDescription') IS NULL
    BEGIN
        EXEC(N'ALTER TABLE web.ArticleDrafts ADD SeoDescription nvarchar(500) NULL;');
        EXEC(N'UPDATE draft
            SET SeoDescription = post.SeoDescription
            FROM web.ArticleDrafts AS draft
            JOIN web.BlogPosts AS post ON post.BlogPostId = draft.ArticleId;');
    END;

    IF COL_LENGTH(N'web.ArticleDrafts', N'IsFeatured') IS NULL
    BEGIN
        EXEC(N'ALTER TABLE web.ArticleDrafts ADD
            IsFeatured bit NOT NULL
                CONSTRAINT DF_ArticleDrafts_IsFeatured DEFAULT (0) WITH VALUES;');
        EXEC(N'UPDATE draft
            SET IsFeatured = post.IsFeatured
            FROM web.ArticleDrafts AS draft
            JOIN web.BlogPosts AS post ON post.BlogPostId = draft.ArticleId;');
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.default_constraints AS defaultrow
        JOIN sys.columns AS columnrow
          ON columnrow.object_id = defaultrow.parent_object_id
         AND columnrow.column_id = defaultrow.parent_column_id
        WHERE defaultrow.parent_object_id = OBJECT_ID(N'web.ArticleDrafts')
          AND columnrow.name = N'IsFeatured'
    )
        EXEC(N'ALTER TABLE web.ArticleDrafts ADD
            CONSTRAINT DF_ArticleDrafts_IsFeatured DEFAULT (0) FOR IsFeatured;');

    IF NOT EXISTS
    (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'web.BlogPosts')
          AND name = N'IX_BlogPosts_Articles_Category_PublishedAtUtc'
    )
        EXEC(N'CREATE INDEX IX_BlogPosts_Articles_Category_PublishedAtUtc
            ON web.BlogPosts(Category, PublishedAtUtc DESC)
            INCLUDE
            (
                BlogPostId, Title, Slug, Summary, TagsJson, Author,
                FeaturedImage, SeoDescription, IsFeatured, CreatedAtUtc, ModifiedAtUtc
            )
            WHERE Status = ''published'' AND ContentType = ''article'';');

    IF NOT EXISTS
    (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'web.BlogPosts')
          AND name = N'UX_BlogPosts_SinglePublishedFeaturedArticle'
    )
        EXEC(N'CREATE UNIQUE INDEX UX_BlogPosts_SinglePublishedFeaturedArticle
            ON web.BlogPosts(IsFeatured)
            WHERE Status = ''published'' AND ContentType = ''article'' AND IsFeatured = 1;');

    INSERT web.SchemaMigrations(MigrationId) VALUES ('006_articles_content_workflow');
    COMMIT TRANSACTION;
END;
GO

CREATE OR ALTER PROCEDURE web.ListPublishedArticles
    @Category nvarchar(100) = NULL,
    @Tag nvarchar(50) = NULL,
    @Search nvarchar(200) = NULL,
    @Page int = 1,
    @PageSize int = 10
AS
BEGIN
    SET NOCOUNT ON;
    IF @Page < 1 OR @PageSize < 1 OR @PageSize > 50
        THROW 51011, 'Invalid article page.', 1;

    DECLARE @SearchPattern nvarchar(410) = NULL;
    IF @Search IS NOT NULL
    BEGIN
        SET @Search = LTRIM(RTRIM(@Search));
        IF LEN(@Search) = 0
            THROW 51011, 'Invalid article search.', 1;
        SET @SearchPattern = N'%'
            + REPLACE
              (
                  REPLACE
                  (
                      REPLACE
                      (
                          REPLACE(REPLACE(@Search, N'~', N'~~'), N'%', N'~%'),
                          N'_', N'~_'
                      ),
                      N'[', N'~['
                  ),
                  N']', N'~]'
              )
            + N'%';
    END;

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
        post.SeoDescription,
        post.IsFeatured,
        post.PublishedAtUtc AS PublishedDate,
        post.CreatedAtUtc AS CreatedDate,
        post.ModifiedAtUtc AS ModifiedDate
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
      AND
      (
          @SearchPattern IS NULL
          OR post.Title LIKE @SearchPattern ESCAPE N'~'
          OR post.Summary LIKE @SearchPattern ESCAPE N'~'
          OR post.PlainText LIKE @SearchPattern ESCAPE N'~'
          OR post.Category LIKE @SearchPattern ESCAPE N'~'
          OR post.Author LIKE @SearchPattern ESCAPE N'~'
          OR post.SeoDescription LIKE @SearchPattern ESCAPE N'~'
          OR EXISTS
          (
              SELECT 1 FROM OPENJSON(post.TagsJson)
              WHERE CONVERT(nvarchar(4000), [value]) LIKE @SearchPattern ESCAPE N'~'
          )
      )
    ORDER BY post.PublishedAtUtc DESC, post.BlogPostId
    OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT_BIG(*) AS TotalCount
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
      AND
      (
          @SearchPattern IS NULL
          OR post.Title LIKE @SearchPattern ESCAPE N'~'
          OR post.Summary LIKE @SearchPattern ESCAPE N'~'
          OR post.PlainText LIKE @SearchPattern ESCAPE N'~'
          OR post.Category LIKE @SearchPattern ESCAPE N'~'
          OR post.Author LIKE @SearchPattern ESCAPE N'~'
          OR post.SeoDescription LIKE @SearchPattern ESCAPE N'~'
          OR EXISTS
          (
              SELECT 1 FROM OPENJSON(post.TagsJson)
              WHERE CONVERT(nvarchar(4000), [value]) LIKE @SearchPattern ESCAPE N'~'
          )
      );
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
        SeoDescription,
        IsFeatured,
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
        CASE WHEN draft.ArticleId IS NULL THEN post.FeaturedImage ELSE draft.FeaturedImage END AS FeaturedImage,
        CASE WHEN draft.ArticleId IS NULL THEN post.SeoDescription ELSE draft.SeoDescription END AS SeoDescription,
        COALESCE(draft.IsFeatured, post.IsFeatured) AS IsFeatured,
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
        CASE WHEN draft.ArticleId IS NULL THEN post.FeaturedImage ELSE draft.FeaturedImage END AS FeaturedImage,
        CASE WHEN draft.ArticleId IS NULL THEN post.SeoDescription ELSE draft.SeoDescription END AS SeoDescription,
        COALESCE(draft.IsFeatured, post.IsFeatured) AS IsFeatured,
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
    @SeoDescription nvarchar(500) = NULL,
    @IsFeatured bit = 0,
    @Now datetime2(3)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    IF EXISTS
    (
        SELECT 1 FROM web.BlogPosts
        WHERE BlogPostId = @ArticleId AND ContentType <> 'article'
    )
        THROW 51013, 'The identifier belongs to another content type.', 1;

    IF EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId <> @ArticleId AND Slug = @Slug)
       OR EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId <> @ArticleId AND Slug = @Slug)
        THROW 51010, 'Article slug is already in use.', 1;

    IF NOT EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId = @ArticleId)
    BEGIN
        INSERT web.BlogPosts
        (
            BlogPostId, Slug, Title, Summary, SanitizedHtml, Status,
            CreatedAtUtc, ModifiedAtUtc, PublishedAtUtc, Category, TagsJson,
            Author, FeaturedImage, PlainText, SeoDescription, IsFeatured, ContentType
        )
        VALUES
        (
            @ArticleId, @Slug, @Title, @Summary, @HtmlContent, 'draft',
            @Now, @Now, NULL, @Category, @TagsJson,
            @Author, @FeaturedImage, @PlainText, @SeoDescription, @IsFeatured, 'article'
        );
    END
    ELSE IF EXISTS
    (
        SELECT 1 FROM web.BlogPosts
        WHERE BlogPostId = @ArticleId AND Status = 'published' AND ContentType = 'article'
    )
    BEGIN
        IF EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId = @ArticleId)
            UPDATE web.ArticleDrafts
            SET Slug = @Slug, Title = @Title, Summary = @Summary,
                SanitizedHtml = @HtmlContent, PlainText = @PlainText,
                Category = @Category, TagsJson = @TagsJson, Author = @Author,
                FeaturedImage = @FeaturedImage, SeoDescription = @SeoDescription,
                IsFeatured = @IsFeatured, ModifiedAtUtc = @Now
            WHERE ArticleId = @ArticleId;
        ELSE
            INSERT web.ArticleDrafts
            (
                ArticleId, Slug, Title, Summary, SanitizedHtml, PlainText,
                Category, TagsJson, Author, FeaturedImage, SeoDescription,
                IsFeatured, CreatedAtUtc, ModifiedAtUtc
            )
            VALUES
            (
                @ArticleId, @Slug, @Title, @Summary, @HtmlContent, @PlainText,
                @Category, @TagsJson, @Author, @FeaturedImage, @SeoDescription,
                @IsFeatured, @Now, @Now
            );
    END
    ELSE
    BEGIN
        UPDATE web.BlogPosts
        SET Slug = @Slug, Title = @Title, Summary = @Summary,
            SanitizedHtml = @HtmlContent, PlainText = @PlainText,
            Category = @Category, TagsJson = @TagsJson, Author = @Author,
            FeaturedImage = @FeaturedImage, SeoDescription = @SeoDescription,
            IsFeatured = @IsFeatured, Status = 'draft', ModifiedAtUtc = @Now
        WHERE BlogPostId = @ArticleId AND ContentType = 'article';
        DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
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

    DECLARE @CurrentStatus varchar(20);
    SELECT @CurrentStatus = Status
    FROM web.BlogPosts WITH (UPDLOCK, HOLDLOCK)
    WHERE BlogPostId = @ArticleId AND ContentType = 'article';

    IF @CurrentStatus IS NOT NULL
       AND EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId = @ArticleId)
    BEGIN
        DECLARE @DraftSlug nvarchar(200) = (SELECT Slug FROM web.ArticleDrafts WHERE ArticleId = @ArticleId);
        DECLARE @DraftIsFeatured bit = (SELECT IsFeatured FROM web.ArticleDrafts WHERE ArticleId = @ArticleId);
        IF EXISTS (SELECT 1 FROM web.BlogPosts WHERE BlogPostId <> @ArticleId AND Slug = @DraftSlug)
            THROW 51010, 'Article slug is already in use.', 1;

        IF @DraftIsFeatured = 1
            UPDATE web.BlogPosts
            SET IsFeatured = 0, ModifiedAtUtc = @Now
            WHERE BlogPostId <> @ArticleId
              AND Status = 'published'
              AND ContentType = 'article'
              AND IsFeatured = 1;

        UPDATE post
        SET Slug = draft.Slug, Title = draft.Title, Summary = draft.Summary,
            SanitizedHtml = draft.SanitizedHtml, PlainText = draft.PlainText,
            Category = draft.Category, TagsJson = draft.TagsJson,
            Author = draft.Author, FeaturedImage = draft.FeaturedImage,
            SeoDescription = draft.SeoDescription, IsFeatured = draft.IsFeatured,
            Status = 'published', PublishedAtUtc = COALESCE(post.PublishedAtUtc, @Now),
            ModifiedAtUtc = @Now
        FROM web.BlogPosts AS post
        JOIN web.ArticleDrafts AS draft ON draft.ArticleId = post.BlogPostId
        WHERE post.BlogPostId = @ArticleId AND post.ContentType = 'article';
        DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
    END
    ELSE IF EXISTS
    (
        SELECT 1 FROM web.BlogPosts
        WHERE BlogPostId = @ArticleId
          AND ContentType = 'article'
          AND LEN(COALESCE(Summary, N'')) > 0
          AND LEN(COALESCE(SanitizedHtml, N'')) > 0
          AND LEN(COALESCE(PlainText, N'')) > 0
    )
    BEGIN
        IF EXISTS
        (
            SELECT 1 FROM web.BlogPosts
            WHERE BlogPostId = @ArticleId AND IsFeatured = 1
        )
            UPDATE web.BlogPosts
            SET IsFeatured = 0, ModifiedAtUtc = @Now
            WHERE BlogPostId <> @ArticleId
              AND Status = 'published'
              AND ContentType = 'article'
              AND IsFeatured = 1;

        UPDATE web.BlogPosts
        SET Status = 'published', PublishedAtUtc = COALESCE(PublishedAtUtc, @Now), ModifiedAtUtc = @Now
        WHERE BlogPostId = @ArticleId AND ContentType = 'article';
    END;

    COMMIT TRANSACTION;
    EXEC web.GetAdminArticle @ArticleId = @ArticleId;
END;
GO

CREATE OR ALTER PROCEDURE web.UnpublishArticle
    @ArticleId uniqueidentifier,
    @Now datetime2(3)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    DECLARE @CurrentStatus varchar(20);
    SELECT @CurrentStatus = Status
    FROM web.BlogPosts WITH (UPDLOCK, HOLDLOCK)
    WHERE BlogPostId = @ArticleId AND ContentType = 'article';

    IF @CurrentStatus = 'published'
    BEGIN
        IF EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId = @ArticleId)
        BEGIN
            UPDATE post
            SET Slug = draft.Slug, Title = draft.Title, Summary = draft.Summary,
                SanitizedHtml = draft.SanitizedHtml, PlainText = draft.PlainText,
                Category = draft.Category, TagsJson = draft.TagsJson,
                Author = draft.Author, FeaturedImage = draft.FeaturedImage,
                SeoDescription = draft.SeoDescription, IsFeatured = draft.IsFeatured,
                Status = 'draft', ModifiedAtUtc = @Now
            FROM web.BlogPosts AS post
            JOIN web.ArticleDrafts AS draft ON draft.ArticleId = post.BlogPostId
            WHERE post.BlogPostId = @ArticleId AND post.ContentType = 'article';
            DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
        END
        ELSE
            UPDATE web.BlogPosts
            SET Status = 'draft', ModifiedAtUtc = @Now
            WHERE BlogPostId = @ArticleId AND ContentType = 'article';
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
    IF EXISTS
    (
        SELECT 1 FROM web.BlogPosts WITH (UPDLOCK, HOLDLOCK)
        WHERE BlogPostId = @ArticleId AND ContentType = 'article'
    )
    BEGIN
        DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
        UPDATE web.BlogPosts
        SET Status = 'archived', ModifiedAtUtc = @Now
        WHERE BlogPostId = @ArticleId AND ContentType = 'article';
    END;
    COMMIT TRANSACTION;
    EXEC web.GetAdminArticle @ArticleId = @ArticleId;
END;
GO

CREATE OR ALTER PROCEDURE web.DeleteArticle
    @ArticleId uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    DECLARE @CurrentStatus varchar(20);
    SELECT @CurrentStatus = Status
    FROM web.BlogPosts WITH (UPDLOCK, HOLDLOCK)
    WHERE BlogPostId = @ArticleId AND ContentType = 'article';

    IF @CurrentStatus = 'published'
    BEGIN
        COMMIT TRANSACTION;
        THROW 51012, 'Published articles must be unpublished or archived before deletion.', 1;
    END;

    IF @CurrentStatus IS NULL
    BEGIN
        COMMIT TRANSACTION;
        RETURN;
    END;

    DELETE web.BlogImages WHERE BlogPostId = @ArticleId;
    DELETE web.ArticleDrafts WHERE ArticleId = @ArticleId;
    DELETE web.BlogPosts WHERE BlogPostId = @ArticleId AND ContentType = 'article';

    COMMIT TRANSACTION;
    SELECT @ArticleId AS ArticleId, CONVERT(bit, 1) AS Deleted;
END;
GO

CREATE OR ALTER PROCEDURE web.ListPublishedArticleKnowledge
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        BlogPostId AS ArticleId,
        Title,
        Slug,
        CONCAT(N'/articles/', Slug) AS Url,
        Summary,
        PlainText,
        Category,
        TagsJson,
        Author,
        SeoDescription,
        IsFeatured,
        PublishedAtUtc AS PublishedDate,
        ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts
    WHERE Status = 'published' AND ContentType = 'article'
    ORDER BY PublishedAtUtc DESC;
END;
GO

IF DATABASE_PRINCIPAL_ID(N'web_runtime') IS NULL
    CREATE ROLE web_runtime AUTHORIZATION dbo;
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
GRANT EXECUTE ON web.UnpublishArticle TO web_article_author;
GRANT EXECUTE ON web.ArchiveArticle TO web_article_author;
GRANT EXECUTE ON web.DeleteArticle TO web_article_author;
GRANT EXECUTE ON web.ListPublishedArticles TO web_article_author;
GRANT EXECUTE ON web.GetPublishedArticle TO web_article_author;

DENY EXECUTE ON web.ListAdminArticles TO web_runtime;
DENY EXECUTE ON web.GetAdminArticle TO web_runtime;
DENY EXECUTE ON web.SaveArticleDraft TO web_runtime;
DENY EXECUTE ON web.PublishArticle TO web_runtime;
DENY EXECUTE ON web.UnpublishArticle TO web_runtime;
DENY EXECUTE ON web.ArchiveArticle TO web_runtime;
DENY EXECUTE ON web.DeleteArticle TO web_runtime;

DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogPosts TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.ArticleDrafts TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogImages TO web_runtime;
DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogPosts TO web_article_author;
DENY SELECT, INSERT, UPDATE, DELETE ON web.ArticleDrafts TO web_article_author;
DENY SELECT, INSERT, UPDATE, DELETE ON web.BlogImages TO web_article_author;
DENY DELETE ON SCHEMA::web TO web_article_author;
GO
