#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
REPOSITORY_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
readonly REPOSITORY_ROOT
CANDIDATE_PATH="$(realpath -- "${1:-${REPOSITORY_ROOT}/pages-site/.publication-candidates/articles-snapshot.candidate.json}")"
readonly CANDIDATE_PATH
[[ -f "$CANDIDATE_PATH" && ! -L "$CANDIDATE_PATH" ]] || { printf '%s\n' 'Candidate must be a regular file.' >&2; exit 1; }

TEMPORARY_ROOT="$(mktemp -d -t ndp-article-build-XXXXXXXX)"
readonly TEMPORARY_ROOT
cleanup() {
  case "$TEMPORARY_ROOT" in
    /tmp/ndp-article-build-*) rm -rf -- "$TEMPORARY_ROOT" ;;
    *) printf 'Refusing unexpected temporary cleanup path: %s\n' "$TEMPORARY_ROOT" >&2 ;;
  esac
}
trap cleanup EXIT

rsync -a \
  --exclude .git \
  --exclude node_modules \
  --exclude pages-dist \
  --exclude pages-site/.publication-candidates \
  --exclude backend/node_modules \
  "$REPOSITORY_ROOT/" "$TEMPORARY_ROOT/"
cp -- "$CANDIDATE_PATH" "$TEMPORARY_ROOT/pages-site/articles-snapshot.json"

docker run --rm --network none \
  --user "$(id -u):$(id -g)" \
  --tmpfs /workspace/node_modules/.vite-temp:rw,mode=1777 \
  --volume "$TEMPORARY_ROOT:/workspace" \
  --volume "$REPOSITORY_ROOT/node_modules:/workspace/node_modules:ro" \
  --workdir /workspace \
  node:22.13.1-bookworm-slim \
  sh -ceu '
    node scripts/validate-article-snapshot.mjs
    node node_modules/eslint/bin/eslint.js . --ignore-pattern dist --ignore-pattern pages-dist --ignore-pattern .next
    WRANGLER_LOG_PATH=/workspace/.wrangler/wrangler.log node node_modules/vinext/dist/cli.js build
    node node_modules/vite/bin/vite.js build --config vite.pages.config.ts --configLoader runner
    node scripts/generate-static-pages.mjs
    test -f pages-dist/articles/index.html
    test -f pages-dist/articles-sitemap.xml
  '

expected_count="$(jq -er '.articleCount // (.articles | length)' "$CANDIDATE_PATH")"
actual_count="$(find "$TEMPORARY_ROOT/pages-dist/articles" -mindepth 2 -maxdepth 2 -name index.html -type f | wc -l)"
[[ "$actual_count" -eq "$expected_count" ]] || {
  printf 'Expected %s native article routes; isolated build emitted %s.\n' "$expected_count" "$actual_count" >&2
  exit 1
}
printf 'Validated candidate and isolated Pages build with %s native article routes.\n' "$actual_count"
