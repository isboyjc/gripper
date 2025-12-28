import { Check } from 'lucide-react'
import { CollapsibleSection, ColorSwatch } from '../components'
import { useSidePanelStore } from '@/stores/sidePanelStore'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'
import type { ColorInfo, ColorFormat } from '@/types'

interface ColorsListProps {
  colors?: ColorInfo[]
}

/**
 * 颜色格式选择器
 */
function FormatSelector() {
  const { colorFormat, setColorFormat } = useSidePanelStore()

  return (
    <select
      value={colorFormat}
      onChange={(e) => setColorFormat(e.target.value as ColorFormat)}
      className={cn(
        'text-xs px-2 py-1 rounded',
        'bg-background border border-border',
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
        'bg-background rounded-md',
        'border border-border/50',
        'hover:border-border transition-colors',
        'text-left'
      )}
      title={`点击复制: ${value}`}
    >
      <ColorSwatch color={color.hex} size={16} />
      <span className="text-xs font-mono text-foreground flex items-center gap-1">
        {copied ? (
          <Check size={12} className="text-success" />
        ) : (
          value
        )}
      </span>
    </button>
  )
}

/**
 * 颜色列表组件
 */
export function ColorsList({ colors }: ColorsListProps) {
  const { colorFormat } = useSidePanelStore()

  if (!colors || colors.length === 0) return null

  // 根据属性分组
  const textColors = colors.filter(
    (c) => c.property === 'text' || c.property === 'color'
  )
  const bgColors = colors.filter((c) => c.property === 'background')
  const borderColors = colors.filter((c) => c.property === 'border')

  // 根据格式获取颜色值
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
      id="colors"
      title={`${colors.length} Colors`}
      action={<FormatSelector />}
    >
      <div className="p-3 space-y-4">
        {/* 文字颜色 */}
        {textColors.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">Text</h4>
            <div className="flex flex-wrap gap-2">
              {textColors.map((color, i) => (
                <ColorItem key={i} color={color} value={getColorValue(color)} />
              ))}
            </div>
          </div>
        )}

        {/* 背景颜色 */}
        {bgColors.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">Backgrounds</h4>
            <div className="flex flex-wrap gap-2">
              {bgColors.map((color, i) => (
                <ColorItem key={i} color={color} value={getColorValue(color)} />
              ))}
            </div>
          </div>
        )}

        {/* 边框颜色 */}
        {borderColors.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">Borders</h4>
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
