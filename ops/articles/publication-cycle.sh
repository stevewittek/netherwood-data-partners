#!/usr/bin/env bash
set -Eeuo pipefail
TASK_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly TASK_ROOT
cd "$TASK_ROOT"
[[ "${NDP_PUBLICATION_ENABLED:-}" == true ]] || { echo 'Publication activation is disabled.' >&2; exit 1; }
mkdir -p .publication-state
exec 9>.publication-state/cycle.lock
flock -n 9 || exit 0
stage=export
trap 'printf "Publication cycle failed at %s. Check the GitHub run and publication.json; a dispatched release may still finish. Next cycle retries. See journalctl --user -u ndp-publication.service.\n" "$stage" >&2' ERR
# Retry is inside the exporter; none of these commands restart shared services.
docker compose -f backend/compose.yaml run --rm --no-deps articles-export
stage=transfer
node --experimental-strip-types scripts/publish-article-export.ts pages-site/.publication-candidates/articles-snapshot.candidate.json
# Article knowledge follows the deployed snapshot, independently of a pending build.
stage=knowledge
docker compose -f backend/compose.yaml run --rm --no-deps api node --experimental-strip-types src/ingest-publication.ts
