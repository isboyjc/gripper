import { useEffect, useState, useCallback, useRef } from 'react'
import {
  DocumentTree,
  BoxModel,
  CSSProperties,
  TextContent,
  ColorsList,
  TypographyList,
  AssetsList,
} from './sections'
import { PanelHeader } from './PanelHeader'
import { detectLocale, getMessages } from '@/i18n'
import type { SelectedElementInfo, ColorFormat } from '@/types'
import type { Locale, I18nMessages } from '@/i18n'

/**
 * Side Panel 应用组件
 * 显示选中元素的详细信息
 */
export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [locale, setLocale] = useState<Locale>(detectLocale())
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(null)
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX/HEXA')
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'document',
    'box-model',
    'css',
    'text-content',
    'colors',
    'typography',
    'assets',
  ])
  const currentTabIdRef = useRef<number | null>(null)

  // 获取翻译
  const t: I18nMessages = getMessages(locale)

  // 请求默认的 html 元素信息
  const requestDefaultHtmlInfo = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_HTML_ELEMENT_INFO' })
      }
    })
  }, [])

  // 加载主题、语言和元素信息
  useEffect(() => {
    // 获取当前激活的 tab ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        currentTabIdRef.current = tabId
        const storageKey = `selectedElementInfo_${tabId}`

        // 获取初始状态
        chrome.storage.local.get(['theme', 'locale', storageKey], (result) => {
          if (result.theme === 'light' || result.theme === 'dark') {
            setTheme(result.theme)
          }
          if (result.locale === 'en' || result.locale === 'zh') {
            setLocale(result.locale)
          }
          const elementData = result[storageKey]
          if (elementData && typeof elementData === 'object' && 'selector' in elementData) {
            setElementInfo(elementData as SelectedElementInfo)
          } else {
            // 没有选中元素，请求 html 元素信息作为默认
            requestDefaultHtmlInfo()
          }
        })
      }
    })

    // 监听 storage 变化
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      namespace: string
    ) => {
      if (namespace !== 'local') return

      if (changes.theme) {
        const newTheme = changes.theme.newValue
        if (newTheme === 'light' || newTheme === 'dark') {
          setTheme(newTheme)
        }
      }

      if (changes.locale) {
        const newLocale = changes.locale.newValue
        if (newLocale === 'en' || newLocale === 'zh') {
          setLocale(newLocale)
        }
      }

      // 检查当前 tab 的 selectedElementInfo 变化
      const tabId = currentTabIdRef.current
      if (tabId) {
        const storageKey = `selectedElementInfo_${tabId}`
        if (changes[storageKey]) {
          const newValue = changes[storageKey].newValue
          if (newValue && typeof newValue === 'object' && 'selector' in newValue) {
            setElementInfo(newValue as SelectedElementInfo)
          } else {
            // 选中被清除，请求默认 html 信息
            requestDefaultHtmlInfo()
          }
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [requestDefaultHtmlInfo])

  // 应用主题
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  // 切换区域展开状态
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // 发送消息到 content script 选择父/子元素
  const handleSelectParent = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SELECT_PARENT' })
      }
    })
  }, [])

  const handleSelectChild = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SELECT_CHILD' })
      }
    })
  }, [])

  const canSelectParent = !!(elementInfo?.ancestors && elementInfo.ancestors.length > 0)
  const canSelectChild = !!(elementInfo?.children && elementInfo.children.length > 0)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 头部 */}
      <PanelHeader elementInfo={elementInfo} />

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {elementInfo ? (
          <>
            <DocumentTree
              title={t.sidepanel.documentTree}
              selector={elementInfo.selector}
              ancestors={elementInfo.ancestors}
              children={elementInfo.children}
              expanded={expandedSections.includes('document')}
              onToggle={() => toggleSection('document')}
              onSelectParent={handleSelectParent}
              onSelectChild={handleSelectChild}
              canSelectParent={canSelectParent}
              canSelectChild={canSelectChild}
            />
            <BoxModel
              title={t.sidepanel.boxModel}
              info={elementInfo.boxModel}
              expanded={expandedSections.includes('box-model')}
              onToggle={() => toggleSection('box-model')}
            />
            <CSSProperties
              title={t.sidepanel.cssProperties}
              styles={elementInfo.computedStyles}
              expanded={expandedSections.includes('css')}
              onToggle={() => toggleSection('css')}
            />
            <TextContent
              title={t.sidepanel.textContent}
              text={elementInfo.textContent}
              expanded={expandedSections.includes('text-content')}
              onToggle={() => toggleSection('text-content')}
              t={t.sidepanel}
            />
            <ColorsList
              title={t.sidepanel.colors}
              colors={elementInfo.colors}
              colorFormat={colorFormat}
              onFormatChange={setColorFormat}
              expanded={expandedSections.includes('colors')}
              onToggle={() => toggleSection('colors')}
              t={t.sidepanel}
            />
            <TypographyList
              title={t.sidepanel.typography}
              typography={elementInfo.typography}
              expanded={expandedSections.includes('typography')}
              onToggle={() => toggleSection('typography')}
              t={t.sidepanel}
            />
            <AssetsList
              title={t.sidepanel.assets}
              assets={elementInfo.assets}
              expanded={expandedSections.includes('assets')}
              onToggle={() => toggleSection('assets')}
              t={t.sidepanel}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-8 min-h-[300px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  <path d="m13 13 6 6" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">
                {t.sidepanel.noElementSelected}
              </p>
              <p className="text-muted-foreground/60 text-xs mt-2">
                {t.sidepanel.useInspector}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 底部快捷键提示 */}
      <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{t.sidepanel.shortcuts}</span>
          <span>{t.sidepanel.version}</span>
        </div>
      </div>
    </div>
  )
}
