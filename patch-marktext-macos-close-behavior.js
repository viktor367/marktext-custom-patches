const fs = require('fs')

const file = process.argv[2]
let text = fs.readFileSync(file, 'utf8')

const marker = 'MARKTEXT_MACOS_CLOSE_BEHAVIOR_PATCH_20260424'
const sessionMarker = 'MARKTEXT_MAIN_SESSION_RESTORE_PATCH_20260424'

function replaceOnce (from, to) {
  if (text.includes(to)) return
  if (!text.includes(from)) {
    throw new Error(`Missing expected snippet: ${from}`)
  }
  text = text.replace(from, to)
}

function removeSessionRestorePatch () {
  text = text.replace(
    'global.__MARKTEXT_SESSION_RESTORE__&&global.__MARKTEXT_SESSION_RESTORE__.restore(this,t)|| (t.length?this._openFilesToOpen():this._createEditorWindow())',
    't.length?this._openFilesToOpen():this._createEditorWindow()'
  )
  text = text.replace(/,global\.__MARKTEXT_SESSION_RESTORE__&&global\.__MARKTEXT_SESSION_RESTORE__\.saveWindow\(this\)/g, '')

  const startMarker = `;/* ${sessionMarker} start */`
  const endMarker = `;/* ${sessionMarker} end */`
  const start = text.indexOf(startMarker)
  if (start !== -1) {
    const end = text.indexOf(endMarker, start)
    if (end === -1) throw new Error(`Missing end marker for ${sessionMarker}`)
    text = text.slice(0, start) + text.slice(end + endMarker.length)
  }
}

removeSessionRestorePatch()

replaceOnce(
  'C.on("close",(e=>{this.emit("window-close"),e.preventDefault(),C.webContents.send("mt::ask-for-close")}))',
  'C.on("close",(e=>{if(global.__MARKTEXT_MACOS_CLOSE_BEHAVIOR__&&global.__MARKTEXT_MACOS_CLOSE_BEHAVIOR__.hideInsteadOfClose(e,C))return;this.emit("window-close"),e.preventDefault(),C.webContents.send("mt::ask-for-close")}))'
)

replaceOnce(
  'i.app.on("activate",(()=>{0===this._windowManager.windowCount&&this.ready()}))',
  'i.app.on("activate",(()=>{if(global.__MARKTEXT_MACOS_CLOSE_BEHAVIOR__&&global.__MARKTEXT_MACOS_CLOSE_BEHAVIOR__.showHiddenWindow(this._windowManager))return;0===this._windowManager.windowCount&&this.ready()}))'
)

const block = `
;/* ${marker} start */
(() => {
  const { app } = require('electron')
  let quitting = false
  let resetTimer = null

  function markQuitting () {
    quitting = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      quitting = false
      resetTimer = null
    }, 15000)
  }

  app.on('before-quit', markQuitting)
  app.on('will-quit', () => {
    quitting = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = null
  })

  function findWindowToShow (windowManager) {
    if (!windowManager) return null
    const active = typeof windowManager.getActiveWindow === 'function' ? windowManager.getActiveWindow() : null
    if (active && active.browserWindow && !active.browserWindow.isDestroyed()) return active
    const windows = windowManager._windows && typeof windowManager._windows.values === 'function'
      ? Array.from(windowManager._windows.values())
      : []
    return windows.find(win => win && win.browserWindow && !win.browserWindow.isDestroyed()) || null
  }

  global.__MARKTEXT_MACOS_CLOSE_BEHAVIOR__ = {
    hideInsteadOfClose (event, browserWindow) {
      if (process.platform !== 'darwin' || quitting || !browserWindow || browserWindow.isDestroyed()) return false
      event.preventDefault()
      browserWindow.hide()
      return true
    },
    showHiddenWindow (windowManager) {
      if (process.platform !== 'darwin') return false
      const win = findWindowToShow(windowManager)
      if (!win) return false
      try {
        if (typeof win.bringToFront === 'function') win.bringToFront()
        else {
          win.browserWindow.show()
          win.browserWindow.focus()
        }
      } catch (e) {
        return false
      }
      return true
    }
  }
})()
;/* ${marker} end */
`

const startMarker = `;/* ${marker} start */`
const endMarker = `;/* ${marker} end */`
const start = text.indexOf(startMarker)
if (start === -1) {
  if (!text.endsWith('\n')) text += '\n'
  text += block
} else {
  const end = text.indexOf(endMarker, start)
  if (end === -1) throw new Error(`Missing end marker for ${marker}`)
  text = text.slice(0, start) + block.trimStart().trimEnd() + text.slice(end + endMarker.length)
}

fs.writeFileSync(file, text)
