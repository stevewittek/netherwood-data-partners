# Private owner publishing desk

Preferred access uses the reviewed desk hosted privately on Voyager 2; no Node installation is needed on your workstation. Run `ops/desk/start-desk.ps1` in Windows PowerShell or `bash ops/desk/start-desk.sh` on the Mac, keep the connection open, and open http://127.0.0.1:5173/admin/articles/. Use http://127.0.0.1:13001 as the API endpoint and the existing protected publishing credential. If the ports are already occupied by your desk connection, reuse that connection rather than starting another.

The enabled `ndp-owner-desk.service` serves the immutable reviewed artifact from `/home/nasa/netherwood-desk-preview-20260912-final` on loopback only and restarts on failure. Its template is in `ops/desk/`. Upgrading requires building and checking a new release artifact in a new directory, updating the unit paths, and restarting only this private preview service. Retain the old directory for rollback.

Alternative: use a trusted local build of the reviewed release. The public website remains independent of this private connection. No new firewall, public endpoint, SQL credentials, or permanent browser credential storage is required.

1. Build the reviewed checkout with `pnpm build:pages`.
2. Start `pnpm desk` (or `node scripts/preview-pages.mjs --desk`). It binds only to 127.0.0.1:5173. Keep this terminal running.
3. In another terminal, open the existing SSH connection with `ssh -N -L 127.0.0.1:13001:127.0.0.1:3000 -o ExitOnForwardFailure=yes nasa@192.168.1.206`. On the Mac use the existing Voyager key with `-i ~/.ssh/id_ed25519_voyager2` if not selected automatically. Do not bypass host-key validation. Windows existing SSH access was verified on September 12.
4. Open http://127.0.0.1:5173/admin/articles/ and enter http://127.0.0.1:13001 as the API endpoint. Enter the existing publishing credential through the owner's protected access process. Do not copy the backend environment or SQL passwords to the workstation.
5. Save Draft stages work; Preview renders sanitized HTML; Publish changes SQL visibility. Publication normally follows the next 15-minute cycle plus build/CDN time (about 15–30 minutes in healthy conditions).
6. Use Refresh publication status. Current website version requires matching deployed content, not just a matching URL. Article AI knowledge reports the private status API result separately. Neither an API save nor a green static build proves live publication.
7. Unpublish or archive changes SQL immediately; website removal remains pending until a successful subsequent deployment. Check the old route and sitemap as well as the desk. A previously open/offline page can retain withdrawn content until refreshed online.
8. Lock desk before closing the connection. Lock discards unsaved text after confirmation. Close SSH and the local server with Ctrl+C when finished.

The --desk server fetches only the two fixed public release-evidence URLs from the actual production website. It never substitutes a local snapshot for live evidence and never proxies publishing credentials. API browser requests use the existing permitted local origin. Ordinary preview:pages retains its previous local-only behavior.

Rollback: restore the previous Pages artifact using PUBLICATION_OPERATIONS.md. The private API image must be restored separately using the recorded previous image; no schema migration is introduced by this release. Preserve the publication timer and existing configuration.
