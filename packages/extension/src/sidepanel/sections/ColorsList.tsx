import { Check } from 'lucide-react'
import { CollapsibleSection, ColorSwatch } from '../components'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'
import type { ColorInfo, ColorFormat } from '@/types'
import type { I18nMessages } from '@/i18n'

interface ColorsListProps {
  title?: string
  colors?: ColorInfo[]
  colorFormat: ColorFormat
  onFormatChange: (format: ColorFormat) => void
  expanded: boolean
  onToggle: () => void
  t?: I18nMessages['sidepanel']
}

/**
 * 颜色格式选择器
 */
function FormatSelector({
  value,
  onChange,
}: {
  value: ColorFormat
  onChange: (format: ColorFormat) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ColorFormat)}
      className={cn(
        'text-xs px-2 py-1 rounded',
        'bg-muted border border-border',
        'text-foreground',
        'focus:outline-none focus:ring-1 focus:ring-ring'
      )}
    >
      <option value="HEX/HEXA">HEX/HEXA</option>
      <option value="RGB/RGBA">RGB/RGBA</option>
      <option value="HSL/HSLA">HSL/HSLA</option>
    </select>
  )
}

/**
 * 单个颜色项
 */
function ColorItem({ color, value }: { color: ColorInfo; value: string }) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5',
        'bg-muted rounded-md',
        'border border-border/50',
        'hover:border-border transition-colors',
        'text-left'
      )}
      title={value}
    >
      <ColorSwatch color={color.hex} size={16} />
      <span className="text-xs font-mono text-foreground flex items-center gap-1">
        {copied ? <Check size={12} className="text-success" /> : value}
      </span>
    </button>
  )
}

/**
 * 去重颜色数组（按 hex 值）
 */
function uniqueColors(colors: ColorInfo[]): ColorInfo[] {
  const seen = new Set<string>()
  return colors.filter(c => {
    if (seen.has(c.hex)) return false
    seen.add(c.hex)
    return true
  })
}

export function ColorsList({
  title = 'Colors',
  colors,
  colorFormat,
  onFormatChange,
  expanded,
  onToggle,
  t,
}: ColorsListProps) {
  if (!colors || colors.length === 0) return null

  // 分类并去重
  const textColors = uniqueColors(colors.filter(
    (c) => c.property === 'text' || c.property === 'color'
  ))
  const bgColors = uniqueColors(colors.filter((c) => c.property === 'background' || c.property === 'background-color'))
  const borderColors = uniqueColors(colors.filter((c) => c.property === 'border' || c.property === 'border-color'))

  const getColorValue = (color: ColorInfo): string => {
    switch (colorFormat) {
      case 'RGB/RGBA':
        return color.rgb
      case 'HSL/HSLA':
        return color.hsl
      default:
        return color.hex
    }
  }

  return (
    <CollapsibleSection
      title={`${colors.length} ${title}`}
      expanded={expanded}
      onToggle={onToggle}
      action={<FormatSelector value={colorFormat} onChange={onFormatChange} />}
    >
      <div className="p-3 space-y-4">
        {textColors.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">{t?.textColors || 'Text'}</h4>
            <div className="flex flex-wrap gap-2">
              {textColors.map((color, i) => (
                <ColorItem key={i} color={color} value={getColorValue(color)} />
              ))}
            </div>
          </div>
        )}

        {bgColors.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">{t?.bgColors || 'Backgrounds'}</h4>
            <div className="flex flex-wrap gap-2">
              {bgColors.map((color, i) => (
                <ColorItem key={i} color={color} value={getColorValue(color)} />
              ))}
            </div>
          </div>
        )}

        {borderColors.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">{t?.borderColors || 'Borders'}</h4>
            <div className="flex flex-wrap gap-2">
              {borderColors.map((color, i) => (
                <ColorItem key={i} color={color} value={getColorValue(color)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}
