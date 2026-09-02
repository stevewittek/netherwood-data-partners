:on error exit

USE master;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF N'$(ArticlePasswordHex)' = N''
   OR N'$(ArticlePasswordHex)' LIKE N'%[^0-9A-Fa-f]%'
   OR LEN(N'$(ArticlePasswordHex)') % 4 <> 0
    THROW 51000, 'ArticlePasswordHex is missing or invalid.', 1;

DECLARE @ArticlePassword nvarchar(128) = CONVERT
(
    nvarchar(128),
    CONVERT(varbinary(256), N'$(ArticlePasswordHex)', 2)
);

IF LEN(@ArticlePassword) < 24 OR LEN(@ArticlePassword) > 128
    THROW 51000, 'The article-author password must contain 24 to 128 characters.', 1;

IF SUSER_ID(N'ndp_article_author') IS NULL
BEGIN
    DECLARE @CreateLogin nvarchar(max) =
        N'CREATE LOGIN ndp_article_author WITH PASSWORD = '
        + QUOTENAME(@ArticlePassword, N'''')
        + N', CHECK_POLICY = ON, CHECK_EXPIRATION = OFF, DEFAULT_DATABASE = NDP_Web;';
    EXEC(@CreateLogin);
END;
GO

USE NDP_Web;
GO

IF USER_ID(N'ndp_article_author') IS NULL
    CREATE USER ndp_article_author FOR LOGIN ndp_article_author;

IF DATABASE_PRINCIPAL_ID(N'web_article_author') IS NULL
    THROW 51000, 'Apply migration 005_articles_cms before provisioning article authoring.', 1;

IF NOT EXISTS
(
    SELECT 1 FROM sys.database_role_members
    WHERE role_principal_id = DATABASE_PRINCIPAL_ID(N'web_article_author')
      AND member_principal_id = DATABASE_PRINCIPAL_ID(N'ndp_article_author')
)
    ALTER ROLE web_article_author ADD MEMBER ndp_article_author;
GO
