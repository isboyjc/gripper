import { useEffect, useCallback, useState, useRef } from 'react'
import { Toolbar } from './ui/Toolbar'
import { ElementHighlight } from './ui/ElementHighlight'
import { Eyedropper } from './ui/Eyedropper'
import { InspectAll } from './ui/InspectAll'
import { GridFlexVisualizer } from './ui/GridFlexVisualizer'
import { ElementSearch } from './ui/ElementSearch'
import { useToolbarStore, getActualTheme } from '@/stores/toolbarStore'
import { useScreenshotStore } from '@/stores/screenshotStore'
import { getMessages } from '@/i18n'
import type { SelectedElementInfo, BoxModelInfo, ColorInfo, TypographyInfo, AssetInfo, DocumentNode } from '@/types'

interface AppProps {
  shadowRoot: ShadowRoot
}

function getBoxModel(element: Element): BoxModelInfo {
  const computed = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()
  const parsePx = (value: string): number => parseFloat(value.replace('px', '')) || 0
  return {
    margin: { top: parsePx(computed.marginTop), right: parsePx(computed.marginRight), bottom: parsePx(computed.marginBottom), left: parsePx(computed.marginLeft) },
    border: { top: parsePx(computed.borderTopWidth), right: parsePx(computed.borderRightWidth), bottom: parsePx(computed.borderBottomWidth), left: parsePx(computed.borderLeftWidth) },
    padding: { top: parsePx(computed.paddingTop), right: parsePx(computed.paddingRight), bottom: parsePx(computed.paddingBottom), left: parsePx(computed.paddingLeft) },
    content: { width: Math.round(rect.width), height: Math.round(rect.height) },
  }
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return rgb
  const r = parseInt(match[1], 10), g = parseInt(match[2], 10), b = parseInt(match[3], 10)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

function rgbToHsl(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return rgb
  const r = parseInt(match[1], 10) / 255, g = parseInt(match[2], 10) / 255, b = parseInt(match[3], 10) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function getColors(element: Element): ColorInfo[] {
  const computed = window.getComputedStyle(element)
  const colors: ColorInfo[] = []
  const addColor = (value: string, property: string) => {
    if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
      colors.push({ hex: rgbToHex(value), rgb: value, hsl: rgbToHsl(value), property })
    }
  }
  addColor(computed.color, 'color')
  addColor(computed.backgroundColor, 'background-color')
  addColor(computed.borderColor, 'border-color')
  return colors
}

function getTypography(element: Element): TypographyInfo {
  const computed = window.getComputedStyle(element)
  return {
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textAlign: computed.textAlign,
  }
}

function generateSelector(element: Element): string {
  const tag = element.tagName.toLowerCase()
  if (element.id) return `#${element.id}`
  let selector = tag
  if (element.classList.length > 0) selector += `.${Array.from(element.classList).slice(0, 3).join('.')}`
  return selector
}

function getDocumentNode(element: Element): DocumentNode {
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || undefined,
    className: typeof element.className === 'string' ? element.className : undefined,
  }
}

function getAncestors(element: Element): DocumentNode[] {
  const ancestors: DocumentNode[] = []
  let parent = element.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    ancestors.unshift(getDocumentNode(parent))
    parent = parent.parentElement
  }
  return ancestors.slice(-3) // 只保留最近3个祖先
}

function getChildNodes(element: Element): DocumentNode[] {
  const children: DocumentNode[] = []
  for (let i = 0; i < Math.min(element.children.length, 3); i++) {
    children.push(getDocumentNode(element.children[i]))
  }
  return children
}

function getAllColors(element: Element): ColorInfo[] {
  const colorMap = new Map<string, ColorInfo>()
  
  const collectColors = (el: Element) => {
    const colors = getColors(el)
    colors.forEach(c => {
      const key = `${c.hex}-${c.property}`
      if (!colorMap.has(key)) {
        colorMap.set(key, c)
      }
    })
  }
  
  collectColors(element)
  const descendants = element.querySelectorAll('*')
  descendants.forEach(el => collectColors(el))
  
  return Array.from(colorMap.values())
}

function getAllTypography(element: Element): TypographyInfo[] {
  const typoMap = new Map<string, TypographyInfo>()
  
  const collectTypo = (el: Element) => {
    const typo = getTypography(el)
    const key = `${typo.fontFamily}-${typo.fontSize}-${typo.fontWeight}`
    if (!typoMap.has(key)) {
      typoMap.set(key, { ...typo, color: window.getComputedStyle(el).color })
    }
  }
  
  collectTypo(element)
  const textElements = element.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, li, td, th, label, button')
  textElements.forEach(el => collectTypo(el))
  
  return Array.from(typoMap.values())
}

/**
 * 获取结构化的文本内容 - 按块级元素分段
 */
function getStructuredTextContent(element: Element): string | undefined {
  const lines: string[] = []
  const blockTags = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TR', 'TD', 'TH', 'ARTICLE', 'SECTION', 'HEADER', 'FOOTER', 'BLOCKQUOTE', 'PRE', 'BR'])
  
  let currentLine: string[] = []
  
  const flushLine = () => {
    if (currentLine.length > 0) {
      const lineText = currentLine.join(' ').replace(/\s+/g, ' ').trim()
      if (lineText) {
        lines.push(lineText)
      }
      currentLine = []
    }
  }
  
  const collectText = (node: Node, depth: number) => {
    if (depth > 15) return // 防止过深递归
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
      if (text) {
        currentLine.push(text)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tagName = el.tagName
      
      // 跳过不可见元素
      if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'NOSCRIPT' || tagName === 'SVG') return
      
      // BR 标签换行
      if (tagName === 'BR') {
        flushLine()
        return
      }
      
      // 块级元素前换行
      if (blockTags.has(tagName)) {
        flushLine()
      }
      
      for (const child of el.childNodes) {
        collectText(child, depth + 1)
      }
      
      // 块级元素后换行
      if (blockTags.has(tagName)) {
        flushLine()
      }
    }
  }
  
  collectText(element, 0)
  flushLine() // 处理剩余内容
  
  // 合并行
  let result = lines.join('\n')
  
  // 限制长度
  if (result.length > 10000) {
    result = result.slice(0, 10000) + '...'
  }
  
  return result.length > 0 ? result : undefined
}

/**
 * 提取Next.js/_next/image优化后的原始图片URL
 */
function extractNextImageUrl(url: string): string {
  try {
    // Next.js图片优化格式: /_next/image?url=<encoded-url>&w=<width>&q=<quality>
    if (url.includes('/_next/image')) {
      const urlObj = new URL(url, window.location.origin)
      const originalUrl = urlObj.searchParams.get('url')
      if (originalUrl) {
        // 如果是相对路径，需要转换为完整URL
        if (originalUrl.startsWith('/')) {
          return new URL(originalUrl, window.location.origin).href
        }
        // 如果是完整URL（可能已编码）
        return decodeURIComponent(originalUrl)
      }
    }
  } catch (e) {
    // 解析失败，返回原URL
  }
  return url
}

/**
 * 提取Nuxt.js图片优化后的原始图片URL
 */
function extractNuxtImageUrl(url: string): string {
  try {
    // Nuxt Image格式: /_ipx/...或/_nuxt/image/...
    if (url.includes('/_ipx/') || url.includes('/_nuxt/image/')) {
      // 尝试从路径中提取原始URL
      const match = url.match(/\/_(?:ipx|nuxt\/image)\/[^/]*\/(.+)/)
      if (match && match[1]) {
        const originalPath = decodeURIComponent(match[1])
        if (originalPath.startsWith('http')) {
          return originalPath
        }
        if (originalPath.startsWith('/')) {
          return new URL(originalPath, window.location.origin).href
        }
      }
    }
  } catch (e) {
    // 解析失败，返回原URL
  }
  return url
}

/**
 * 生成元素选择器
 */
function getAssetSelector(element: Element): string {
  if (element.id) return `#${element.id}`
  const tag = element.tagName.toLowerCase()
  const classes = Array.from(element.classList).slice(0, 2)
  if (classes.length > 0) {
    return `${tag}.${classes.join('.')}`
  }
  return tag
}

function getAllAssets(element: Element): AssetInfo[] {
  const assets: AssetInfo[] = []
  const svgContentSet = new Set<string>() // 用于 SVG 内容去重

  // 检查元素自身是否是图片
  if (element.tagName.toLowerCase() === 'img') {
    const img = element as HTMLImageElement
    if (img.src) {
      let originalUrl = img.src
      originalUrl = extractNextImageUrl(originalUrl)
      originalUrl = extractNuxtImageUrl(originalUrl)

      assets.push({
        type: 'image',
        url: originalUrl,
        size: img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : undefined,
        selector: getAssetSelector(img),
      })
    }
  }

  // 检查元素自身是否是 video
  if (element.tagName.toLowerCase() === 'video') {
    const video = element as HTMLVideoElement
    let videoSrc = video.src
    if (!videoSrc) {
      const sourceEl = video.querySelector('source')
      if (sourceEl) {
        videoSrc = sourceEl.src
      }
    }
    if (videoSrc) {
      assets.push({
        type: 'video',
        url: videoSrc,
        size: video.videoWidth && video.videoHeight
          ? { width: video.videoWidth, height: video.videoHeight }
          : undefined,
        selector: getAssetSelector(video),
      })
    }
  }

  // 检查元素自身是否是 audio
  if (element.tagName.toLowerCase() === 'audio') {
    const audio = element as HTMLAudioElement
    let audioSrc = audio.src
    if (!audioSrc) {
      const sourceEl = audio.querySelector('source')
      if (sourceEl) {
        audioSrc = sourceEl.src
      }
    }
    if (audioSrc) {
      assets.push({
        type: 'audio',
        url: audioSrc,
        selector: getAssetSelector(audio),
      })
    }
  }

  // 检查元素自身是否是 SVG
  if (element.tagName.toLowerCase() === 'svg') {
    const svg = element as SVGElement
    const svgContent = svg.outerHTML
    if (svgContent.length <= 50000) {
      const normalizedContent = svgContent
        .replace(/\s*(width|height)=["'][^"']*["']/gi, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (!svgContentSet.has(normalizedContent)) {
        svgContentSet.add(normalizedContent)
        const width = svg.getBoundingClientRect().width
        const height = svg.getBoundingClientRect().height
        assets.push({
          type: 'svg',
          url: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`,
          size: { width: Math.round(width), height: Math.round(height) },
          content: svgContent,
          selector: getAssetSelector(svg),
        })
      }
    }
  }

  // 收集同级元素的资源（如果父元素存在）
  const parentElement = element.parentElement
  if (parentElement) {
    // 同级 img 元素
    const siblingImages = Array.from(parentElement.querySelectorAll('img'))
    siblingImages.forEach(img => {
      if (img.src && img !== element) { // 排除自身避免重复
        let originalUrl = img.src
        originalUrl = extractNextImageUrl(originalUrl)
        originalUrl = extractNuxtImageUrl(originalUrl)

        assets.push({
          type: 'image',
          url: originalUrl,
          size: img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : undefined,
          selector: getAssetSelector(img),
        })
      }
    })

    // 同级 video 元素
    const siblingVideos = Array.from(parentElement.querySelectorAll('video'))
    siblingVideos.forEach(video => {
      if (video !== element) {
        let videoSrc = video.src
        if (!videoSrc) {
          const sourceEl = video.querySelector('source')
          if (sourceEl) {
            videoSrc = sourceEl.src
          }
        }
        if (videoSrc) {
          assets.push({
            type: 'video',
            url: videoSrc,
            size: video.videoWidth && video.videoHeight
              ? { width: video.videoWidth, height: video.videoHeight }
              : undefined,
            selector: getAssetSelector(video),
          })
        }
      }
    })

    // 同级 audio 元素
    const siblingAudios = Array.from(parentElement.querySelectorAll('audio'))
    siblingAudios.forEach(audio => {
      if (audio !== element) {
        let audioSrc = audio.src
        if (!audioSrc) {
          const sourceEl = audio.querySelector('source')
          if (sourceEl) {
            audioSrc = sourceEl.src
          }
        }
        if (audioSrc) {
          assets.push({
            type: 'audio',
            url: audioSrc,
            selector: getAssetSelector(audio),
          })
        }
      }
    })
  }

  // 图片 - img 标签（子元素）
  const images = element.querySelectorAll('img')
  images.forEach(img => {
    if (img.src) {
      let originalUrl = img.src

      // 提取Next.js优化图片的原始URL
      originalUrl = extractNextImageUrl(originalUrl)

      // 提取Nuxt.js优化图片的原始URL
      originalUrl = extractNuxtImageUrl(originalUrl)

      assets.push({
        type: 'image',
        url: originalUrl,
        size: img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : undefined,
        selector: getAssetSelector(img),
      })
    }
  })

  // 图片 - picture 元素的 source（响应式图片）
  const pictures = element.querySelectorAll('picture')
  pictures.forEach(picture => {
    const sources = picture.querySelectorAll('source')
    sources.forEach(source => {
      const srcset = source.srcset
      if (srcset) {
        // 解析 srcset，取第一个 URL
        let firstSrc = srcset.split(',')[0].trim().split(' ')[0]
        if (firstSrc && !firstSrc.startsWith('data:')) {
          // 提取优化框架的原始URL
          firstSrc = extractNextImageUrl(firstSrc)
          firstSrc = extractNuxtImageUrl(firstSrc)

          assets.push({
            type: 'image',
            url: firstSrc,
            selector: getAssetSelector(picture),
          })
        }
      }
    })
  })

  // 视频
  const videos = element.querySelectorAll('video')
  videos.forEach(video => {
    // 获取视频源
    let videoSrc = video.src
    if (!videoSrc) {
      // 检查 source 子元素
      const sourceEl = video.querySelector('source')
      if (sourceEl) {
        videoSrc = sourceEl.src
      }
    }

    if (videoSrc) {
      assets.push({
        type: 'video',
        url: videoSrc,
        size: video.videoWidth && video.videoHeight
          ? { width: video.videoWidth, height: video.videoHeight }
          : undefined,
        selector: getAssetSelector(video),
      })
    }
  })

  // 音频
  const audios = element.querySelectorAll('audio')
  audios.forEach(audio => {
    // 获取音频源
    let audioSrc = audio.src
    if (!audioSrc) {
      // 检查 source 子元素
      const sourceEl = audio.querySelector('source')
      if (sourceEl) {
        audioSrc = sourceEl.src
      }
    }

    if (audioSrc) {
      assets.push({
        type: 'audio',
        url: audioSrc,
        selector: getAssetSelector(audio),
      })
    }
  })

  // SVG - 限制大小避免存储问题，基于内容去重
  const svgs = element.querySelectorAll('svg')
  svgs.forEach(svg => {
    const svgContent = svg.outerHTML
    // 跳过超大 SVG
    if (svgContent.length > 50000) return

    // 提取 SVG 核心内容用于去重（去除尺寸属性）
    const normalizedContent = svgContent
      .replace(/\s*(width|height)=["'][^"']*["']/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    // 跳过已存在的相同 SVG
    if (svgContentSet.has(normalizedContent)) return
    svgContentSet.add(normalizedContent)

    const width = svg.getBoundingClientRect().width
    const height = svg.getBoundingClientRect().height
    assets.push({
      type: 'svg',
      url: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`,
      size: { width: Math.round(width), height: Math.round(height) },
      content: svgContent,
      selector: getAssetSelector(svg),
    })
  })

  // 背景图片
  const allElements = [element, ...Array.from(element.querySelectorAll('*'))]
  allElements.forEach(el => {
    const style = window.getComputedStyle(el)
    const bgImage = style.backgroundImage
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/)
      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
        let bgUrl = urlMatch[1]

        // 提取优化框架的原始URL
        bgUrl = extractNextImageUrl(bgUrl)
        bgUrl = extractNuxtImageUrl(bgUrl)

        // 检查元素是否可见（用于锚定功能）
        const rect = el.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0

        assets.push({
          type: 'image',
          url: bgUrl,
          selector: isVisible ? getAssetSelector(el) : undefined,
        })
      }
    }
  })
  
  // 去重（基于 URL）
  const uniqueAssets = assets.filter((asset, index, self) => 
    index === self.findIndex(a => a.url === asset.url)
  )
  
  return uniqueAssets
}

function getComputedStyles(element: Element): Record<string, string> {
  const computed = window.getComputedStyle(element)
  const importantProps = [
    'display', 'position', 'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'padding', 'margin', 'border', 'border-radius',
    'background', 'background-color', 'background-image',
    'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align',
    'flex-direction', 'justify-content', 'align-items', 'gap', 'flex-wrap',
    'grid-template-columns', 'grid-template-rows', 'grid-gap',
    'overflow', 'z-index', 'opacity', 'visibility',
    'box-shadow', 'transform', 'transition', 'animation',
  ]
  
  const styles: Record<string, string> = {}
  importantProps.forEach(prop => {
    const value = computed.getPropertyValue(prop)
    if (value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'visible') {
      styles[prop] = value
    }
  })
  return styles
}

function analyzeElement(element: Element): SelectedElementInfo {
  const rect = element.getBoundingClientRect()
  // 获取文本内容 - 按直接子节点收集，保持结构
  const textContent = getStructuredTextContent(element)
  
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || '',
    className: typeof element.className === 'string' ? element.className : '',
    dimensions: { width: Math.round(rect.width), height: Math.round(rect.height) },
    position: { x: Math.round(rect.left + window.scrollX), y: Math.round(rect.top + window.scrollY) },
    boxModel: getBoxModel(element),
    computedStyles: getComputedStyles(element),
    textContent: textContent && textContent.length > 0 ? textContent : undefined,
    colors: getAllColors(element),
    typography: getAllTypography(element),
    assets: getAllAssets(element),
    selector: generateSelector(element),
    ancestors: getAncestors(element),
    children: getChildNodes(element),
  }
}

export function App({ shadowRoot }: AppProps) {
  const { isEnabled, theme, locale, setEnabled, setTheme, setLocale, toggleTool, setSidePanelOpen } = useToolbarStore()
  const screenshotSettings = useScreenshotStore()
  const actualTheme = getActualTheme(theme)
  const t = getMessages(locale)

  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isInspectorActive, setIsInspectorActive] = useState(true)
  const [isEyedropperActive, setIsEyedropperActive] = useState(false)
  const [isInspectAllActive, setIsInspectAllActive] = useState(false)
  const [isLayoutVisualizerActive, setIsLayoutVisualizerActive] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)

  // 记住原始选中的元素位置，用于上下键导航
  const originalElementRef = useRef<Element | null>(null)
  const elementPathRef = useRef<Element[]>([])
  const pathIndexRef = useRef<number>(-1)

  // 初始化时从 chrome.storage 读取 theme 和 locale
  useEffect(() => {
    chrome.storage.local.get(['theme', 'locale'], (result) => {
      const storedTheme = result.theme as string
      const storedLocale = result.locale as string
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setTheme(storedTheme as 'light' | 'dark' | 'system')
      }
      if (storedLocale && ['en', 'zh'].includes(storedLocale)) {
        setLocale(storedLocale as 'en' | 'zh')
      }
    })
  }, [setTheme, setLocale])

  // 监听截图设置变化 - 同步 popup 中的设置变更
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes['gripper-screenshot-settings']) {
        try {
          // Zustand 使用 Chrome Storage 时会存储 JSON 字符串
          const newValue = changes['gripper-screenshot-settings'].newValue
          if (typeof newValue === 'string') {
            const parsed = JSON.parse(newValue) as {
              state?: {
                showWatermark: boolean
                includeTimestamp: boolean
                expandCaptureArea: boolean
                showGridOverlay: boolean
              }
            }
            if (parsed?.state) {
              // 更新 Zustand store 以同步来自 popup 的设置变更
              screenshotSettings.setShowWatermark(parsed.state.showWatermark)
              screenshotSettings.setIncludeTimestamp(parsed.state.includeTimestamp)
              screenshotSettings.setExpandCaptureArea(parsed.state.expandCaptureArea)
              screenshotSettings.setShowGridOverlay(parsed.state.showGridOverlay)
            }
          }
        } catch (error) {
          console.error('[Gripper] Failed to parse screenshot settings:', error)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [screenshotSettings])

  useEffect(() => {
    const container = shadowRoot.querySelector('.gripper-container')
    if (container) container.setAttribute('data-theme', actualTheme)
  }, [actualTheme, shadowRoot])

  const sendElementInfo = useCallback((element: Element) => {
    const info = analyzeElement(element)
    chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', payload: info })
  }, [])

  // 关闭扩展
  const handleDisable = useCallback(async () => {
    // 先清理状态
    setSelectedElement(null)
    setHoveredElement(null)
    setIsPaused(false)
    setIsEyedropperActive(false)
    setIsInspectAllActive(false)
    setIsLayoutVisualizerActive(false)
    setIsSearchActive(false)
    originalElementRef.current = null
    elementPathRef.current = []
    pathIndexRef.current = -1
    setSidePanelOpen(false)

    // 通知 background 更新状态和图标
    try {
      await chrome.runtime.sendMessage({
        type: 'DISABLE_EXTENSION'
      })
    } catch (error) {
      console.error('[Gripper] Failed to send disable message:', error)
    }

    // 最后禁用组件（这会导致组件卸载）
    setEnabled(false)
  }, [setEnabled, setSidePanelOpen])

  // 选择元素
  const selectElement = useCallback((element: Element | null, isNavigation = false) => {
    if (element) {
      setSelectedElement(element)
      sendElementInfo(element)
      
      // 如果不是导航操作，则重置原始元素
      if (!isNavigation) {
        originalElementRef.current = element
        // 构建从根到当前元素的路径
        const path: Element[] = []
        let current: Element | null = element
        while (current && current !== document.body && current !== document.documentElement) {
          path.unshift(current)
          current = current.parentElement
        }
        elementPathRef.current = path
        pathIndexRef.current = path.length - 1
      }
    } else {
      setSelectedElement(null)
      originalElementRef.current = null
      elementPathRef.current = []
      pathIndexRef.current = -1
    }
  }, [sendElementInfo])

  // 选择父级
  const selectParent = useCallback(() => {
    if (pathIndexRef.current > 0) {
      pathIndexRef.current--
      const parent = elementPathRef.current[pathIndexRef.current]
      if (parent) {
        setSelectedElement(parent)
        sendElementInfo(parent)
      }
    } else if (selectedElement?.parentElement && selectedElement.parentElement !== document.body) {
      // 扩展路径
      elementPathRef.current.unshift(selectedElement.parentElement)
      setSelectedElement(selectedElement.parentElement)
      sendElementInfo(selectedElement.parentElement)
    }
  }, [selectedElement, sendElementInfo])

  // 选择子级（回到原始路径）
  const selectChild = useCallback(() => {
    if (pathIndexRef.current < elementPathRef.current.length - 1) {
      pathIndexRef.current++
      const child = elementPathRef.current[pathIndexRef.current]
      if (child) {
        setSelectedElement(child)
        sendElementInfo(child)
      }
    }
  }, [sendElementInfo])

  const canSelectParent = !!selectedElement?.parentElement && selectedElement.parentElement !== document.body
  // canSelectChild 使用 state 而不是直接访问 ref，避免渲染期间访问 ref
  const [canSelectChild, setCanSelectChild] = useState(false)
  
  // 同步 canSelectChild 状态
  useEffect(() => {
    setCanSelectChild(pathIndexRef.current < elementPathRef.current.length - 1)
  }, [selectedElement])

  // Inspector 模式鼠标事件
  const shouldInspect = isEnabled && !isPaused && !isEyedropperActive && isInspectorActive

  // 注入全局样式来禁用页面交互效果（在审查模式激活时）
  useEffect(() => {
    if (!shouldInspect) {
      return
    }

    // 创建样式标签来禁用页面的 hover、transition、animation 效果
    const styleId = 'gripper-disable-interactions'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement

    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.textContent = `
        /* Gripper: 禁用页面交互效果 */
        *:not(#gripper-root):not(#gripper-root *) {
          transition: none !important;
          animation: none !important;
        }
        *:not(#gripper-root):not(#gripper-root *):hover {
          transform: none !important;
          scale: none !important;
          filter: none !important;
        }
      `
      document.head.appendChild(styleEl)
    }

    return () => {
      // 清理样式
      const el = document.getElementById(styleId)
      if (el) {
        el.remove()
      }
    }
  }, [shouldInspect])

  useEffect(() => {
    if (!shouldInspect) {
      return
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('#gripper-root')) { setHoveredElement(null); return }
      setHoveredElement(target)
    }

    const handleMouseOut = () => setHoveredElement(null)

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('#gripper-root')) return
      e.preventDefault()
      e.stopPropagation()
      selectElement(target, false)
    }

    document.addEventListener('mouseover', handleMouseOver, true)
    document.addEventListener('mouseout', handleMouseOut, true)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('click', handleClick, true)
      setHoveredElement(null)
    }
  }, [shouldInspect, selectElement])

  // 暂停/恢复
  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false)
    } else {
      setIsPaused(true)
      setSelectedElement(null)
      setHoveredElement(null)
    }
  }, [isPaused])

  // 吸管工具
  const handleToggleEyedropper = useCallback(() => {
    if (isEyedropperActive) {
      setIsEyedropperActive(false)
      toggleTool('inspector')
    } else {
      setIsEyedropperActive(true)
      setSelectedElement(null)
      setHoveredElement(null)
    }
  }, [isEyedropperActive, toggleTool])

  const handleColorPick = useCallback((color: string) => {
    console.log('[Gripper] Color picked:', color)
    setIsEyedropperActive(false)
    toggleTool('inspector')
  }, [toggleTool])

  // 截图功能
  const handleScreenshot = useCallback(async () => {
    try {
      // 如果有选中元素，截取选中元素区域；否则截取整个页面
      const rect = selectedElement?.getBoundingClientRect()

      // 如果不显示网格覆盖，临时隐藏所有高亮元素
      const shouldHideOverlays = !screenshotSettings.showGridOverlay
      let tempSelectedElement: Element | null = null
      if (shouldHideOverlays) {
        tempSelectedElement = selectedElement
        setHoveredElement(null)
        setSelectedElement(null)
        // 等待 React 更新 DOM
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 发送消息给 background script 请求截图
      chrome.runtime.sendMessage({
        type: 'TAKE_SCREENSHOT',
        payload: {
          rect: rect ? {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          } : null
        }
      }, async (response) => {
        if (response?.success && response.dataUrl) {
          try {
            let finalDataUrl = response.dataUrl

            // 如果有选中区域，需要裁剪图片并添加水印
            if (rect) {
              // 创建临时 canvas 用于裁剪
              const img = new Image()
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve()
                img.onerror = reject
                img.src = response.dataUrl
              })

              // 使用设备像素比提高精度
              const dpr = window.devicePixelRatio || 1

              // 计算截图区域 - 根据设置决定是否扩展
              let captureX = rect.x
              let captureY = rect.y
              let captureWidth = rect.width
              let captureHeight = rect.height

              if (screenshotSettings.expandCaptureArea) {
                // 计算扩展后的截图区域
                // 添加固定边距（40px）或元素尺寸的 20%，取较大值
                const paddingX = Math.max(40, rect.width * 0.2)
                const paddingY = Math.max(40, rect.height * 0.2)

                // 计算扩展后的坐标，确保不超出视口范围
                captureX = Math.max(0, rect.x - paddingX)
                captureY = Math.max(0, rect.y - paddingY)
                captureWidth = Math.min(
                  window.innerWidth - captureX,
                  rect.width + paddingX * 2
                )
                captureHeight = Math.min(
                  window.innerHeight - captureY,
                  rect.height + paddingY * 2
                )
              }

              // 水印区域高度 - 根据设置决定是否需要
              const watermarkHeight = screenshotSettings.showWatermark ? 60 : 0

              // 创建 canvas 进行裁剪和可能添加水印
              const canvas = document.createElement('canvas')
              const finalWidth = captureWidth * dpr
              const finalHeight = (captureHeight + watermarkHeight) * dpr
              canvas.width = finalWidth
              canvas.height = finalHeight
              const ctx = canvas.getContext('2d')

              if (ctx) {
                // 设置高质量渲染
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'

                // 按照设备像素比缩放
                ctx.scale(dpr, dpr)

                // 绘制截图内容
                ctx.drawImage(
                  img,
                  captureX,
                  captureY,
                  captureWidth,
                  captureHeight,
                  0,
                  0,
                  captureWidth,
                  captureHeight
                )

                // 如果启用水印，绘制水印区域
                if (screenshotSettings.showWatermark) {
                  // 根据主题定义水印配色
                  const watermarkColors = actualTheme === 'dark' ? {
                    gradientStart: '#1f2937',
                    gradientEnd: '#111827',
                    border: '#374151',
                    logo: '#ffffff',
                    brandText: '#f9fafb',
                    captionText: '#9ca3af',
                    timestamp: '#6b7280'
                  } : {
                    gradientStart: '#f8f9fa',
                    gradientEnd: '#e9ecef',
                    border: '#dee2e6',
                    logo: '#000000',
                    brandText: '#1f2937',
                    captionText: '#6b7280',
                    timestamp: '#9ca3af'
                  }

                  // 绘制水印区域背景（渐变效果）
                  const gradient = ctx.createLinearGradient(0, captureHeight, 0, captureHeight + watermarkHeight)
                  gradient.addColorStop(0, watermarkColors.gradientStart)
                  gradient.addColorStop(1, watermarkColors.gradientEnd)
                  ctx.fillStyle = gradient
                  ctx.fillRect(0, captureHeight, captureWidth, watermarkHeight)

                  // 绘制顶部分割线
                  ctx.strokeStyle = watermarkColors.border
                  ctx.lineWidth = 1
                  ctx.beginPath()
                  ctx.moveTo(0, captureHeight)
                  ctx.lineTo(captureWidth, captureHeight)
                  ctx.stroke()

                  // 绘制 Logo (SVG path)
                  const logoSize = 24
                  const logoX = 20
                  const logoY = captureHeight + (watermarkHeight - logoSize) / 2

                  ctx.save()
                  ctx.translate(logoX, logoY)
                  ctx.scale(logoSize / 24, logoSize / 24)
                  ctx.fillStyle = watermarkColors.logo
                  ctx.fill(new Path2D('M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025'))
                  ctx.restore()

                  // 绘制文字
                  const textX = logoX + logoSize + 12
                  const textY = captureHeight + watermarkHeight / 2

                  // 品牌名称
                  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  ctx.fillStyle = watermarkColors.brandText
                  ctx.textBaseline = 'middle'
                  ctx.fillText('Gripper', textX, textY - 8)

                  // 获取国际化文本
                  const capturedByText = t.screenshot.capturedBy

                  // 副标题文字
                  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  ctx.fillStyle = watermarkColors.captionText
                  ctx.fillText(capturedByText, textX, textY + 10)

                  // 右侧添加时间戳 - 根据设置决定是否显示
                  if (screenshotSettings.includeTimestamp) {
                    const now = new Date()
                    const timeStr = now.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    const dateStr = now.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                    const timestampText = `${dateStr} ${timeStr}`

                    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    ctx.fillStyle = watermarkColors.timestamp
                    ctx.textAlign = 'right'
                    ctx.fillText(timestampText, captureWidth - 20, textY)
                    ctx.textAlign = 'left' // 恢复默认对齐
                  }
                }

                finalDataUrl = canvas.toDataURL('image/png', 1.0)
              }
            }

            // 发送给 background script 使用 chrome.downloads API 下载
            const filename = rect ? 'gripper-element-screenshot.png' : 'gripper-page-screenshot.png'

            chrome.runtime.sendMessage({
              type: 'DOWNLOAD_SCREENSHOT',
              payload: {
                dataUrl: finalDataUrl,
                filename
              }
            }, (downloadResponse) => {
              if (downloadResponse?.success) {
                console.log('[Gripper] Screenshot downloaded:', filename)
              } else {
                console.error('[Gripper] Screenshot download failed:', downloadResponse?.error)
              }

              // 恢复之前选中的元素
              if (shouldHideOverlays && tempSelectedElement) {
                setSelectedElement(tempSelectedElement)
              }
            })
          } catch (error) {
            console.error('[Gripper] Screenshot processing error:', error)
            // 恢复之前选中的元素
            if (shouldHideOverlays && tempSelectedElement) {
              setSelectedElement(tempSelectedElement)
            }
          }
        } else {
          console.error('[Gripper] Screenshot capture failed:', response?.error)
          // 恢复之前选中的元素
          if (shouldHideOverlays && tempSelectedElement) {
            setSelectedElement(tempSelectedElement)
          }
        }
      })
    } catch (error) {
      console.error('[Gripper] Screenshot error:', error)
    }
  }, [selectedElement, t, locale, actualTheme, screenshotSettings])

  // 发送默认 html 元素信息
  const sendDefaultHtmlInfo = useCallback(() => {
    const htmlEl = document.documentElement
    const defaultInfo = analyzeElement(htmlEl)
    chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', payload: defaultInfo })
  }, [])

  // 单个审查切换
  const handleToggleInspector = useCallback(() => {
    if (isInspectorActive) {
      // 关闭单个审查时，清除选中状态并恢复 html 信息
      setIsInspectorActive(false)
      setSelectedElement(null)
      setHoveredElement(null)
      originalElementRef.current = null
      elementPathRef.current = []
      pathIndexRef.current = -1
      sendDefaultHtmlInfo()
    } else {
      // 开启单个审查时，关闭全量审查和搜索
      setIsInspectorActive(true)
      setIsInspectAllActive(false)
      setIsSearchActive(false)
    }
  }, [isInspectorActive, sendDefaultHtmlInfo])

  // 全量审查
  const handleToggleInspectAll = useCallback(() => {
    if (isInspectAllActive) {
      // 关闭全量审查
      setIsInspectAllActive(false)
    } else {
      // 开启全量审查时，关闭单个审查、搜索并清除选中状态
      setIsInspectAllActive(true)
      setIsInspectorActive(false)
      setIsSearchActive(false)
      setSelectedElement(null)
      setHoveredElement(null)
      originalElementRef.current = null
      elementPathRef.current = []
      pathIndexRef.current = -1
      sendDefaultHtmlInfo()
    }
  }, [isInspectAllActive, sendDefaultHtmlInfo])

  // Grid/Flexbox 可视化
  const handleToggleLayoutVisualizer = useCallback(() => {
    if (isLayoutVisualizerActive) {
      // 关闭布局可视化
      setIsLayoutVisualizerActive(false)
    } else {
      // 开启布局可视化
      setIsLayoutVisualizerActive(true)
    }
  }, [isLayoutVisualizerActive])

  // 搜索切换 - 与审查、全量审查互斥
  const handleToggleSearch = useCallback(() => {
    if (isSearchActive) {
      setIsSearchActive(false)
      sendDefaultHtmlInfo()
    } else {
      setIsSearchActive(true)
      setIsInspectorActive(false)
      setIsInspectAllActive(false)
      setSelectedElement(null)
      setHoveredElement(null)
      originalElementRef.current = null
      elementPathRef.current = []
      pathIndexRef.current = -1
    }
  }, [isSearchActive, sendDefaultHtmlInfo])

  // 搜索选中元素
  const handleSearchSelect = useCallback((element: Element) => {
    setSelectedElement(element)
    sendElementInfo(element)
    originalElementRef.current = element
    elementPathRef.current = [element]
    pathIndexRef.current = 0
  }, [sendElementInfo])

  // 监听来自 popup/background/sidepanel 的消息
  useEffect(() => {
    const handleMessage = (
      message: { type: string; payload?: unknown; selector?: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      switch (message.type) {
        case 'DISABLE_EXTENSION':
          handleDisable()
          sendResponse({ success: true })
          return false
        case 'ENABLE_EXTENSION':
          setEnabled(true)
          sendResponse({ success: true })
          return false
        case 'LOCALE_CHANGED':
          if (message.payload && typeof message.payload === 'object' && 'locale' in message.payload) {
            setLocale((message.payload as { locale: 'en' | 'zh' }).locale)
          }
          sendResponse({ success: true })
          return false
        case 'THEME_CHANGED':
          if (message.payload && typeof message.payload === 'object' && 'theme' in message.payload) {
            setTheme((message.payload as { theme: 'light' | 'dark' | 'system' }).theme)
          }
          sendResponse({ success: true })
          return false
        case 'SELECT_PARENT':
          selectParent()
          sendResponse({ success: true })
          return false
        case 'SELECT_CHILD':
          selectChild()
          sendResponse({ success: true })
          return false
        case 'GET_HTML_ELEMENT_INFO': {
          // 获取 html 元素信息作为默认显示
          const htmlElement = document.documentElement
          const htmlInfo = analyzeElement(htmlElement)
          chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', payload: htmlInfo })
          sendResponse({ success: true })
          return false
        }
        case 'CLEAR_SELECTION': {
          // 清除选中状态，恢复到 html 元素
          setSelectedElement(null)
          setHoveredElement(null)
          originalElementRef.current = null
          elementPathRef.current = []
          pathIndexRef.current = -1
          // 发送 html 元素信息
          const htmlEl = document.documentElement
          const defaultInfo = analyzeElement(htmlEl)
          chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED', payload: defaultInfo })
          sendResponse({ success: true })
          return false
        }
        case 'LOCATE_ELEMENT': {
          // 定位并高亮元素
          if (message.selector) {
            try {
              const element = document.querySelector(message.selector)
              if (element) {
                // 滚动到元素
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })

                // 等待滚动完成后再高亮（延迟确保滚动动画完成）
                setTimeout(() => {
                  // 临时高亮该元素 - 不选中，仅视觉高亮
                  setHoveredElement(element)

                  // 3秒后取消高亮
                  setTimeout(() => {
                    setHoveredElement(null)
                  }, 3000)
                }, 500)

                sendResponse({ success: true })
              } else {
                sendResponse({ success: false, error: 'Element not found' })
              }
            } catch (error) {
              sendResponse({ success: false, error: String(error) })
            }
          } else {
            sendResponse({ success: false, error: 'No selector provided' })
          }
          return false
        }
      }
      return false
    }
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [handleDisable, selectParent, selectChild, setLocale, setTheme, setEnabled, selectElement])

  if (!isEnabled) return null

  return (
    <>
      <Toolbar
        theme={actualTheme}
        t={t.toolbar}
        onDisable={handleDisable}
        onSelectParent={selectParent}
        onSelectChild={selectChild}
        canSelectParent={canSelectParent}
        canSelectChild={canSelectChild}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onToggleInspector={handleToggleInspector}
        onToggleEyedropper={handleToggleEyedropper}
        onToggleInspectAll={handleToggleInspectAll}
        onToggleSearch={handleToggleSearch}
        onToggleLayoutVisualizer={handleToggleLayoutVisualizer}
        onScreenshot={handleScreenshot}
        isInspectorActive={isInspectorActive}
        isEyedropperActive={isEyedropperActive}
        isInspectAllActive={isInspectAllActive}
        isSearchActive={isSearchActive}
        isLayoutVisualizerActive={isLayoutVisualizerActive}
      />

      {!isPaused && !isEyedropperActive && !isSearchActive && (
        <ElementHighlight hoveredElement={hoveredElement} selectedElement={selectedElement} />
      )}

      <Eyedropper isActive={isEyedropperActive} onColorPick={handleColorPick} onClose={() => { setIsEyedropperActive(false); toggleTool('inspector') }} />
      <InspectAll isActive={isInspectAllActive} />
      <GridFlexVisualizer isActive={isLayoutVisualizerActive} />
      <ElementSearch
        isActive={isSearchActive}
        onClose={() => setIsSearchActive(false)}
        onSelectElement={handleSearchSelect}
        theme={actualTheme}
        locale={locale}
      />
    </>
  )
}
