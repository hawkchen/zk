#!/bin/sh
# One-time setup: create a deploy key that lets the "Sync Marble CSS to
# zkThemeTemplate" workflow (running in the hawkchen/zkcml fork) push to
# zkoss/zkThemeTemplate's marble branch.
#
# Run this yourself (requires admin on zkoss/zkThemeTemplate and secret-write
# access on hawkchen/zkcml) — each step is synchronous and must succeed before
# the next one runs (set -e stops the script on the first failure).

set -eu

KEY_PATH="${TMPDIR:-/tmp}/zkthemetemplate_sync_zkcml"
FORK_REPO="hawkchen/zkcml"
TEMPLATE_REPO="zkoss/zkThemeTemplate"
SECRET_NAME="ZKTHEMETEMPLATE_DEPLOY_KEY"

cleanup() {
  rm -f "$KEY_PATH" "$KEY_PATH.pub"
}
trap cleanup EXIT

echo "==> 1. Generating a new ed25519 keypair"
rm -f "$KEY_PATH" "$KEY_PATH.pub"
ssh-keygen -t ed25519 -f "$KEY_PATH" -N "" -C "hawkchen-zkcml-marble-sync-ci@zkoss" -q

echo "==> 2. Adding the public key as a write-enabled Deploy Key on $TEMPLATE_REPO"
gh repo deploy-key add "$KEY_PATH.pub" \
  --repo "$TEMPLATE_REPO" \
  --title "hawkchen/zkcml marble CSS sync (write)" \
  --allow-write

echo "==> 3. Storing the private key as a Secret on $FORK_REPO"
gh secret set "$SECRET_NAME" --repo "$FORK_REPO" < "$KEY_PATH"

echo "==> 4. Verifying"
gh secret list --repo "$FORK_REPO" | grep "$SECRET_NAME"

echo "==> Done. Local key material will be removed on exit."
