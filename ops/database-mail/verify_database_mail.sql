:ON ERROR EXIT

USE msdb;

SET NOCOUNT ON;

SELECT
    @@SERVERNAME AS server_name,
    CONVERT(nvarchar(128), SERVERPROPERTY('HostPlatform')) AS host_platform,
    c.value_in_use AS database_mail_xps_enabled
FROM sys.configurations c
WHERE c.name = N'Database Mail XPs';

SELECT
    p.name AS profile_name,
    a.name AS account_name,
    a.email_address AS sender_address,
    s.servername AS smtp_server,
    s.port AS smtp_port,
    s.username AS authenticated_mailbox,
    s.enable_ssl,
    pa.sequence_number
FROM msdb.dbo.sysmail_profile p
INNER JOIN msdb.dbo.sysmail_profileaccount pa ON pa.profile_id = p.profile_id
INNER JOIN msdb.dbo.sysmail_account a ON a.account_id = pa.account_id
INNER JOIN msdb.dbo.sysmail_server s ON s.account_id = a.account_id
WHERE p.name = N'Netherwood Database Mail';

SELECT
    o.name AS operator_name,
    o.enabled,
    o.email_address
FROM msdb.dbo.sysoperators o
WHERE o.name = N'Netherwood DBA';

SELECT TOP (10)
    sent_status,
    subject,
    recipients,
    send_request_date,
    sent_date,
    last_mod_date
FROM msdb.dbo.sysmail_allitems
ORDER BY mailitem_id DESC;

SELECT TOP (10)
    log_date,
    event_type,
    description
FROM msdb.dbo.sysmail_event_log
ORDER BY log_id DESC;
