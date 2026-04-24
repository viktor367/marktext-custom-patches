const fs = require('fs')

const file = process.argv[2]
let text = fs.readFileSync(file, 'utf8')

function replaceBlock (source, marker, nextMarker, replacement) {
  const startNeedle = `;(() => {\n  const marker = '${marker}'`
  const start = source.indexOf(startNeedle)
  if (start === -1) throw new Error(`Missing block ${marker}`)

  let end
  if (nextMarker) {
    const nextNeedle = `\n\n;(() => {\n  const marker = '${nextMarker}'`
    end = source.indexOf(nextNeedle, start + startNeedle.length)
    if (end === -1) throw new Error(`Missing next block ${nextMarker}`)
  } else {
    end = source.length
  }

  return source.slice(0, start) + replacement.trimEnd() + source.slice(end)
}

const eyeBlock = `
;(() => {
  const marker = 'MARKTEXT_EYE_THEME_PATCH_20260424'
  const storageColorKey = 'marktext.eyeTheme.color'
  const storageEnabledKey = 'marktext.eyeTheme.enabled'
  const defaultColor = '#f4edcf'
  const root = document.documentElement
  let pendingControl = false

  function hexToRgb (hex) {
    const value = /^#?[0-9a-fA-F]{6}$/.test(hex || '') ? hex.replace('#', '') : defaultColor.slice(1)
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    }
  }

  function rgb (color, alpha = 1) {
    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')'
  }

  function mix (a, b, weight) {
    return {
      r: Math.round(a.r * (1 - weight) + b.r * weight),
      g: Math.round(a.g * (1 - weight) + b.g * weight),
      b: Math.round(a.b * (1 - weight) + b.b * weight)
    }
  }

  function setVar (name, value) {
    root.style.setProperty(name, value)
  }

  function clearVars () {
    [
      '--themeColor', '--themeColor90', '--themeColor80', '--themeColor70', '--themeColor60',
      '--themeColor50', '--themeColor40', '--themeColor30', '--themeColor20', '--themeColor10',
      '--highlightThemeColor', '--highlightColor', '--selectionColor', '--editorColor',
      '--editorColor80', '--editorColor60', '--editorColor50', '--editorColor40',
      '--editorColor30', '--editorColor10', '--editorColor04', '--editorBgColor',
      '--iconColor', '--codeBgColor', '--codeBlockBgColor', '--footnoteBgColor',
      '--inputBgColor', '--buttonFontColor', '--buttonBgColor', '--buttonBorder',
      '--buttonBgColorHover', '--buttonBgColorActive', '--tableBorderColor',
      '--sideBarColor', '--sideBarIconColor', '--sideBarTitleColor', '--sideBarTextColor',
      '--sideBarBgColor', '--sideBarItemHoverBgColor', '--itemBgColor', '--floatFontColor',
      '--floatBgColor', '--floatHoverColor', '--floatBorderColor', '--floatShadow', '--maskColor'
    ].forEach(name => root.style.removeProperty(name))
  }

  function applyTheme () {
    const enabled = localStorage.getItem(storageEnabledKey) !== '0'
    document.body && document.body.classList.toggle('mt-eye-theme-enabled', enabled)
    if (!enabled) {
      clearVars()
      return
    }

    const bg = hexToRgb(localStorage.getItem(storageColorKey) || defaultColor)
    const white = { r: 255, g: 255, b: 255 }
    const black = { r: 0, g: 0, b: 0 }
    const text = { r: 48, g: 42, b: 28 }
    const accent = { r: 154, g: 118, b: 27 }
    const surface = mix(bg, white, 0.46)
    const sidebar = mix(bg, black, 0.04)
    const border = mix(bg, black, 0.18)
    const hover = mix(bg, black, 0.08)
    const code = mix(bg, black, 0.06)

    setVar('--themeColor', rgb(accent, 1))
    setVar('--themeColor90', rgb(accent, 0.9))
    setVar('--themeColor80', rgb(accent, 0.8))
    setVar('--themeColor70', rgb(accent, 0.7))
    setVar('--themeColor60', rgb(accent, 0.6))
    setVar('--themeColor50', rgb(accent, 0.5))
    setVar('--themeColor40', rgb(accent, 0.4))
    setVar('--themeColor30', rgb(accent, 0.3))
    setVar('--themeColor20', rgb(accent, 0.2))
    setVar('--themeColor10', rgb(accent, 0.1))
    setVar('--highlightThemeColor', rgb(accent, 1))
    setVar('--highlightColor', rgb(accent, 0.18))
    setVar('--selectionColor', rgb(accent, 0.16))
    setVar('--editorColor', rgb(text, 0.82))
    setVar('--editorColor80', rgb(text, 0.8))
    setVar('--editorColor60', rgb(text, 0.6))
    setVar('--editorColor50', rgb(text, 0.5))
    setVar('--editorColor40', rgb(text, 0.4))
    setVar('--editorColor30', rgb(text, 0.3))
    setVar('--editorColor10', rgb(text, 0.1))
    setVar('--editorColor04', rgb(text, 0.04))
    setVar('--editorBgColor', rgb(bg, 1))
    setVar('--iconColor', rgb(text, 0.62))
    setVar('--codeBgColor', rgb(code, 0.52))
    setVar('--codeBlockBgColor', rgb(code, 0.45))
    setVar('--footnoteBgColor', rgb(code, 0.42))
    setVar('--inputBgColor', rgb(hover, 0.48))
    setVar('--buttonFontColor', rgb(text, 0.82))
    setVar('--buttonBgColor', rgb(surface, 1))
    setVar('--buttonBorder', '1px solid ' + rgb(border, 0.72))
    setVar('--buttonBgColorHover', rgb(mix(surface, white, 0.22), 1))
    setVar('--buttonBgColorActive', rgb(mix(surface, black, 0.05), 1))
    setVar('--tableBorderColor', rgb(border, 0.58))
    setVar('--sideBarColor', rgb(text, 0.66))
    setVar('--sideBarIconColor', rgb(text, 0.55))
    setVar('--sideBarTitleColor', rgb(text, 0.9))
    setVar('--sideBarTextColor', rgb(text, 0.48))
    setVar('--sideBarBgColor', rgb(sidebar, 0.96))
    setVar('--sideBarItemHoverBgColor', rgb(hover, 0.58))
    setVar('--itemBgColor', rgb(surface, 0.7))
    setVar('--floatFontColor', rgb(text, 0.72))
    setVar('--floatBgColor', rgb(surface, 1))
    setVar('--floatHoverColor', rgb(hover, 0.48))
    setVar('--floatBorderColor', rgb(border, 0.6))
    setVar('--floatShadow', 'rgba(86, 66, 20, 0.08) 0px 0px 0px 1px, rgba(86, 66, 20, 0.08) 0px 8px 22px')
    setVar('--maskColor', rgb(mix(bg, white, 0.28), 0.82))
  }

  function ensureStyle () {
    if (document.getElementById(marker + '-style')) return
    const style = document.createElement('style')
    style.id = marker + '-style'
    style.textContent = \`
      body.mt-eye-theme-enabled,
      body.mt-eye-theme-enabled .editor,
      body.mt-eye-theme-enabled .editor-wrapper,
      body.mt-eye-theme-enabled .editor-container,
      body.mt-eye-theme-enabled .editor-component,
      body.mt-eye-theme-enabled .editor-middle,
      body.mt-eye-theme-enabled #ag-editor-id,
      body.mt-eye-theme-enabled .muya,
      body.mt-eye-theme-enabled .muya-container {
        background: var(--editorBgColor) !important;
        color: var(--editorColor) !important;
      }
      body.mt-eye-theme-enabled .title-bar,
      body.mt-eye-theme-enabled .title-bar-editor-bg,
      body.mt-eye-theme-enabled .tab-bar,
      body.mt-eye-theme-enabled .editor-tabs,
      body.mt-eye-theme-enabled .tabs-container {
        background: var(--editorBgColor) !important;
        color: var(--editorColor) !important;
      }
      body.mt-eye-theme-enabled .side-bar,
      body.mt-eye-theme-enabled .tree-wrapper,
      body.mt-eye-theme-enabled .project-tree {
        background: var(--sideBarBgColor) !important;
        color: var(--sideBarColor) !important;
      }
    \`
    document.head.appendChild(style)
  }

  function ensurePanel () {
    const old = document.getElementById(marker + '-panel')
    if (old) old.remove()
  }

  function init () {
    ensureStyle()
    applyTheme()
    ensurePanel()
  }

  function scheduleInit () {
    if (pendingControl) return
    pendingControl = true
    requestAnimationFrame(() => {
      pendingControl = false
      init()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
  setTimeout(init, 500)
  new MutationObserver(scheduleInit).observe(document.documentElement, { childList: true, subtree: true })
})()
`

const directoryBlock = `
;(() => {
  const marker = 'MARKTEXT_ADD_DIRECTORY_PATCH_20260424'
  const storageKey = 'marktext.workspaceDirectories'
  const storageOpenKey = 'marktext.workspaceDirectoryOpenState'
  const markdownPattern = /\\.(md|markdown|mdown|mkdn|mkd|mdwn|mdtxt|mdtext)$/i
  const ignoredDirPattern = /^(\\.|node_modules$|bower_components$|jspm_packages$|dist$|build$|out$|target$|vendor$|coverage$|__pycache__$|venv$|\\.venv$|env$|\\.env$|\\.next$|\\.nuxt$|\\.cache$|tmp$|temp$|logs?$|DerivedData$|Pods$|Carthage$|Applications$|Library$|Movies$|Music$|Pictures$|Photos Library\\.photoslibrary$)$/i
  let currentDirectory = ''
  let pendingInit = false
  let forceRenderVersion = 0

  function electron () {
    try { return require('electron') } catch (e) { return null }
  }

  function remote () {
    try { return require('@electron/remote') } catch (e) { return null }
  }

  function fsApi () {
    try { return require('fs') } catch (e) { return null }
  }

  function pathApi () {
    try { return require('path') } catch (e) { return null }
  }

  function basename (value) {
    return String(value || '').split(/[\\\\/]/).filter(Boolean).pop() || value
  }

  function dirname (value) {
    return String(value || '').replace(/[\\\\/][^\\\\/]*$/, '') || '/'
  }

  function relativePath (base, file) {
    const path = pathApi()
    if (!path) return basename(file)
    try { return path.relative(base, file) || basename(file) } catch (e) { return basename(file) }
  }

  function loadDirectories () {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return Array.isArray(value) ? value.filter(Boolean) : []
    } catch (e) {
      return []
    }
  }

  function saveDirectories (directories) {
    const unique = []
    for (const dir of directories) {
      if (dir && !unique.includes(dir)) unique.push(dir)
    }
    localStorage.setItem(storageKey, JSON.stringify(unique.slice(0, 20)))
  }

  function loadOpenStates () {
    try {
      const value = JSON.parse(localStorage.getItem(storageOpenKey) || '{}')
      return value && typeof value === 'object' ? value : {}
    } catch (e) {
      return {}
    }
  }

  function saveOpenState (dir, open) {
    const states = loadOpenStates()
    states[dir] = !!open
    localStorage.setItem(storageOpenKey, JSON.stringify(states))
  }

  function rememberDirectory (dir) {
    if (!dir) return
    currentDirectory = dir
    saveDirectories([dir, ...loadDirectories()])
    forceRenderVersion++
    renderDirectoryBrowser()
  }

  function removeDirectory (dir) {
    saveDirectories(loadDirectories().filter(item => item !== dir))
    const states = loadOpenStates()
    delete states[dir]
    localStorage.setItem(storageOpenKey, JSON.stringify(states))
    if (currentDirectory === dir) currentDirectory = loadDirectories()[0] || ''
    forceRenderVersion++
    renderDirectoryBrowser()
  }

  function openDirectory (dir) {
    if (!dir) return
    rememberDirectory(dir)
    const api = electron()
    if (api && api.ipcRenderer) api.ipcRenderer.send('mt::workspace-open-directory', dir)
  }

  function openFile (file) {
    const api = electron()
    if (!api || !api.ipcRenderer || !file) return
    const r = remote()
    const win = r && r.getCurrentWindow ? r.getCurrentWindow() : null
    if (win && win.id) api.ipcRenderer.send('mt::open-file-by-window-id', win.id, file)
    else api.ipcRenderer.send('app-open-file-by-id', file)
  }

  function listMarkdownFiles (dir) {
    const fs = fsApi()
    const path = pathApi()
    if (!fs || !path || !dir) return []
    const files = []
    const queue = [{ dir, depth: 0 }]
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
    return files
  }

  function buildMarkdownTree (dir, files) {
    const root = []
    for (const file of files) {
      const parts = relativePath(dir, file).split(/[\\\\/]/).filter(Boolean)
      if (!parts.length) continue
      let level = root
      for (let index = 0; index < parts.length; index++) {
        const name = parts[index]
        const isFile = index === parts.length - 1
        if (isFile) {
          level.push({ type: 'file', name, path: file })
          continue
        }
        let folder = level.find(item => item.type === 'folder' && item.name === name)
        if (!folder) {
          folder = { type: 'folder', name, children: [] }
          level.push(folder)
        }
        level = folder.children
      }
    }
    sortMarkdownTree(root)
    return root
  }

  function sortMarkdownTree (nodes) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name, 'zh-Hans-CN')
    })
    for (const node of nodes) {
      if (node.type === 'folder') sortMarkdownTree(node.children)
    }
  }

  function renderMarkdownTree (nodes, parent, depth) {
    for (const node of nodes) {
      if (node.type === 'folder') {
        const folder = document.createElement('details')
        folder.className = 'mt-markdown-folder'
        folder.open = true

        const summary = document.createElement('summary')
        summary.className = 'mt-markdown-folder-title'
        summary.textContent = node.name
        summary.title = node.name
        summary.style.paddingLeft = (6 + depth * 12) + 'px'

        folder.appendChild(summary)
        renderMarkdownTree(node.children, folder, depth + 1)
        parent.appendChild(folder)
      } else {
        const item = document.createElement('button')
        item.type = 'button'
        item.className = 'mt-markdown-file'
        item.title = node.path
        item.textContent = node.name
        item.style.paddingLeft = (14 + depth * 12) + 'px'
        item.addEventListener('click', event => {
          event.preventDefault()
          event.stopPropagation()
          openFile(node.path)
        })
        parent.appendChild(item)
      }
    }
  }

  function installStyle () {
    if (document.getElementById(marker + '-style')) return
    const style = document.createElement('style')
    style.id = marker + '-style'
    style.textContent = \`
      .mt-add-directory,
      .mt-switch-directory {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        height: 24px;
        padding: 0 8px;
        margin-left: 6px;
        border: 1px solid rgba(154, 118, 27, .24);
        border-radius: 6px;
        background: rgba(255, 255, 255, .32);
        color: rgba(76, 59, 18, .78);
        font: 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
        white-space: nowrap;
      }
      .mt-add-directory:hover,
      .mt-switch-directory:hover {
        background: rgba(154, 118, 27, .12);
        color: rgba(76, 59, 18, .92);
      }
      .mt-directory-browser {
        padding: 4px 8px 10px 8px;
        border-bottom: 1px solid rgba(154, 118, 27, .12);
      }
      .project-tree > .title {
        font-size: 0 !important;
      }
      .project-tree > .tree-wrapper {
        display: none !important;
      }
      .mt-workspace-section {
        margin: 5px 0 8px;
      }
      .mt-workspace-header {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 24px;
        padding: 0 2px;
        border-radius: 6px;
        cursor: pointer;
        list-style: none;
      }
      .mt-workspace-header::-webkit-details-marker {
        display: none;
      }
      .mt-workspace-header::before,
      .mt-markdown-folder-title::before {
        content: '';
        display: inline-block;
        width: 0;
        height: 0;
        margin: 0 4px 0 2px;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-left: 5px solid var(--sideBarTextColor);
        transform: rotate(90deg);
        transform-origin: center;
      }
      .mt-workspace-section:not([open]) > .mt-workspace-header::before,
      .mt-markdown-folder:not([open]) > .mt-markdown-folder-title::before {
        transform: rotate(0deg);
      }
      .mt-workspace-header:hover {
        background: rgba(154, 118, 27, .1);
      }
      .mt-workspace-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: 0;
        background: transparent;
        color: var(--sideBarTitleColor);
        text-align: left;
        font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .mt-workspace-remove,
      .mt-workspace-refresh,
      .mt-workspace-switch {
        min-width: 30px;
        height: 18px;
        padding: 0 5px;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: var(--sideBarTextColor);
        cursor: pointer;
        font: 11px/18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .mt-workspace-remove:hover,
      .mt-workspace-refresh:hover,
      .mt-workspace-switch:hover {
        background: rgba(154, 118, 27, .14);
        color: var(--sideBarTitleColor);
      }
      .mt-markdown-file-list {
        margin-top: 2px;
      }
      .mt-markdown-folder {
        margin: 1px 0;
      }
      .mt-markdown-folder-title {
        display: block;
        min-height: 24px;
        padding: 3px 6px;
        border-radius: 6px;
        color: var(--sideBarColor);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font: 12px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
        list-style: none;
      }
      .mt-markdown-folder-title::-webkit-details-marker {
        display: none;
      }
      .mt-markdown-folder-title:hover {
        background: rgba(154, 118, 27, .1);
        color: var(--sideBarTitleColor);
      }
      .mt-markdown-file {
        display: block;
        width: 100%;
        min-height: 24px;
        padding: 3px 6px 3px 14px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--sideBarColor);
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font: 12px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
      }
      .mt-markdown-file:hover {
        background: rgba(154, 118, 27, .1);
        color: var(--sideBarTitleColor);
      }
      .mt-workspace-empty {
        padding: 4px 6px 4px 14px;
        color: var(--sideBarTextColor);
        font: 12px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
    \`
    document.head.appendChild(style)
  }

  function installButtons () {
    document.querySelectorAll('.project-tree > .title').forEach(title => {
      title.querySelectorAll('.mt-switch-directory').forEach(button => button.remove())
      if (!title.querySelector('.mt-add-directory')) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'mt-add-directory'
        button.textContent = '添加目录'
        button.addEventListener('click', event => {
          event.preventDefault()
          event.stopPropagation()
          const api = electron()
          if (api && api.ipcRenderer) api.ipcRenderer.send('mt::workspace-add-directory')
        })
        title.appendChild(button)
      }
    })
  }

  function renderDirectoryBrowser () {
    document.querySelectorAll('.project-tree').forEach(tree => {
      const title = tree.querySelector(':scope > .title') || tree.querySelector('.title')
      if (!title) return
      let panel = tree.querySelector(':scope > .mt-directory-browser')
      if (!panel) {
        panel = document.createElement('div')
        panel.className = 'mt-directory-browser'
        title.insertAdjacentElement('afterend', panel)
      }

      const directories = loadDirectories()
      const openStates = loadOpenStates()
      const state = JSON.stringify({ directories, currentDirectory, openStates, forceRenderVersion })
      if (panel.dataset.mtDirectoryState === state) return
      panel.dataset.mtDirectoryState = state
      panel.innerHTML = ''

      for (const dir of directories) {
        const section = document.createElement('details')
        section.className = 'mt-workspace-section'
        section.open = openStates[dir] !== false
        if (dir === currentDirectory) section.classList.add('active')
        section.addEventListener('toggle', () => saveOpenState(dir, section.open))

        const header = document.createElement('summary')
        header.className = 'mt-workspace-header'

        const name = document.createElement('span')
        name.className = 'mt-workspace-name'
        name.title = dir
        name.textContent = basename(dir)

        const switchButton = document.createElement('button')
        switchButton.type = 'button'
        switchButton.className = 'mt-workspace-switch'
        switchButton.title = '切换到这个目录'
        switchButton.textContent = '切换'
        switchButton.addEventListener('click', event => {
          event.preventDefault()
          event.stopPropagation()
          openDirectory(dir)
        })

        const refresh = document.createElement('button')
        refresh.type = 'button'
        refresh.className = 'mt-workspace-refresh'
        refresh.title = '刷新'
        refresh.textContent = '刷新'
        refresh.addEventListener('click', event => {
          event.preventDefault()
          event.stopPropagation()
          forceRenderVersion++
          renderDirectoryBrowser()
        })

        const remove = document.createElement('button')
        remove.type = 'button'
        remove.className = 'mt-workspace-remove'
        remove.title = '移除'
        remove.textContent = '移除'
        remove.addEventListener('click', event => {
          event.preventDefault()
          event.stopPropagation()
          removeDirectory(dir)
        })

        header.appendChild(name)
        header.appendChild(switchButton)
        header.appendChild(refresh)
        header.appendChild(remove)
        section.appendChild(header)

        const list = document.createElement('div')
        list.className = 'mt-markdown-file-list'
        const files = listMarkdownFiles(dir)
        if (!files.length) {
          const empty = document.createElement('div')
          empty.className = 'mt-workspace-empty'
          empty.textContent = '没有 Markdown'
          list.appendChild(empty)
        } else {
          renderMarkdownTree(buildMarkdownTree(dir, files), list, 0)
        }
        section.appendChild(list)
        panel.appendChild(section)
      }
    })
  }

  function init () {
    installStyle()
    installButtons()
    renderDirectoryBrowser()
  }

  function scheduleInit () {
    if (pendingInit) return
    pendingInit = true
    requestAnimationFrame(() => {
      pendingInit = false
      init()
    })
  }

  const api = electron()
  if (api && api.ipcRenderer) {
    api.ipcRenderer.on('mt::workspace-directory-added', (event, dir) => rememberDirectory(dir))
    api.ipcRenderer.on('mt::open-directory', (event, dir) => {
      currentDirectory = dir || currentDirectory
      if (currentDirectory) rememberDirectory(currentDirectory)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
  new MutationObserver(scheduleInit).observe(document.documentElement, { childList: true, subtree: true })
})()
`

const obsidianBlock = `
;(() => {
  const marker = 'MARKTEXT_OBSIDIAN_WORKSPACE_PATCH_20260424'
  let pendingInit = false
  let pendingScrollReset = false

  const editorScrollSelectors = [
    '.editor-middle',
    '.editor-middle > .editor',
    '.editor',
    '.source-code',
    '.muya',
    '.muya-container',
    '#ag-editor-id',
    '.CodeMirror-scroll'
  ]

  const tabScrollSelectors = [
    '.editor-tabs',
    '.tab-bar',
    '.tabs-container'
  ]

  function installStyle () {
    if (document.getElementById(marker + '-style')) return
    const style = document.createElement('style')
    style.id = marker + '-style'
    style.textContent = \`
      html,
      body,
      #app {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        background: var(--editorBgColor) !important;
        border: 0 !important;
        box-shadow: none !important;
      }
      body,
      .side-bar,
      .title-bar,
      .editor-tabs,
      .tab-bar,
      .tabs-container,
      .project-tree,
      .opened-files {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif !important;
        letter-spacing: 0 !important;
      }
      #ag-editor-id,
      #ag-editor-id *,
      .editor,
      .editor *,
      .muya,
      .muya *,
      .ag-root,
      .ag-root *,
      .ag-paragraph,
      .ag-paragraph * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif !important;
        letter-spacing: 0 !important;
        -webkit-font-smoothing: antialiased;
      }
      pre,
      code,
      pre *,
      code *,
      .CodeMirror,
      .CodeMirror * {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
      }
      #ag-editor-id h1,
      #ag-editor-id h2,
      #ag-editor-id h3,
      #ag-editor-id h4 {
        font-weight: 650 !important;
        letter-spacing: 0 !important;
        color: rgba(54, 47, 31, .9) !important;
      }
      .title-bar,
      .title-bar-editor-bg,
      .editor-tabs,
      .tab-bar,
      .tabs-container,
      .editor-with-tabs,
      .side-bar {
        border-color: rgba(154, 118, 27, .16) !important;
        box-shadow: none !important;
        outline: 0 !important;
      }
      .side-bar {
        border-right: 1px solid rgba(154, 118, 27, .16) !important;
      }
      .editor-tabs,
      .tab-bar,
      .tabs-container {
        border-bottom: 1px solid rgba(154, 118, 27, .14) !important;
      }
      .editor-with-tabs,
      .editor-with-tabs > .container,
      .editor-container {
        height: 100% !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }
      .editor-middle {
        height: 100% !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      .editor-middle > .editor,
      .source-code {
        height: 100% !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        max-width: 100% !important;
      }
      .editor,
      .muya,
      .muya-container,
      #ag-editor-id,
      .CodeMirror-scroll {
        max-width: 100% !important;
        overflow-x: hidden !important;
      }
      .editor-tabs,
      .tab-bar,
      .tabs-container {
        max-width: 100% !important;
        min-width: 0 !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        overscroll-behavior-x: contain !important;
      }
      .editor-tabs::-webkit-scrollbar,
      .tab-bar::-webkit-scrollbar,
      .tabs-container::-webkit-scrollbar {
        height: 0 !important;
      }
    \`
    document.head.appendChild(style)
  }

  function closestMatch (target, selectors) {
    const el = target && target.closest ? target.closest(selectors.join(',')) : null
    return el || null
  }

  function resetEditorHorizontalScroll () {
    if (pendingScrollReset) return
    pendingScrollReset = true
    requestAnimationFrame(() => {
      pendingScrollReset = false
      document.querySelectorAll(editorScrollSelectors.join(',')).forEach(el => {
        if (el.scrollLeft) el.scrollLeft = 0
      })
    })
  }

  function handleWheel (event) {
    const absX = Math.abs(event.deltaX || 0)
    const absY = Math.abs(event.deltaY || 0)
    if (absX <= absY || absX < 1) return

    const tabScroller = closestMatch(event.target, tabScrollSelectors)
    if (tabScroller) {
      tabScroller.scrollLeft += event.deltaX
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (closestMatch(event.target, editorScrollSelectors)) {
      resetEditorHorizontalScroll()
      event.preventDefault()
      event.stopPropagation()
    }
  }

  function relayoutForResize () {
    document.querySelectorAll(editorScrollSelectors.join(',')).forEach(el => {
      const top = el.scrollTop
      el.style.webkitTransform = 'translateZ(0)'
      el.scrollTop = top
      if (el.scrollLeft) el.scrollLeft = 0
    })
  }

  function init () {
    installStyle()
    document.removeEventListener('wheel', handleWheel, true)
    document.addEventListener('wheel', handleWheel, { capture: true, passive: false })
    resetEditorHorizontalScroll()
  }

  function scheduleInit () {
    if (pendingInit) return
    pendingInit = true
    requestAnimationFrame(() => {
      pendingInit = false
      init()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
  window.addEventListener('resize', () => requestAnimationFrame(relayoutForResize), { passive: true })
  new MutationObserver(scheduleInit).observe(document.documentElement, { childList: true, subtree: true })
})()
`

text = replaceBlock(text, 'MARKTEXT_EYE_THEME_PATCH_20260424', 'MARKTEXT_WORKFLOW_PATCH_20260424', eyeBlock)
text = replaceBlock(text, 'MARKTEXT_OBSIDIAN_WORKSPACE_PATCH_20260424', 'MARKTEXT_ADD_DIRECTORY_PATCH_20260424', obsidianBlock)
text = replaceBlock(text, 'MARKTEXT_ADD_DIRECTORY_PATCH_20260424', null, directoryBlock)

fs.writeFileSync(file, text)
