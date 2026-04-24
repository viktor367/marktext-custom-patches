const fs = require('fs')

const file = process.argv[2]
let text = fs.readFileSync(file, 'utf8')

const marker = 'MARKTEXT_MAIN_WORKSPACE_FILE_LIST_PATCH_20260424'
const block = `
;(() => {
  const marker = '${marker}'
  const { ipcMain } = require('electron')
  const fs = require('fs')
  const path = require('path')
  const markdownPattern = /\\.(md|markdown|mdown|mkdn|mkd|mdwn|mdtxt|mdtext)$/i
  const ignoredDirPattern = /^(\\.|node_modules$|bower_components$|jspm_packages$|dist$|build$|out$|target$|vendor$|coverage$|__pycache__$|venv$|\\.venv$|env$|\\.env$|\\.next$|\\.nuxt$|\\.cache$|tmp$|temp$|logs?$|DerivedData$|Pods$|Carthage$|Applications$|Library$|Movies$|Music$|Pictures$|Photos Library\\.photoslibrary$)$/i

  function resolveDirectory (dir) {
    if (!dir) return dir
    const value = String(dir)
    const home = process.env.HOME || ''
    const candidates = [value]
    if (home && !path.isAbsolute(value)) {
      candidates.push(path.join(home, value))
      candidates.push(path.join(home, 'Library/Mobile Documents/com~apple~CloudDocs', value))
      candidates.push(path.join(home, 'Library/Mobile Documents/com~apple~CloudDocs/一些好玩的', value))
    }
    for (const candidate of candidates) {
      try {
        if (candidate && fs.existsSync(candidate) && fs.lstatSync(candidate).isDirectory()) return candidate
      } catch (e) {}
    }
    return value
  }

  function listMarkdownFiles (dir) {
    const resolved = resolveDirectory(dir)
    const files = []
    const queue = [{ dir: resolved, depth: 0 }]
    const maxFiles = 3000
    const maxDepth = 12
    while (queue.length && files.length < maxFiles) {
      const item = queue.shift()
      let entries = []
      try {
        entries = fs.readdirSync(item.dir, { withFileTypes: true })
      } catch (e) {
        continue
      }
      entries.sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
        return a.name.localeCompare(b.name, 'zh-Hans-CN')
      })
      for (const entry of entries) {
        if (entry.name === '.DS_Store') continue
        const full = path.join(item.dir, entry.name)
        if (entry.isDirectory()) {
          if (item.depth < maxDepth && !ignoredDirPattern.test(entry.name)) queue.push({ dir: full, depth: item.depth + 1 })
        } else if (entry.isFile() && markdownPattern.test(entry.name)) {
          files.push(full)
          if (files.length >= maxFiles) break
        }
      }
    }
    return { dir: resolved, files }
  }

  ipcMain.removeAllListeners('mt::workspace-list-markdown-files-sync')
  ipcMain.on('mt::workspace-list-markdown-files-sync', (event, dir) => {
    event.returnValue = listMarkdownFiles(dir)
  })
})()
`

const startNeedle = `;(() => {\n  const marker = '${marker}'`
const start = text.indexOf(startNeedle)
if (start === -1) {
  text += block
} else {
  const next = text.indexOf('\n\n;(() => {', start + startNeedle.length)
  text = text.slice(0, start) + block.trimEnd() + (next === -1 ? '' : text.slice(next))
}

fs.writeFileSync(file, text)
