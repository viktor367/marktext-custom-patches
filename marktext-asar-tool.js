const fs = require('fs')
const path = require('path')

function readArchive (archivePath) {
  const buffer = fs.readFileSync(archivePath)
  const headerPayloadSize = buffer.readUInt32LE(4)
  const headerJsonSize = buffer.readUInt32LE(12)
  const headerJson = buffer.slice(16, 16 + headerJsonSize).toString('utf8')
  const header = JSON.parse(headerJson)
  const dataOffset = 8 + headerPayloadSize
  return { buffer, header, dataOffset }
}
function walk (node, prefix = '', out = []) {
  if (!node.files) return out
  for (const [name, child] of Object.entries(node.files)) {
    const p = prefix ? `${prefix}/${name}` : name
    out.push(p)
    walk(child, p, out)
  }
  return out
}
function findNode (header, filePath) {
  let node = header
  for (const part of filePath.split('/').filter(Boolean)) {
    if (!node.files || !node.files[part]) return null
    node = node.files[part]
  }
  return node
}
function extractFile (archivePath, filePath, outPath) {
  const { buffer, header, dataOffset } = readArchive(archivePath)
  const node = findNode(header, filePath)
  if (!node || !node.size || node.unpacked) throw new Error(`Cannot extract ${filePath}`)
  const start = dataOffset + Number(node.offset)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, buffer.slice(start, start + Number(node.size)))
}
function serializeHeader (header) {
  const jsonBuffer = Buffer.from(JSON.stringify(header))
  const padding = (4 - ((8 + jsonBuffer.length) % 4)) % 4
  const payload = Buffer.alloc(8 + jsonBuffer.length + padding)
  payload.writeUInt32LE(4 + jsonBuffer.length + padding, 0)
  payload.writeUInt32LE(jsonBuffer.length, 4)
  jsonBuffer.copy(payload, 8)
  return payload
}
function replaceFiles (archivePath, outPath, replacements) {
  const { buffer, header, dataOffset } = readArchive(archivePath)
  const entries = []
  for (const filePath of walk(header)) {
    const node = findNode(header, filePath)
    if (node && node.size && !node.unpacked) {
      const replacement = replacements.get(filePath)
      const data = replacement
        ? fs.readFileSync(replacement)
        : buffer.slice(dataOffset + Number(node.offset), dataOffset + Number(node.offset) + Number(node.size))
      entries.push({ node, data })
    }
  }
  let offset = 0
  for (const entry of entries) {
    entry.node.offset = String(offset)
    entry.node.size = entry.data.length
    offset += entry.data.length
  }
  const headerPayload = serializeHeader(header)
  const prefix = Buffer.alloc(8)
  prefix.writeUInt32LE(4, 0)
  prefix.writeUInt32LE(headerPayload.length, 4)
  fs.writeFileSync(outPath, Buffer.concat([prefix, headerPayload, ...entries.map(e => e.data)]))
}
const [cmd, archivePath, arg1, ...rest] = process.argv.slice(2)
if (cmd === 'extract') extractFile(archivePath, arg1, rest[0])
else if (cmd === 'replace') replaceFiles(archivePath, arg1, new Map(rest.map(pair => {
  const index = pair.indexOf('=')
  if (index === -1) throw new Error(`Invalid replacement ${pair}`)
  return [pair.slice(0, index), pair.slice(index + 1)]
})))
else process.exit(1)
