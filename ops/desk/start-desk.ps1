# Uses existing Windows OpenSSH credentials; no Node installation required.
$ErrorActionPreference = 'Stop'
Write-Host 'Keep this connection open. Open http://127.0.0.1:5173/admin/articles/ and use API http://127.0.0.1:13001.'
ssh -N -L 127.0.0.1:5173:127.0.0.1:5173 -L 127.0.0.1:13001:127.0.0.1:3000 -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=yes nasa@192.168.1.206
