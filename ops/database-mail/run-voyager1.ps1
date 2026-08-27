[CmdletBinding()]
param(
    [string]$SqlInstance = "."
)

$ErrorActionPreference = "Stop"
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$configureScript = Join-Path $scriptDirectory "configure_database_mail.sql"
$verifyScript = Join-Path $scriptDirectory "verify_database_mail.sql"

if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    throw "sqlcmd was not found. Install the Microsoft SQL command-line tools first."
}

if (-not (Test-Path $configureScript) -or -not (Test-Path $verifyScript)) {
    throw "The Database Mail SQL files must remain in the same folder as this runner."
}

$firstPassword = Read-Host "Namecheap password for steve@netherwooddatapartners.com" -AsSecureString
$secondPassword = Read-Host "Confirm the Namecheap password" -AsSecureString

$firstPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($firstPassword)
$secondPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secondPassword)

try {
    $firstPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($firstPointer)
    $secondPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secondPointer)

    if ([string]::IsNullOrWhiteSpace($firstPlain)) {
        throw "The SMTP password cannot be empty."
    }

    if ($firstPlain -cne $secondPlain) {
        throw "The SMTP passwords did not match. No changes were made."
    }

    $env:SMTP_PASSWORD_B64 = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($firstPlain))
    $firstPlain = $null
    $secondPlain = $null

    & sqlcmd -S $SqlInstance -E -b -V 16 -l 15 -t 60 -i $configureScript
    if ($LASTEXITCODE -ne 0) {
        throw "Database Mail configuration failed with sqlcmd exit code $LASTEXITCODE."
    }

    & sqlcmd -S $SqlInstance -E -b -V 16 -l 15 -t 60 -i $verifyScript
    if ($LASTEXITCODE -ne 0) {
        throw "Database Mail verification failed with sqlcmd exit code $LASTEXITCODE."
    }
}
finally {
    Remove-Item Env:SMTP_PASSWORD_B64 -ErrorAction SilentlyContinue
    $firstPlain = $null
    $secondPlain = $null

    if ($firstPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($firstPointer)
    }
    if ($secondPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secondPointer)
    }
}

Write-Host "Voyager 1 Database Mail is configured."
Write-Host "Restart SQL Server Agent before using job notifications."
Write-Host "A test email has not been sent; use send_test_mail.sql when you are ready."
