:on error exit

USE NDP_Web;
GO

SET NOCOUNT ON;

IF SUSER_SNAME() <> N'ndp_article_author' OR USER_NAME() <> N'ndp_article_author'
    THROW 51000, 'Article verification must connect as ndp_article_author.', 1;
IF IS_ROLEMEMBER(N'web_article_author') <> 1
    THROW 51000, 'ndp_article_author is not a member of web_article_author.', 1;

IF ISNULL(HAS_PERMS_BY_NAME(N'web.ListAdminArticles', N'OBJECT', N'EXECUTE'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.GetAdminArticle', N'OBJECT', N'EXECUTE'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.SaveArticleDraft', N'OBJECT', N'EXECUTE'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.PublishArticle', N'OBJECT', N'EXECUTE'), 0) <> 1
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.ArchiveArticle', N'OBJECT', N'EXECUTE'), 0) <> 1
    THROW 51000, 'ndp_article_author lacks a required procedure permission.', 1;

IF ISNULL(HAS_PERMS_BY_NAME(N'web.BlogPosts', N'OBJECT', N'SELECT'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.BlogPosts', N'OBJECT', N'INSERT'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web.ArticleDrafts', N'OBJECT', N'UPDATE'), 0) <> 0
   OR ISNULL(HAS_PERMS_BY_NAME(N'web', N'SCHEMA', N'ALTER'), 0) <> 0
    THROW 51000, 'ndp_article_author has a prohibited direct permission.', 1;

SELECT N'article_login_verified' AS VerificationStatus, DB_NAME() AS DatabaseName;
GO
