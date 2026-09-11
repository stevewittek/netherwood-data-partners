#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
REPOSITORY_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
readonly REPOSITORY_ROOT
readonly COMPOSE_FILE="${REPOSITORY_ROOT}/backend/compose.yaml"
readonly CANDIDATE_PATH="${REPOSITORY_ROOT}/pages-site/.publication-candidates/articles-snapshot.candidate.json"
readonly CONTAINER_CANDIDATE_PATH="/export/.publication-candidates/articles-snapshot.candidate.json"
readonly CONTAINER_SNAPSHOT_PATH="/export/articles-snapshot.json"
readonly SNAPSHOT_PATH="${REPOSITORY_ROOT}/pages-site/articles-snapshot.json"
readonly MODE="${1:-refresh}"

usage() {
  printf '%s\n' \
    'Usage: publication-sync.sh refresh' \
    '       publication-sync.sh review' \
    '       publication-sync.sh approve <candidate-content-digest>' \
    '       publication-sync.sh publish <approved-content-digest>'
}

mkdir -p "$(dirname -- "$CANDIDATE_PATH")"
exec 9>"${REPOSITORY_ROOT}/pages-site/.publication-candidates/publication.lock"
if ! flock -n 9; then
  printf '%s\n' 'Another article publication cycle is already running.' >&2
  exit 75
fi

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

review() {
  compose run --rm --no-deps articles-review \
    node --experimental-strip-types src/review-article-snapshot.ts \
    "$CONTAINER_CANDIDATE_PATH" "$CONTAINER_SNAPSHOT_PATH"
}

case "$MODE" in
  refresh)
    compose run --rm --no-deps articles-export
    review
    compose run --rm --no-deps api npm run knowledge:ingest
    ;;
  review)
    review
    ;;
  approve)
    digest="${2:-}"
    [[ "$digest" =~ ^[0-9a-f]{64}$ ]] || { usage >&2; exit 2; }
    "${SCRIPT_DIR}/verify-candidate-build.sh" "$CANDIDATE_PATH"
    compose run --rm --no-deps articles-review \
      node --experimental-strip-types src/review-article-snapshot.ts \
      "$CONTAINER_CANDIDATE_PATH" "$CONTAINER_SNAPSHOT_PATH" "--approve=${digest}"
    ;;
  publish)
    digest="${2:-}"
    [[ "$digest" =~ ^[0-9a-f]{64}$ ]] || { usage >&2; exit 2; }
    [[ "${NDP_PUBLICATION_PUSH_CONFIRM:-}" == "origin/main" ]] || {
      printf '%s\n' 'Refusing to push. Set NDP_PUBLICATION_PUSH_CONFIRM=origin/main after review.' >&2
      exit 1
    }
    actual_digest="$(jq -er '.contentDigest' "$SNAPSHOT_PATH")"
    [[ "$actual_digest" == "$digest" ]] || { printf '%s\n' 'Approved snapshot digest does not match.' >&2; exit 1; }
    "${SCRIPT_DIR}/verify-candidate-build.sh" "$SNAPSHOT_PATH"
    cd "$REPOSITORY_ROOT"
    [[ "$(git branch --show-current)" == "main" ]] || { printf '%s\n' 'Publication push requires main.' >&2; exit 1; }
    git diff --cached --quiet || { printf '%s\n' 'Refusing to mix existing staged work into publication.' >&2; exit 1; }
    git fetch origin main
    [[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || {
      printf '%s\n' 'Local main is not exactly synchronized with origin/main.' >&2
      exit 1
    }
    git add -- pages-site/articles-snapshot.json
    if git diff --cached --quiet; then
      printf '%s\n' 'No public article snapshot change requires a website rebuild.'
      exit 0
    fi
    git commit --only pages-site/articles-snapshot.json -m "Publish article snapshot ${digest:0:12}"
    git push origin main
    printf '%s\n' 'Snapshot pushed; the existing main-branch Pages workflow will rebuild the website.'
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
