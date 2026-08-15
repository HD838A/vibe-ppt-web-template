import { readFile, writeFile, copyFile } from 'node:fs/promises'
import { access } from 'node:fs/promises'
import path from 'node:path'

const TYPES = new Set(['cover', 'profile', 'gallery', 'chapter', 'pipeline', 'stat', 'flow', 'roadmap', 'reviews', 'skills', 'closing', 'outro'])
const THEMES = new Set(['default', 'apple', 'dopamine', 'cyberpunk'])
const IMAGE_RE = /^\/(?:placeholder(?:-avatar|-qr)?\.svg|assets\/[^\s]+)$/

const scalar = (value) => {
  const text = value.trim()
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1)
  if (text === 'true') return true
  if (text === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text)
  return text
}

function parseFrontmatter(lines) {
  const result = { speaker: {} }
  let current = null
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const match = line.match(/^(\s*)([\w-]+):\s*(.*)$/)
    if (!match) throw new Error(`frontmatter 格式错误：${line}`)
    const [, indent, key, raw] = match
    if (indent.length && current) result[current][key] = scalar(raw)
    else if (!raw && key === 'speaker') current = key
    else { current = null; result[key] = scalar(raw) }
  }
  return result
}

function parseList(lines, start) {
  const values = []
  let index = start
  while (index < lines.length && /^\s*-\s+/.test(lines[index])) {
    values.push(lines[index].replace(/^\s*-\s+/, '').trim())
    index += 1
  }
  return { values, index }
}

function parseSlide(lines, type, id, index) {
  const slide = { id, type, theme: 'paper' }
  let currentSection = null
  let i = index
  for (; i < lines.length;) {
    const line = lines[i]
    if (/^#\s+/.test(line)) break
    if (!line.trim()) { i += 1; continue }
    const sub = line.match(/^##\s+([\w-]+)/)
    if (sub) { currentSection = sub[1]; i += 1; const parsed = parseList(lines, i); i = parsed.index; slide[currentSection] = parsed.values; continue }
    const field = line.match(/^([\w-]+):\s*(.*)$/)
    if (!field) throw new Error(`slide ${id} 格式错误：${line}`)
    const [, key, raw] = field
    if (!raw && (key === 'title' || key === 'titleLines')) {
      const parsed = parseList(lines, i + 1); slide.titleLines = parsed.values; i = parsed.index; continue
    }
    slide[key] = scalar(raw); i += 1
  }
  if (!TYPES.has(type)) throw new Error(`不支持的 slide type：${type}`)
  if (type === 'cover' && !slide.titleLines && slide.title) slide.titleLines = [slide.title]
  for (const [key, value] of Object.entries(slide)) if (['image', 'qr'].includes(key) && value && !IMAGE_RE.test(value)) throw new Error(`${id}.${key} 只允许 /placeholder*.svg 或 /assets/... 图片路径`)
  if (Array.isArray(slide.items)) slide.items = slide.items.map((item) => { const [title, description, image] = item.split('|').map((part) => part.trim()); return { title, description, image: image || '/placeholder.svg' } })
  if (Array.isArray(slide.facts)) slide.facts = slide.facts.map((item) => { const [label, value] = item.split('|').map((part) => part.trim()); return { label, value } })
  if (Array.isArray(slide.steps)) slide.steps = slide.steps.map((item, n) => { const [a, b, c] = item.split('|').map((part) => part.trim()); return type === 'roadmap' ? { number: String(n + 1).padStart(2, '0'), title: a, description: b || '' } : { label: a, title: b || a, description: c || '' } })
  if (Array.isArray(slide.loop)) slide.loop = slide.loop.map((item) => item.trim())
  if (Array.isArray(slide.statements)) slide.statements = slide.statements.map((item, n) => { const [title, body] = item.split('|').map((part) => part.trim()); return { number: String(n + 1).padStart(2, '0'), title, body: body || '' } })
  if (Array.isArray(slide.reviews)) slide.reviews = slide.reviews.map((item) => { const [name, text, avatar] = item.split('|').map((part) => part.trim()); return { name, text, avatar: avatar || '/placeholder-avatar.svg' } })
  if (Array.isArray(slide.items) && type === 'skills') slide.items = slide.items.map((item) => { const [level, title, description] = item.split('|').map((part) => part.trim()); return { level, title, description } })
  return { slide, nextIndex: i }
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let index = 0; const frontmatter = {}
  if (lines[0] === '---') { const end = lines.indexOf('---', 1); if (end < 0) throw new Error('frontmatter 缺少结束的 ---'); Object.assign(frontmatter, parseFrontmatter(lines.slice(1, end))); index = end + 1 }
  const slides = []
  while (index < lines.length) {
    if (!lines[index].trim()) { index += 1; continue }
    const heading = lines[index].match(/^#\s+(\w+)(?:\s+(.+))?$/)
    if (!heading) throw new Error(`需要使用 # type 划分 slide：${lines[index]}`)
    const type = heading[1]; const id = heading[2]?.trim() || `${type}-${slides.length + 1}`
    const parsed = parseSlide(lines, type, id, index + 1); slides.push(parsed.slide); index = parsed.nextIndex
  }
  if (!slides.length) throw new Error('Markdown 至少需要一个 slide')
  const theme = THEMES.has(frontmatter.theme) ? frontmatter.theme : 'default'
  if (frontmatter.theme && !THEMES.has(frontmatter.theme)) console.warn(`警告：未知主题 ${frontmatter.theme}，已回退 default`)
  return { theme, title: frontmatter.title || '你的主题标题', subtitle: frontmatter.subtitle || '', speaker: frontmatter.speaker || {}, slides }
}

const input = process.argv[2]
if (!input) { console.error('用法：npm run import:markdown -- <markdown 文件>'); process.exit(1) }
const root = process.cwd(); const source = path.resolve(root, input); const target = path.join(root, 'src/content.js')
const backup = path.join('/tmp', `content-${Date.now()}.js`)
await access(source)
await copyFile(target, backup)
const deck = parseMarkdown(await readFile(source, 'utf8'))
const output = `// Generated by scripts/markdown-to-content.mjs\nexport const deck = ${JSON.stringify(deck, null, 2)}\n`
await writeFile(target, output)
console.log(`已生成 ${path.relative(root, target)}（备份：${backup}）`)
