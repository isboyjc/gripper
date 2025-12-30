import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { CollapsibleSection } from '../components'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'
import type { I18nMessages } from '@/i18n'

interface TextContentProps {
  title?: string
  text?: string
  expanded: boolean
  onToggle: () => void
  t?: I18nMessages['sidepanel']
}

/**
 * 处理文本，按换行符分割为行
 */
function formatText(text: string): string[] {
  // 按换行符分割为行
  return text
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * 文本内容模块
 */
export function TextContent({ title = 'Text Content', text, expanded, onToggle, t }: TextContentProps) {
  const { copied, copy } = useCopyToClipboard()
  const [showAll, setShowAll] = useState(false)

  if (!text || text.trim().length === 0) return null

  // 格式化文本为段落
  const paragraphs = formatText(text)
  const fullText = paragraphs.join('\n\n')
  const PREVIEW_COUNT = 10
  const displayParagraphs = showAll ? paragraphs : paragraphs.slice(0, PREVIEW_COUNT)
  const hasMore = paragraphs.length > PREVIEW_COUNT

  return (
    <CollapsibleSection
      title={title}
      expanded={expanded}
      onToggle={onToggle}
      action={
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); copy(fullText) }}
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
      <div className="p-3">
        <div
          className={cn(
            'text-sm leading-relaxed',
            'bg-muted rounded-md p-3',
            'text-foreground',
            showAll ? 'max-h-96' : 'max-h-48',
            'overflow-y-auto custom-scrollbar',
            'space-y-2'
          )}
        >
          {displayParagraphs.map((p, i) => (
            <p key={i} className="break-words">{p}</p>
          ))}
        </div>

        {/* 展开/收起按钮 */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors mt-2"
          >
            {showAll
              ? t?.collapse || 'Collapse'
              : `${t?.showAll || 'Show all'} (${paragraphs.length - PREVIEW_COUNT} ${t?.more || 'more'})`
            }
          </button>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          {fullText.length} {t?.characters || 'characters'} · {paragraphs.length} {t?.lines || 'lines'}
        </p>
      </div>
    </CollapsibleSection>
  )
}
