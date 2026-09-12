#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' 'Keep this connection open. Open http://127.0.0.1:5173/admin/articles/ and use API http://127.0.0.1:13001.'
exec ssh -N -L 127.0.0.1:5173:127.0.0.1:5173 -L 127.0.0.1:13001:127.0.0.1:3000 -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes -i "$HOME/.ssh/id_ed25519_voyager2" nasa@192.168.1.206
