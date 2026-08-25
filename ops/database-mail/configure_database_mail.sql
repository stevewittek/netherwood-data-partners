:ON ERROR EXIT

USE msdb;

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF IS_SRVROLEMEMBER(N'sysadmin') <> 1
    THROW 51000, 'Database Mail setup must be run by a sysadmin login.', 1;

DECLARE @ProfileName sysname = N'Netherwood Database Mail';
DECLARE @AccountName sysname = N'Netherwood Database Mail SMTP';
DECLARE @OperatorName sysname = N'Netherwood DBA';
DECLARE @SenderAddress nvarchar(320) = N'database@netherwooddatapartners.com';
DECLARE @SmtpUser nvarchar(320) = N'steve@netherwooddatapartners.com';
DECLARE @OperatorAddress nvarchar(320) = N'steve@netherwooddatapartners.com';
DECLARE @EncodedPassword varchar(max) = '$(SMTP_PASSWORD_B64)';
DECLARE @PasswordBytes varbinary(max);
DECLARE @SmtpPassword nvarchar(128);
DECLARE @DisplayName nvarchar(256) = CONCAT(N'Netherwood Database Mail - ', COALESCE(CONVERT(nvarchar(128), SERVERPROPERTY('MachineName')), @@SERVERNAME));

IF @EncodedPassword IS NULL OR @EncodedPassword = '' OR @EncodedPassword = '$(SMTP_PASSWORD_B64)'
    THROW 51001, 'SMTP_PASSWORD_B64 is missing. Use the supplied Voyager runner.', 1;

BEGIN TRY
    SET @PasswordBytes = CAST(N'' AS xml).value(
        'xs:base64Binary(sql:variable("@EncodedPassword"))',
        'varbinary(max)'
    );
END TRY
BEGIN CATCH
    THROW 51002, 'The supplied SMTP password could not be decoded. Use the supplied Voyager runner.', 1;
END CATCH;

IF DATALENGTH(@PasswordBytes) > 256 OR DATALENGTH(@PasswordBytes) % 2 <> 0
    THROW 51003, 'The SMTP password must contain no more than 128 Unicode characters.', 1;

SET @SmtpPassword = CONVERT(nvarchar(128), @PasswordBytes);

IF @SmtpPassword IS NULL OR DATALENGTH(@SmtpPassword) = 0
    THROW 51004, 'The SMTP password cannot be empty.', 1;

IF EXISTS (
    SELECT 1
    FROM sys.configurations
    WHERE name = N'Database Mail XPs'
      AND value_in_use = 0
)
BEGIN
    EXEC sys.sp_configure N'show advanced options', 1;
    RECONFIGURE;
    EXEC sys.sp_configure N'Database Mail XPs', 1;
    RECONFIGURE;
END;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysmail_account WHERE name = @AccountName)
BEGIN
    EXEC msdb.dbo.sysmail_update_account_sp
        @account_name = @AccountName,
        @description = N'Namecheap Private Email SMTP for Netherwood database alerts',
        @email_address = @SenderAddress,
        @display_name = @DisplayName,
        @replyto_address = @SenderAddress,
        @mailserver_name = N'mail.privateemail.com',
        @mailserver_type = N'SMTP',
        @port = 587,
        @username = @SmtpUser,
        @password = @SmtpPassword,
        @use_default_credentials = 0,
        @enable_ssl = 1;
END
ELSE
BEGIN
    EXEC msdb.dbo.sysmail_add_account_sp
        @account_name = @AccountName,
        @description = N'Namecheap Private Email SMTP for Netherwood database alerts',
        @email_address = @SenderAddress,
        @display_name = @DisplayName,
        @replyto_address = @SenderAddress,
        @mailserver_name = N'mail.privateemail.com',
        @mailserver_type = N'SMTP',
        @port = 587,
        @username = @SmtpUser,
        @password = @SmtpPassword,
        @use_default_credentials = 0,
        @enable_ssl = 1;
END;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysmail_profile WHERE name = @ProfileName)
BEGIN
    EXEC msdb.dbo.sysmail_update_profile_sp
        @profile_name = @ProfileName,
        @description = N'Default Database Mail profile for Netherwood Voyager servers';
END
ELSE
BEGIN
    EXEC msdb.dbo.sysmail_add_profile_sp
        @profile_name = @ProfileName,
        @description = N'Default Database Mail profile for Netherwood Voyager servers';
END;

DECLARE @ProfileId int = (SELECT profile_id FROM msdb.dbo.sysmail_profile WHERE name = @ProfileName);
DECLARE @AccountId int = (SELECT account_id FROM msdb.dbo.sysmail_account WHERE name = @AccountName);

IF EXISTS (
    SELECT 1
    FROM msdb.dbo.sysmail_profileaccount
    WHERE profile_id = @ProfileId
      AND account_id = @AccountId
)
BEGIN
    EXEC msdb.dbo.sysmail_update_profileaccount_sp
        @profile_name = @ProfileName,
        @account_name = @AccountName,
        @sequence_number = 1;
END
ELSE
BEGIN
    EXEC msdb.dbo.sysmail_add_profileaccount_sp
        @profile_name = @ProfileName,
        @account_name = @AccountName,
        @sequence_number = 1;
END;

IF EXISTS (
    SELECT 1
    FROM msdb.dbo.sysmail_principalprofile pp
    INNER JOIN msdb.sys.database_principals dp ON dp.principal_id = pp.principal_id
    INNER JOIN msdb.dbo.sysmail_profile p ON p.profile_id = pp.profile_id
    WHERE dp.name = N'public'
      AND p.name = @ProfileName
)
BEGIN
    EXEC msdb.dbo.sysmail_update_principalprofile_sp
        @principal_name = N'public',
        @profile_name = @ProfileName,
        @is_default = 1;
END
ELSE
BEGIN
    EXEC msdb.dbo.sysmail_add_principalprofile_sp
        @principal_name = N'public',
        @profile_name = @ProfileName,
        @is_default = 1;
END;

IF EXISTS (SELECT 1 FROM msdb.dbo.sysoperators WHERE name = @OperatorName)
BEGIN
    EXEC msdb.dbo.sp_update_operator
        @name = @OperatorName,
        @enabled = 1,
        @email_address = @OperatorAddress;
END
ELSE
BEGIN
    EXEC msdb.dbo.sp_add_operator
        @name = @OperatorName,
        @enabled = 1,
        @email_address = @OperatorAddress;
END;

/*
  On Windows, SSMS uses this SQL Agent procedure for the Mail Session settings.
  It is guarded because these parameters are not present in every SQL Server build.
  Linux Agent is configured by mssql-conf in the Voyager 2 runner.
*/
IF CONVERT(nvarchar(128), SERVERPROPERTY('HostPlatform')) = N'Windows'
   AND OBJECT_ID(N'msdb.dbo.sp_set_sqlagent_properties', N'P') IS NOT NULL
   AND EXISTS (
       SELECT 1
       FROM msdb.sys.parameters
       WHERE object_id = OBJECT_ID(N'msdb.dbo.sp_set_sqlagent_properties')
         AND name = N'@use_databasemail'
   )
   AND EXISTS (
       SELECT 1
       FROM msdb.sys.parameters
       WHERE object_id = OBJECT_ID(N'msdb.dbo.sp_set_sqlagent_properties')
         AND name = N'@databasemail_profile'
   )
BEGIN
    EXEC msdb.dbo.sp_set_sqlagent_properties
        @use_databasemail = 1,
        @databasemail_profile = @ProfileName;
END;

SET @SmtpPassword = NULL;
SET @PasswordBytes = NULL;
SET @EncodedPassword = NULL;

SELECT
    @@SERVERNAME AS server_name,
    CONVERT(nvarchar(128), SERVERPROPERTY('HostPlatform')) AS host_platform,
    @ProfileName AS database_mail_profile,
    @SenderAddress AS sender_address,
    @SmtpUser AS authenticated_mailbox,
    N'mail.privateemail.com' AS smtp_server,
    587 AS smtp_port,
    @OperatorName AS sql_agent_operator,
    @OperatorAddress AS operator_recipient;

PRINT N'Database Mail configuration completed. Restart SQL Server Agent before relying on job notifications.';
