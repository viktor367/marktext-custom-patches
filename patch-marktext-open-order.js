const fs = require('fs')

const file = process.argv[2]
let text = fs.readFileSync(file, 'utf8')

const replacements = [
  [
    'setTimeout((()=>{e&&this.openFolder(e),n.length&&this.openTabsFromPaths(n)}),0),C}',
    'setTimeout((()=>{n.length&&this.openTabsFromPaths(n),e&&setTimeout((()=>this.openFolder(e)),300)}),0),C}'
  ],
  [
    'r&&(r.openFolder(t().dirname(n)),r.openTab(n,{},!0))',
    'r&&(r.openTab(n,{},!0),setTimeout((()=>r.openFolder(t().dirname(n))),300))'
  ],
  [
    'n&&(r[0]&&n.openFolder(t().dirname(r[0])),n.openTabsFromPaths(r))',
    'n&&(n.openTabsFromPaths(r),r[0]&&setTimeout((()=>n.openFolder(t().dirname(r[0]))),300))'
  ],
  [
    'e&&(e.openFolder(t().dirname(o)),e.openTab(o,{},!0))',
    'e&&(e.openTab(o,{},!0),setTimeout((()=>e.openFolder(t().dirname(o))),300))'
  ]
]

for (const [from, to] of replacements) {
  if (!text.includes(from)) {
    throw new Error(`Missing expected snippet: ${from}`)
  }
  text = text.replace(from, to)
}

fs.writeFileSync(file, text)
