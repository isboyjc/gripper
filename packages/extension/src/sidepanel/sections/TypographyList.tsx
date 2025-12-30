import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import { CollapsibleSection } from '../components'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import type { TypographyInfo } from '@/types'
import type { I18nMessages } from '@/i18n'

interface TypographyListProps {
  title?: string
  typography?: TypographyInfo[]
  expanded: boolean
  onToggle: () => void
  t?: I18nMessages['sidepanel']
}

/**
 * 检测文本语言
 */
function detectLanguage(text: string): 'zh' | 'ja' | 'ko' | 'ar' | 'en' {
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
  if (/[\uac00-\ud7af]/.test(text)) return 'ko'
  if (/[\u0600-\u06ff]/.test(text)) return 'ar'
  return 'en'
}

/**
 * 根据语言获取预览文本
 */
function getPreviewText(lang: 'zh' | 'ja' | 'ko' | 'ar' | 'en'): string {
  switch (lang) {
    case 'zh': return '永驻心间 风华正茂'
    case 'ja': return 'こんにちは 世界'
    case 'ko': return '안녕하세요 세계'
    case 'ar': return 'مرحبا بالعالم'
    case 'en':
    default: return 'AaBbCcDdEeFf'
  }
}

/**
 * 检查是否为系统字体
 */
function isSystemFont(fontFamily: string): boolean {
  const systemFonts = [
    'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
    'Helvetica', 'Arial', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
    'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact',
    'Comic Sans MS', 'Courier New', 'Lucida Console', 'ui-monospace', 'ui-sans-serif',
    'ui-serif', 'ui-rounded'
  ]
  const fontLower = fontFamily.toLowerCase().replace(/['"]/g, '').trim()
  return systemFonts.some(sf => fontLower.includes(sf.toLowerCase()))
}

/**
 * 单个字体卡片
 */
function TypographyCard({ info, t }: { info: TypographyInfo; t?: I18nMessages['sidepanel'] }) {
  const { copied: cssCopied, copy: copyCss } = useCopyToClipboard()
  
  const fontName = info.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
  const isSystem = isSystemFont(info.fontFamily)
  
  // 检测页面语言
  const pageText = document.body.innerText.slice(0, 200)
  const lang = detectLanguage(pageText)
  const previewText = getPreviewText(lang)

  const cssText = `font-family: ${info.fontFamily};
font-size: ${info.fontSize};
font-weight: ${info.fontWeight};
line-height: ${info.lineHeight};
letter-spacing: ${info.letterSpacing};`

  const handleDownloadFont = async () => {
    // 尝试获取页面中加载的字体文件
    try {
      const styleSheets = Array.from(document.styleSheets)
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule instanceof CSSFontFaceRule) {
              const fontFamily = rule.style.getPropertyValue('font-family').replace(/['"]/g, '')
              if (fontFamily.toLowerCase().includes(fontName.toLowerCase())) {
                const src = rule.style.getPropertyValue('src')
                const urlMatch = src.match(/url\(["']?([^"')]+)["']?\)/)
                if (urlMatch) {
                  window.open(urlMatch[1], '_blank')
                  return
                }
              }
            }
          }
        } catch { /* Cross-origin stylesheet */ }
      }
      alert(t?.fontNotFound || 'Font file not found')
    } catch (error) {
      console.error('Failed to find font:', error)
    }
  }

  return (
    <div className="p-3 bg-muted rounded-lg border border-border/50">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground truncate max-w-[140px]" title={fontName}>
          {fontName}
        </span>
        <div className="flex items-center gap-1">
          {!isSystem && (
            <button
              onClick={handleDownloadFont}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              title={t?.downloadFont || 'Download Font'}
            >
              <Download size={14} />
            </button>
          )}
          <button
            onClick={() => copyCss(cssText)}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title={t?.copyCss || 'Copy CSS'}
          >
            {cssCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* 预览 - 斜线背景 */}
      <div
        className="py-3 px-2 rounded text-center overflow-hidden text-foreground relative"
        style={{
          fontFamily: info.fontFamily,
          fontSize: '20px',
          fontWeight: parseInt(info.fontWeight) || 400,
          lineHeight: 1.3,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            hsl(var(--muted)) 4px,
            hsl(var(--muted)) 5px
          )`,
          backgroundSize: '10px 10px',
        }}
      >
        {previewText}
      </div>

      {/* 属性列表 - 移除颜色 */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t?.size || 'Size'}</span>
          <span className="text-foreground font-mono">{info.fontSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t?.weight || 'Weight'}</span>
          <span className="text-foreground font-mono">{info.fontWeight}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t?.lineHeight || 'Line Height'}</span>
          <span className="text-foreground font-mono">{info.lineHeight}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t?.letterSpacing || 'Letter Spacing'}</span>
          <span className="text-foreground font-mono">{info.letterSpacing}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * 排版样式列表组件
 */
export function TypographyList({ title = 'Typography Styles', typography, expanded, onToggle, t }: TypographyListProps) {
  // 始终调用 hooks，避免条件渲染问题
  const { copied, copy } = useCopyToClipboard()
  const [showAll, setShowAll] = useState(false)
  
  // 使用 useMemo 处理数据
  const safeTypography = typography || []

  if (safeTypography.length === 0) return null

  const VISIBLE_COUNT = 3
  const hasMore = safeTypography.length > VISIBLE_COUNT
  const visibleItems = showAll ? safeTypography : safeTypography.slice(0, VISIBLE_COUNT)

  const cssText = safeTypography
    .map(
      (t) =>
        `font-family: ${t.fontFamily};\nfont-size: ${t.fontSize};\nfont-weight: ${t.fontWeight};\nline-height: ${t.lineHeight};`
    )
    .join('\n\n')

  return (
    <CollapsibleSection
      title={`${safeTypography.length} ${title}`}
      expanded={expanded}
      onToggle={onToggle}
      action={
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); copy(cssText) }}
          className="p-1 rounded hover:bg-accent"
          title={t?.copy || 'Copy'}
        >
          {copied ? (
            <Check size={14} className="text-success" />
          ) : (
            <Copy size={14} className="text-muted-foreground" />
          )}
        </button>
      }
    >
      <div className="p-3 space-y-3">
        {visibleItems.map((info, index) => (
          <TypographyCard key={index} info={info} t={t} />
        ))}
        
        {hasMore && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {t?.showAll || 'Show all'} ({safeTypography.length - VISIBLE_COUNT} {t?.more || 'more'})
          </button>
        )}
        
        {hasMore && showAll && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {t?.collapse || 'Collapse'}
          </button>
        )}
      </div>
    </CollapsibleSection>
  )
}
