:ON ERROR EXIT

USE msdb;

SET NOCOUNT ON;

DECLARE @Subject nvarchar(255) = CONCAT(N'Database Mail test from ', @@SERVERNAME);
DECLARE @Body nvarchar(max) = CONCAT(
    N'This is a Database Mail test from ',
    @@SERVERNAME,
    N'. The message was sent using database@netherwooddatapartners.com.'
);

EXEC msdb.dbo.sp_send_dbmail
    @profile_name = N'Netherwood Database Mail',
    @recipients = N'steve@netherwooddatapartners.com',
    @subject = @Subject,
    @body = @Body,
    @importance = N'Normal';

PRINT N'Test message queued for steve@netherwooddatapartners.com.';
