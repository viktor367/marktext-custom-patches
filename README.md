# MarkText Custom Patches

Local patch scripts for a customized MarkText build.

## What This Saves

- Adds a Markdown-only multi-directory browser in the left sidebar.
- Keeps the sidebar lightweight by skipping code, cache, media, dependency, and build folders.
- Shows only Markdown-like files and caps scanning at 3000 files / 12 levels.
- Keeps each added directory as its own collapsible block with Switch, Refresh, and Remove controls.
- Removes the old eye-protection control while keeping the current white and warm yellow theme.

## Files

- `marktext-asar-tool.js`: minimal tool to extract and replace files inside `app.asar`.
- `append-marktext-main-file-list.js`: patches MarkText main process directory scanning.
- `patch-marktext-sidebar-files.js`: patches renderer sidebar UI and theme behavior.
- `patch-marktext-open-order.js`: keeps file opening order stable when MarkText also opens a folder.

## Apply Manually

Use a fresh backup before replacing MarkText's `app.asar`.

```bash
APP_ASAR="/Applications/MarkText.app/Contents/Resources/app.asar"
WORK_DIR="/tmp/marktext-patch-work"

mkdir -p "$WORK_DIR"
cp "$APP_ASAR" "$APP_ASAR.backup-$(date +%Y%m%d-%H%M%S)"

node marktext-asar-tool.js extract "$APP_ASAR" dist/electron/main.js "$WORK_DIR/main.js"
node marktext-asar-tool.js extract "$APP_ASAR" dist/electron/renderer.js "$WORK_DIR/renderer.js"

node append-marktext-main-file-list.js "$WORK_DIR/main.js"
node patch-marktext-sidebar-files.js "$WORK_DIR/renderer.js"

node marktext-asar-tool.js replace "$APP_ASAR" "$WORK_DIR/app.asar" \
  dist/electron/main.js="$WORK_DIR/main.js" \
  dist/electron/renderer.js="$WORK_DIR/renderer.js"

cp "$WORK_DIR/app.asar" "$APP_ASAR"
```

Restart MarkText after applying.

## Terminal Install For Friends

Install the official MarkText app first, then run:

```bash
curl -fsSL https://raw.githubusercontent.com/viktor367/marktext-custom-patches/main/install-marktext-custom.sh | bash
```

This downloads the customized `app.asar`, backs up the existing MarkText `app.asar`, and installs the custom sidebar build.

Full app zip is not stored in the repository. GitHub Release upload was unreliable for the 106MB app package, so this repo distributes the smaller 21MB patch payload.

## Do Not Commit

Do not commit `app.asar`, app backups, or distribution zip files. They are large generated artifacts.
