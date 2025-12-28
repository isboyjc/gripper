import { CollapsibleSection, CopyButton } from '../components'
import { cn } from '@/lib/utils'

interface CSSPropertiesProps {
  styles?: Record<string, string>
}

/**
 * CSS 值高亮组件
 */
function CSSValue({ value }: { value: string }) {
  // 数字高亮（包括负数）
  if (/^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|deg|s|ms)?$/.test(value)) {
    return <span className="text-warning">{value}</span>
  }
  // 颜色高亮
  if (/^(#|rgb|hsl)/.test(value)) {
    return <span className="text-success">{value}</span>
  }
  // 字符串高亮（字体名等）
  if (value.startsWith('"') || value.startsWith("'")) {
    return <span className="text-success">{value}</span>
  }
  // 关键字
  if (['block', 'flex', 'grid', 'inline', 'none', 'auto', 'inherit', 'initial'].includes(value)) {
    return <span className="text-info">{value}</span>
  }
  return <span className="text-foreground">{value}</span>
}

/**
 * CSS 属性列表组件
 */
export function CSSProperties({ styles }: CSSPropertiesProps) {
  if (!styles || Object.keys(styles).length === 0) return null

  const cssText = Object.entries(styles)
    .map(([prop, value]) => `${prop}: ${value};`)
    .join('\n')

  return (
    <CollapsibleSection
      id="css"
      title="CSS"
      action={<CopyButton text={cssText} />}
    >
      <div className="p-3">
        <pre
          className={cn(
            'text-xs font-mono leading-relaxed',
            'bg-background rounded-md p-3',
            'overflow-x-auto custom-scrollbar'
          )}
        >
          {Object.entries(styles).map(([prop, value], index) => (
            <div key={prop} className="flex">
              <span className="text-muted-foreground select-none w-5 mr-2 text-right">
                {index + 1}
              </span>
              <span>
                <span className="text-info">{prop}</span>
                <span className="text-muted-foreground">: </span>
                <CSSValue value={value} />
                <span className="text-muted-foreground">;</span>
              </span>
            </div>
          ))}
        </pre>
      </div>
    </CollapsibleSection>
  )
}
