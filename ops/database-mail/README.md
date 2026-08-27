# Voyager Database Mail

These files configure both Voyager SQL Server instances to send Database Mail as
`database@netherwooddatapartners.com` through Namecheap Private Email.

The SMTP connection is:

- Server: `mail.privateemail.com`
- Port: `587`
- Encryption: TLS/STARTTLS
- Visible sender and reply-to: `database@netherwooddatapartners.com`
- Authenticated mailbox: `steve@netherwooddatapartners.com`
- Database Mail profile: `Netherwood Database Mail`
- SQL Agent operator: `Netherwood DBA` -> `steve@netherwooddatapartners.com`

Namecheap permits aliases on the current Launch plan to send through their
associated mailbox. The runners therefore request the password for the existing
`steve@...` mailbox. They keep it out of command-line arguments and do not write it
to disk or Git.

## Voyager 1 (Windows)

Open PowerShell as an account that has SQL Server sysadmin access, change to the
repository folder, and run:

```powershell
Set-Location D:\Dev\Netherwood-data-partners\netherwood-data-partners
.\ops\database-mail\run-voyager1.ps1
```

If SQL Server is a named instance, pass it explicitly:

```powershell
.\ops\database-mail\run-voyager1.ps1 -SqlInstance ".\INSTANCE_NAME"
```

The runner prompts twice for the Namecheap mailbox password. When it completes,
restart SQL Server Agent from SQL Server Configuration Manager or Services.

## Voyager 2 (Ubuntu)

This runner reuses the protected, ignored SQL setup credential created by the
backend setup. From the repository root, run:

```bash
./ops/database-mail/run-voyager2.sh
```

The runner prompts twice for the Namecheap mailbox password and configures the
Linux SQL Agent Database Mail profile. It does not restart SQL Server. Schedule
the brief interruption, then run:

```bash
sudo systemctl restart mssql-server
```

## Send one test message

Configuration and verification do not send mail. After the relevant service
restart, explicitly run `send_test_mail.sql` only when a real external test email
to `steve@netherwooddatapartners.com` is wanted.

Voyager 1:

```powershell
sqlcmd -S . -E -b -i .\ops\database-mail\send_test_mail.sql
```

Voyager 2:

```bash
read -r -s -p "SQL setup password: " SQLCMDPASSWORD
printf '\n'
export SQLCMDPASSWORD
sqlcmd -S 127.0.0.1,1433 -U ndp_setup_admin -N -C -b \
  -i ./ops/database-mail/send_test_mail.sql
unset SQLCMDPASSWORD
```

Then rerun `verify_database_mail.sql` to inspect the queue and recent Database
Mail log. No SMTP password is displayed by the verification query.
