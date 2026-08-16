import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

const themes = ['default', 'apple', 'dopamine', 'cyberpunk']
const outputRoot = path.join(os.tmpdir(), 'vibe-ppt-layout-qa')

const getFreePort = () => new Promise((resolve, reject) => {
  const server = net.createServer()
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    server.close(() => resolve(port))
  })
})

const waitForServer = async (url, processHandle) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (processHandle.exitCode !== null) throw new Error(`Vite 提前退出，状态码 ${processHandle.exitCode}`)
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`等待本地预览超时：${url}`)
}

const settleMotion = async (page) => page.evaluate(() => {
  for (const animation of document.getAnimations()) {
    const timing = animation.effect?.getComputedTiming()
    if (Number.isFinite(timing?.endTime)) animation.finish()
  }
})

const auditVisibleSlide = async (page) => page.evaluate(() => {
  const frame = document.querySelector('.slide-frame:not(.slide-frame--hidden)')
  const slide = frame?.querySelector('.slide')
  if (!frame || !slide) return { fatal: '没有找到当前幻灯片' }

  const isVisible = (element) => {
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 1 && rect.height > 1
  }
  const label = (element) => `${element.tagName.toLowerCase()}.${typeof element.className === 'string' ? element.className : ''} ${(element.innerText || element.alt || '').replace(/\s+/g, ' ').trim().slice(0, 48)}`.trim()
  const intersects = (first, second, tolerance) => {
    const a = first.getBoundingClientRect()
    const b = second.getBoundingClientRect()
    return Math.min(a.right, b.right) - Math.max(a.left, b.left) > tolerance
      && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > tolerance
  }
  const parseColor = (value) => {
    const match = value.match(/rgba?\((\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)(?:[, /]+(\d*\.?\d+))?\)/)
    return match ? { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] === undefined ? 1 : Number(match[4]) } : null
  }
  const composite = (front, back) => ({
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a),
    a: 1,
  })
  const luminance = ({ r, g, b }) => {
    const channel = (value) => {
      const normalized = value / 255
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const contrast = (first, second) => {
    const a = luminance(first)
    const b = luminance(second)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  }
  const effectiveBackground = (element) => {
    const chain = []
    for (let current = element.parentElement; current; current = current.parentElement) chain.push(current)
    let background = { r: 255, g: 255, b: 255, a: 1 }
    for (const current of chain.reverse()) {
      const style = getComputedStyle(current)
      if (style.backgroundImage !== 'none') return null
      const color = parseColor(style.backgroundColor)
      if (color && color.a > 0) background = composite(color, background)
    }
    return background
  }

  const slideRect = slide.getBoundingClientRect()
  const textElements = [...slide.querySelectorAll('h1,h2,h3,p,span,strong,small')]
    .filter(isVisible)
    .filter((element) => element.innerText.trim())
    .filter((element) => ![...element.children].some((child) => child.matches('h1,h2,h3,p,span,strong,small')))
  const contentElements = [...slide.querySelectorAll('h1,h2,h3,p,.fact,.gallery-item,.pipeline-step,.flow-step,.reviews-stats > div,.review-wall > article,img:not(.slide-background),.qr')].filter(isVisible)
  const images = [...slide.querySelectorAll('img:not(.slide-background)')].filter(isVisible)

  const outside = contentElements.filter((element) => {
    const rect = element.getBoundingClientRect()
    return rect.left < slideRect.left - 2 || rect.top < slideRect.top - 2 || rect.right > slideRect.right + 2 || rect.bottom > slideRect.bottom + 2
  }).map(label)
  const clipped = contentElements.filter((element) => {
    if (element.tagName === 'IMG') return false
    const style = getComputedStyle(element)
    const clipsX = !['visible', 'clip'].includes(style.overflowX)
    const clipsY = !['visible', 'clip'].includes(style.overflowY)
    return (clipsX && element.scrollWidth > element.clientWidth + 3) || (clipsY && element.scrollHeight > element.clientHeight + 3)
  }).map(label)
  const missingImages = [...slide.querySelectorAll('img')]
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.getAttribute('src'))

  const textImageOverlap = []
  for (const text of textElements) {
    for (const image of images) {
      if (!text.contains(image) && !image.contains(text) && intersects(text, image, 3)) textImageOverlap.push(`${label(text)} ↔ ${label(image)}`)
    }
  }
  const contentOverlap = []
  for (let firstIndex = 0; firstIndex < textElements.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < textElements.length; secondIndex += 1) {
      const first = textElements[firstIndex]
      const second = textElements[secondIndex]
      if (first.contains(second) || second.contains(first)) continue
      if (intersects(first, second, 10)) contentOverlap.push(`${label(first)} ↔ ${label(second)}`)
    }
  }

  const lowContrast = []
  for (const element of textElements) {
    if (element.closest('.slide-foot')) continue
    const background = effectiveBackground(element)
    const foreground = parseColor(getComputedStyle(element).color)
    if (!background || !foreground) continue
    const renderedForeground = composite(foreground, background)
    const style = getComputedStyle(element)
    const fontSize = Number.parseFloat(style.fontSize)
    const fontWeight = Number.parseInt(style.fontWeight, 10) || 400
    const large = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700)
    const ratio = contrast(renderedForeground, background)
    if (ratio + 0.01 < (large ? 3 : 4.5)) lowContrast.push(`${label(element)} (${ratio.toFixed(2)}:1)`)
  }

  return {
    frame: [Math.round(slideRect.width), Math.round(slideRect.height)],
    ratio: Number((slideRect.width / slideRect.height).toFixed(4)),
    outside,
    clipped,
    missingImages,
    textImageOverlap,
    contentOverlap,
    lowContrast,
  }
})

const auditProfileSurfaceContract = async (page) => page.evaluate(() => {
  const frame = document.querySelector('.slide-frame:not(.slide-frame--hidden)')
  const slide = frame?.querySelector('.slide--profile')
  const heading = slide?.querySelector('h2')
  if (!frame || !slide || !heading) return []
  const original = frame.className
  const failures = []
  const parse = (value) => value.match(/\d+(?:\.\d+)?/g)?.map(Number)
  const lum = (values) => values.slice(0, 3).map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
  for (const surface of ['dark', 'paper', 'split']) {
    frame.className = `slide-frame slide-frame--${surface}`
    const foreground = parse(getComputedStyle(heading).color)
    const background = parse(getComputedStyle(slide).backgroundColor)
    const first = lum(foreground)
    const second = lum(background)
    const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    if (ratio < 3) failures.push(`${surface}: ${ratio.toFixed(2)}:1`)
  }
  frame.className = original
  return failures
})

const auditMotionContract = async (page) => page.evaluate(() => {
  const activeFrames = [...document.querySelectorAll('.slide-frame--active')]
  const active = activeFrames[0]
  if (!active) return ['没有活动页动画状态']
  const failures = []
  if (activeFrames.length !== 1) failures.push(`活动页数量应为 1，实际为 ${activeFrames.length}`)
  const transition = getComputedStyle(active)
  if (!transition.transitionProperty.split(',').map((value) => value.trim()).includes('opacity')) failures.push('活动页缺少 opacity 切换过渡')
  const hiddenDisplay = [...document.querySelectorAll('.slide-frame--hidden')].map((frame) => getComputedStyle(frame).display)
  if (hiddenDisplay.some((display) => display === 'none')) failures.push('非活动页被 display:none 移除，无法交叉淡出')
  const target = active.querySelector('.slide > :not(.slide-background):not(.cover-grid):not(.cover-orb):not(.chapter-glow)')
  if (!target || getComputedStyle(target).animationName === 'none') failures.push('活动页内容缺少入场动画')
  return failures
})

const auditPresentationViewport = async (page) => page.evaluate(() => {
  const frame = document.querySelector('.slide-frame--active')
  const slide = frame?.querySelector('.slide')
  if (!frame || !slide) return ['没有找到演讲模式活动页']
  const failures = []
  const tolerance = 1
  for (const [name, element] of [['frame', frame], ['slide', slide]]) {
    const rect = element.getBoundingClientRect()
    const gaps = {
      top: rect.top,
      right: innerWidth - rect.right,
      bottom: innerHeight - rect.bottom,
      left: rect.left,
    }
    for (const [edge, gap] of Object.entries(gaps)) {
      if (Math.abs(gap) > tolerance) failures.push(`${name}.${edge} 与视口相差 ${gap.toFixed(2)}px`)
    }
  }
  return failures
})

const port = await getFreePort()
const baseUrl = `http://127.0.0.1:${port}`
const viteBinary = path.resolve('node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite')
const vite = spawn(viteBinary, ['--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'ignore', 'pipe'] })
let viteError = ''
vite.stderr.on('data', (chunk) => { viteError += chunk.toString() })

let browser
const failures = []
try {
  await waitForServer(baseUrl, vite)
  await mkdir(outputRoot, { recursive: true })
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  for (const theme of themes) {
    const themeOutput = path.join(outputRoot, theme)
    await mkdir(themeOutput, { recursive: true })
    await page.goto(`${baseUrl}/?theme=${theme}`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '⛶ 演讲模式' }).click()
    await settleMotion(page)
    const total = await page.locator('.slide-frame').count()
    for (let pageIndex = 0; pageIndex < total; pageIndex += 1) {
      const audit = await auditVisibleSlide(page)
      const profileSurface = await auditProfileSurfaceContract(page)
      const motion = await auditMotionContract(page)
      const pageFailures = {
        fatal: audit.fatal ? [audit.fatal] : [],
        ratio: audit.ratio && Math.abs(audit.ratio - 16 / 9) > 0.01 ? [`${audit.ratio}`] : [],
        outside: audit.outside || [],
        clipped: audit.clipped || [],
        missingImages: audit.missingImages || [],
        textImageOverlap: audit.textImageOverlap || [],
        contentOverlap: audit.contentOverlap || [],
        lowContrast: audit.lowContrast || [],
        profileSurface,
        motion,
      }
      if (Object.values(pageFailures).some((items) => items.length)) failures.push({ theme, page: pageIndex + 1, ...pageFailures })
      await page.screenshot({ path: path.join(themeOutput, `${String(pageIndex + 1).padStart(2, '0')}.png`) })
      if (pageIndex < total - 1) {
        await page.keyboard.press('ArrowRight')
        await settleMotion(page)
      }
    }
    await page.keyboard.press('Escape')
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  for (const theme of themes) {
    await page.goto(`${baseUrl}/?theme=${theme}`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '⛶ 演讲模式' }).click()
    await settleMotion(page)
    const startViewport = await auditPresentationViewport(page)
    await page.keyboard.press('End')
    await settleMotion(page)
    const endViewport = await auditPresentationViewport(page)
    const viewport = [...startViewport, ...endViewport]
    if (viewport.length) failures.push({ theme, page: '16:10-viewport', viewport })
    await page.keyboard.press('Escape')
  }

  await page.setViewportSize({ width: 1280, height: 720 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${baseUrl}/?theme=default`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '⛶ 演讲模式' }).click()
  const reducedMotionFailures = await page.evaluate(() => {
    const content = document.querySelector('.slide-frame--active .cover-inner')
    const scan = document.querySelector('.qr-scan')
    const failures = []
    if (!content || Number.parseFloat(getComputedStyle(content).animationDuration) > 0.01) failures.push('内容动画未按系统设置降级')
    if (scan && getComputedStyle(scan).display !== 'none') failures.push('连续扫描动画未按系统设置关闭')
    return failures
  })
  if (reducedMotionFailures.length) failures.push({ theme: 'default', page: 'reduced-motion', motion: reducedMotionFailures })
} finally {
  await browser?.close()
  vite.kill('SIGTERM')
}

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2))
  process.exitCode = 1
} else {
  console.log(`✓ 四套主题逐页布局验收通过，截图目录：${outputRoot}`)
}

if (viteError && vite.exitCode && vite.exitCode !== 0) console.error(viteError)
