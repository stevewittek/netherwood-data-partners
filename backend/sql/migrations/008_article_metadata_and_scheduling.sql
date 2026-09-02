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

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '007_starter_articles')
    THROW 51000, 'Migration 007_starter_articles must be applied first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM web.SchemaMigrations WHERE MigrationId = '008_article_metadata_and_scheduling')
BEGIN
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'web.ArticleDrafts', N'SeoTitle') IS NULL
        ALTER TABLE web.ArticleDrafts ADD SeoTitle nvarchar(300) NULL;

    IF COL_LENGTH(N'web.ArticleDrafts', N'PublishedAtUtc') IS NULL
        ALTER TABLE web.ArticleDrafts ADD PublishedAtUtc datetime2(3) NULL;

    INSERT web.SchemaMigrations(MigrationId)
    VALUES ('008_article_metadata_and_scheduling');

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
        post.SeoTitle,
        post.SeoDescription,
        post.IsFeatured,
        post.PublishedAtUtc AS PublishedDate,
        post.CreatedAtUtc AS CreatedDate,
        post.ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts AS post
    WHERE post.Status = 'published'
      AND post.ContentType = 'article'
      AND post.PublishedAtUtc <= SYSUTCDATETIME()
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
          OR post.SeoTitle LIKE @SearchPattern ESCAPE N'~'
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
      AND post.PublishedAtUtc <= SYSUTCDATETIME()
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
          OR post.SeoTitle LIKE @SearchPattern ESCAPE N'~'
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
        SeoTitle,
        SeoDescription,
        IsFeatured,
        PublishedAtUtc AS PublishedDate,
        CreatedAtUtc AS CreatedDate,
        ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts
    WHERE Slug = @Slug
      AND Status = 'published'
      AND ContentType = 'article'
      AND PublishedAtUtc <= SYSUTCDATETIME();
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
        CASE WHEN draft.ArticleId IS NULL THEN post.SeoTitle ELSE draft.SeoTitle END AS SeoTitle,
        CASE WHEN draft.ArticleId IS NULL THEN post.SeoDescription ELSE draft.SeoDescription END AS SeoDescription,
        COALESCE(draft.IsFeatured, post.IsFeatured) AS IsFeatured,
        COALESCE(draft.PublishedAtUtc, post.PublishedAtUtc) AS PublishedDate,
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
        CASE WHEN draft.ArticleId IS NULL THEN post.SeoTitle ELSE draft.SeoTitle END AS SeoTitle,
        CASE WHEN draft.ArticleId IS NULL THEN post.SeoDescription ELSE draft.SeoDescription END AS SeoDescription,
        COALESCE(draft.IsFeatured, post.IsFeatured) AS IsFeatured,
        COALESCE(draft.PublishedAtUtc, post.PublishedAtUtc) AS PublishedDate,
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
    @SeoTitle nvarchar(300) = NULL,
    @SeoDescription nvarchar(500) = NULL,
    @IsFeatured bit = 0,
    @PublishedAtUtc datetime2(3) = NULL,
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
            Author, FeaturedImage, PlainText, SeoTitle, SeoDescription,
            IsFeatured, ContentType
        )
        VALUES
        (
            @ArticleId, @Slug, @Title, @Summary, @HtmlContent, 'draft',
            @Now, @Now, @PublishedAtUtc, @Category, @TagsJson,
            @Author, @FeaturedImage, @PlainText, @SeoTitle, @SeoDescription,
            @IsFeatured, 'article'
        );
    END
    ELSE IF EXISTS
    (
        SELECT 1 FROM web.BlogPosts
        WHERE BlogPostId = @ArticleId AND Status = 'published' AND ContentType = 'article'
    )
    BEGIN
        DECLARE @EffectivePublishedAtUtc datetime2(3) = COALESCE
        (
            @PublishedAtUtc,
            (SELECT PublishedAtUtc FROM web.BlogPosts WHERE BlogPostId = @ArticleId)
        );

        IF EXISTS (SELECT 1 FROM web.ArticleDrafts WHERE ArticleId = @ArticleId)
            UPDATE web.ArticleDrafts
            SET Slug = @Slug, Title = @Title, Summary = @Summary,
                SanitizedHtml = @HtmlContent, PlainText = @PlainText,
                Category = @Category, TagsJson = @TagsJson, Author = @Author,
                FeaturedImage = @FeaturedImage, SeoTitle = @SeoTitle,
                SeoDescription = @SeoDescription, IsFeatured = @IsFeatured,
                PublishedAtUtc = @EffectivePublishedAtUtc, ModifiedAtUtc = @Now
            WHERE ArticleId = @ArticleId;
        ELSE
            INSERT web.ArticleDrafts
            (
                ArticleId, Slug, Title, Summary, SanitizedHtml, PlainText,
                Category, TagsJson, Author, FeaturedImage, SeoTitle,
                SeoDescription, IsFeatured, PublishedAtUtc, CreatedAtUtc,
                ModifiedAtUtc
            )
            VALUES
            (
                @ArticleId, @Slug, @Title, @Summary, @HtmlContent, @PlainText,
                @Category, @TagsJson, @Author, @FeaturedImage, @SeoTitle,
                @SeoDescription, @IsFeatured, @EffectivePublishedAtUtc, @Now,
                @Now
            );
    END
    ELSE
    BEGIN
        UPDATE web.BlogPosts
        SET Slug = @Slug, Title = @Title, Summary = @Summary,
            SanitizedHtml = @HtmlContent, PlainText = @PlainText,
            Category = @Category, TagsJson = @TagsJson, Author = @Author,
            FeaturedImage = @FeaturedImage, SeoTitle = @SeoTitle,
            SeoDescription = @SeoDescription, IsFeatured = @IsFeatured,
            PublishedAtUtc = @PublishedAtUtc, Status = 'draft', ModifiedAtUtc = @Now
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
            SeoTitle = draft.SeoTitle, SeoDescription = draft.SeoDescription,
            IsFeatured = draft.IsFeatured, Status = 'published',
            PublishedAtUtc = COALESCE(draft.PublishedAtUtc, post.PublishedAtUtc, @Now),
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
                SeoTitle = draft.SeoTitle, SeoDescription = draft.SeoDescription,
                IsFeatured = draft.IsFeatured,
                PublishedAtUtc = draft.PublishedAtUtc,
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
        SeoTitle,
        SeoDescription,
        IsFeatured,
        PublishedAtUtc AS PublishedDate,
        ModifiedAtUtc AS ModifiedDate
    FROM web.BlogPosts
    WHERE Status = 'published'
      AND ContentType = 'article'
      AND PublishedAtUtc <= SYSUTCDATETIME()
    ORDER BY PublishedAtUtc DESC;
END;
GO
