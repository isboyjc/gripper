import { Copy, Check } from 'lucide-react'
import { CollapsibleSection } from '../components'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'

interface CSSPropertiesProps {
  title?: string
  styles?: Record<string, string>
  expanded: boolean
  onToggle: () => void
}

/**
 * CSS 值高亮组件
 */
function CSSValue({ value }: { value: string }) {
  if (/^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|deg|s|ms)?$/.test(value)) {
    return <span className="text-warning">{value}</span>
  }
  if (/^(#|rgb|hsl)/.test(value)) {
    return <span className="text-success">{value}</span>
  }
  if (value.startsWith('"') || value.startsWith("'")) {
    return <span className="text-success">{value}</span>
  }
  if (['block', 'flex', 'grid', 'inline', 'none', 'auto', 'inherit', 'initial'].includes(value)) {
    return <span className="text-info">{value}</span>
  }
  return <span className="text-foreground">{value}</span>
}

/**
 * CSS 属性列表组件
 */
export function CSSProperties({ title = 'CSS', styles, expanded, onToggle }: CSSPropertiesProps) {
  const { copied, copy } = useCopyToClipboard()

  if (!styles || Object.keys(styles).length === 0) return null

  const cssText = Object.entries(styles)
    .map(([prop, value]) => `${prop}: ${value};`)
    .join('\n')

  return (
    <CollapsibleSection
      title={title}
      expanded={expanded}
      onToggle={onToggle}
      action={
        <button
          type="button"
          onClick={() => copy(cssText)}
          className="p-1 rounded hover:bg-accent"
          title="复制所有样式"
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
            'text-xs font-mono leading-relaxed',
            'bg-muted rounded-md p-3'
          )}
        >
          {Object.entries(styles).map(([prop, value], index) => (
            <div key={prop} className="flex">
              <span className="text-muted-foreground select-none w-5 mr-2 text-right flex-shrink-0">
                {index + 1}
              </span>
              <span className="break-all">
                <span className="text-info">{prop}</span>
                <span className="text-muted-foreground">: </span>
                <CSSValue value={value} />
                <span className="text-muted-foreground">;</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  )
}
