#!/bin/sh
# One-time baseline sync: zk's marble branch -> zkThemeTemplate's marble branch.
# Run manually by someone with push access to zkoss/zkThemeTemplate.
# See doc/marble-theme-template-sync-plan.md (Phase 0) for context.

set -eu

ZK_REPO="${ZK_REPO:-/Users/hawk/Documents/workspace/ZK10/zk}"
TEMPLATE_REPO="${TEMPLATE_REPO:-/Users/hawk/Documents/workspace/zkThemeTemplate}"
ASSUME_YES=0

for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

if [ ! -d "$ZK_REPO/.git" ]; then
  echo "ZK_REPO ($ZK_REPO) is not a git repo." >&2
  exit 1
fi
if [ ! -d "$TEMPLATE_REPO/.git" ]; then
  echo "TEMPLATE_REPO ($TEMPLATE_REPO) is not a git repo." >&2
  exit 1
fi

SRC_ZUL="$ZK_REPO/zul/src/main/resources/web/zul/css"
SRC_JS="$ZK_REPO/zul/src/main/resources/web/js/zul"
DST_ZUL="$TEMPLATE_REPO/src/main/resources/web/zul/css"
DST_JS="$TEMPLATE_REPO/src/main/resources/web/js/zul"

ZK_SHA=$(git -C "$ZK_REPO" rev-parse --short=12 marble)
echo "==> Baselining from zk@$ZK_SHA (branch marble)"

echo "==> Fetching zkThemeTemplate origin/marble"
git -C "$TEMPLATE_REPO" fetch origin marble

if git -C "$TEMPLATE_REPO" show-ref --verify --quiet refs/heads/marble_origin; then
  echo "==> Local branch marble_origin already exists, leaving it as is"
else
  echo "==> Creating backup branch marble_origin from origin/marble"
  git -C "$TEMPLATE_REPO" branch marble_origin origin/marble
fi

if git -C "$TEMPLATE_REPO" ls-remote --exit-code --heads origin marble_origin >/dev/null 2>&1; then
  echo "==> origin/marble_origin already exists, not pushing over it"
else
  echo "==> Pushing backup branch to origin"
  git -C "$TEMPLATE_REPO" push origin marble_origin
fi

echo "==> Checking out marble (reset to origin/marble)"
git -C "$TEMPLATE_REPO" checkout -B marble origin/marble

echo "==> Syncing zul/css"
rsync -a --delete "$SRC_ZUL"/ "$DST_ZUL"/

echo "==> Syncing js/zul/*/css"
find "$SRC_JS" -type d -name css | while IFS= read -r dir; do
  rel=$(echo "$dir" | sed "s#^$SRC_JS/##")
  mkdir -p "$DST_JS/$rel"
  rsync -a --delete "$dir"/ "$DST_JS/$rel"/
done

echo "==> Resulting changes in zkThemeTemplate:"
git -C "$TEMPLATE_REPO" status --porcelain -- src/main/resources/web/zul/css src/main/resources/web/js/zul

if [ "$ASSUME_YES" != "1" ]; then
  printf 'Commit and push the above changes to origin/marble? [y/N] '
  read -r REPLY
  case "$REPLY" in
    y|Y) ;;
    *) echo "Aborted before commit. Working tree changes are left in place for review."; exit 0 ;;
  esac
fi

git -C "$TEMPLATE_REPO" add -- src/main/resources/web/zul/css src/main/resources/web/js/zul
git -C "$TEMPLATE_REPO" commit -m "sync Marble CSS from zkoss/zk@$ZK_SHA"
git -C "$TEMPLATE_REPO" push origin marble

echo "==> Done. zkThemeTemplate marble is now baselined to zk@$ZK_SHA"
