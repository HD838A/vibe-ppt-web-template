import fs from 'node:fs/promises'
import { deck } from '../src/content.js'

const supportedTypes = new Set(['cover', 'profile', 'gallery', 'chapter', 'pipeline', 'stat', 'flow', 'roadmap', 'reviews', 'skills', 'closing', 'outro'])
const contentSource = await fs.readFile(new URL('../src/content.js', import.meta.url), 'utf8')

if (!Array.isArray(deck.slides) || deck.slides.length < 3) throw new Error('deck.slides 至少需要 3 页。')
for (const slide of deck.slides) {
  if (!slide.id || !slide.type) throw new Error('每一页都必须有 id 和 type。')
  if (!supportedTypes.has(slide.type)) throw new Error(`不支持的版式：${slide.type}`)
}

if (/data:image\//i.test(contentSource)) throw new Error('请不要把图片以内嵌 Base64 放进内容文件。')
if (/REFERENCE_BRAND_TERMS/i.test(contentSource)) throw new Error('内容文件仍包含参考项目的个人或品牌信息。')
if (/https?:\/\//i.test(contentSource)) throw new Error('内容文件不应依赖远程链接；请把素材放进 public/assets。')

console.log(`✓ 内容校验通过：${deck.slides.length} 页，${supportedTypes.size} 种可用版式。`)

