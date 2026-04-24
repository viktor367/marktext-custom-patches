#!/usr/bin/env bash
set -euo pipefail

APP="/Applications/MarkText.app"
ASAR="$APP/Contents/Resources/app.asar"
URL="https://raw.githubusercontent.com/viktor367/marktext-custom-patches/main/downloads/app.asar.gz"
TMP_DIR="$(mktemp -d)"
BACKUP="$ASAR.backup-$(date +%Y%m%d-%H%M%S)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [[ ! -d "$APP" || ! -f "$ASAR" ]]; then
  echo "MarkText.app was not found in /Applications."
  echo "Install MarkText first, then run this command again:"
  echo "  https://github.com/marktext/marktext/releases"
  exit 1
fi

echo "Downloading custom MarkText app.asar..."
curl -L "$URL" -o "$TMP_DIR/app.asar.gz"

echo "Backing up current app.asar..."
cp "$ASAR" "$BACKUP"

echo "Installing custom app.asar..."
gunzip -c "$TMP_DIR/app.asar.gz" > "$TMP_DIR/app.asar"
cp "$TMP_DIR/app.asar" "$ASAR"

echo "Removing macOS quarantine flag if present..."
xattr -dr com.apple.quarantine "$APP" 2>/dev/null || true

echo "Done. Restart MarkText."
echo "Backup: $BACKUP"
