const fs = require('fs')

const file = process.argv[2]
let text = fs.readFileSync(file, 'utf8')

if (!text.includes('mt::detach-tab-to-new-window')) {
  const from = 'i.ipcMain.on("mt::open-file-by-window-id",((e,n,r)=>{const o=se(r);if(this._accessor.preferences.getItem("openFilesInNewWindow"))this._createEditorWindow(t().dirname(o),[o]);else{const e=this._windowManager.get(n);e&&(e.openTab(o,{},!0),setTimeout((()=>e.openFolder(t().dirname(o))),300))}})),i.ipcMain.on("mt::select-default-directory-to-open"'
  const to = 'i.ipcMain.on("mt::open-file-by-window-id",((e,n,r)=>{const o=se(r);if(this._accessor.preferences.getItem("openFilesInNewWindow"))this._createEditorWindow(t().dirname(o),[o]);else{const e=this._windowManager.get(n);e&&(e.openTab(o,{},!0),setTimeout((()=>e.openFolder(t().dirname(o))),300))}})),i.ipcMain.handle("mt::detach-tab-to-new-window",(async(e,n)=>{const r=se(n&&n.pathname||"");if(!g(r))return!1;const o=i.BrowserWindow.fromWebContents(e.sender),s=o&&this._windowManager.get(o.id),a=s&&s.openedRootDirectory?s.openedRootDirectory:t().dirname(r),l=this._createEditorWindow(a,[r]);try{const e=n&&n.screenX,t=n&&n.screenY;if(l&&l.browserWindow&&Number.isFinite(e)&&Number.isFinite(t)){const n=l.browserWindow.getBounds();l.browserWindow.setPosition(Math.max(0,Math.round(e-Math.min(160,n.width/2))),Math.max(0,Math.round(t-24)))}}catch(e){}return!0})),i.ipcMain.on("mt::select-default-directory-to-open"'
  if (!text.includes(from)) {
    throw new Error('Missing expected mt::open-file-by-window-id snippet')
  }
  text = text.replace(from, to)
}

fs.writeFileSync(file, text)
