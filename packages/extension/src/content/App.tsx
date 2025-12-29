import { useEffect, useCallback, useState, useRef } from 'react'
import { Toolbar } from './ui/Toolbar'
import { ElementHighlight } from './ui/ElementHighlight'
import { Eyedropper } from './ui/Eyedropper'
import { InspectAll } from './ui/InspectAll'
import { ElementSearch } from './ui/ElementSearch'
import { useToolbarStore, getActualTheme } from '@/stores/toolbarStore'
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

function getAllAssets(element: Element): AssetInfo[] {
  const assets: AssetInfo[] = []
  const svgContentSet = new Set<string>() // 用于 SVG 内容去重
  
  // 图片
  const images = element.querySelectorAll('img')
  images.forEach(img => {
    if (img.src) {
      assets.push({
        type: 'image',
        url: img.src,
        size: img.naturalWidth ? { width: img.naturalWidth, height: img.naturalHeight } : undefined,
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
        assets.push({
          type: 'image',
          url: urlMatch[1],
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
  const actualTheme = getActualTheme(theme)
  const t = getMessages(locale)

  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isInspectorActive, setIsInspectorActive] = useState(true)
  const [isEyedropperActive, setIsEyedropperActive] = useState(false)
  const [isInspectAllActive, setIsInspectAllActive] = useState(false)
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
    setSelectedElement(null)
    setHoveredElement(null)
    setIsPaused(false)
    setIsEyedropperActive(false)
    setIsInspectAllActive(false)
    setIsSearchActive(false)
    originalElementRef.current = null
    elementPathRef.current = []
    pathIndexRef.current = -1
    setSidePanelOpen(false)
    
    // 获取当前 tab ID 并通知 background 更新状态和图标
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.runtime.sendMessage({ 
        type: 'TOGGLE_EXTENSION', 
        tabId: tab.id, 
        payload: false 
      })
    }
    
    chrome.runtime.sendMessage({ type: 'CLOSE_SIDE_PANEL' })
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
      message: { type: string; payload?: unknown },
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
      }
      return false
    }
    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [handleDisable, selectParent, selectChild, setLocale, setTheme, setEnabled])

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
        isInspectorActive={isInspectorActive}
        isEyedropperActive={isEyedropperActive}
        isInspectAllActive={isInspectAllActive}
        isSearchActive={isSearchActive}
      />

      {!isPaused && !isEyedropperActive && !isSearchActive && (
        <ElementHighlight hoveredElement={hoveredElement} selectedElement={selectedElement} />
      )}

      <Eyedropper isActive={isEyedropperActive} onColorPick={handleColorPick} onClose={() => { setIsEyedropperActive(false); toggleTool('inspector') }} />
      <InspectAll isActive={isInspectAllActive} />
      <ElementSearch 
        isActive={isSearchActive} 
        onClose={() => setIsSearchActive(false)} 
        onSelectElement={handleSearchSelect}
        theme={actualTheme}
      />
    </>
  )
}
