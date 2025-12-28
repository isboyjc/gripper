import { CollapsibleSection, CopyButton } from '../components'
import type { TypographyInfo } from '@/types'

interface TypographyListProps {
  typography?: TypographyInfo[]
}

/**
 * 字体预览组件
 */
function TypographyPreview({ info }: { info: TypographyInfo }) {
  // 解析字体名称
  const fontName = info.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
  
  // 格式化显示
  const fontSize = info.fontSize
  const fontWeight = info.fontWeight

  return (
    <div className="p-3 bg-background rounded-md border border-border/50">
      {/* 字体信息头部 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          {fontName}
        </span>
        <span className="text-xs text-muted-foreground">
          {fontSize} {fontWeight}
        </span>
      </div>

      {/* 字体预览 */}
      <div
        className="text-2xl tracking-wide py-2"
        style={{
          fontFamily: info.fontFamily,
          fontSize: '24px',
          fontWeight: parseInt(info.fontWeight) || 400,
          lineHeight: 1.2,
          color: info.color,
        }}
      >
        AaBbCcDdEeFfGg
      </div>

      {/* 详细属性 */}
      <div className="mt-2 pt-2 border-t border-border/50">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">行高:</span>
            <span className="text-foreground font-mono">{info.lineHeight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">字间距:</span>
            <span className="text-foreground font-mono">{info.letterSpacing}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 排版样式列表组件
 */
export function TypographyList({ typography }: TypographyListProps) {
  if (!typography || typography.length === 0) return null

  // 生成 CSS 文本
  const cssText = typography
    .map(
      (t) =>
        `font-family: ${t.fontFamily};\nfont-size: ${t.fontSize};\nfont-weight: ${t.fontWeight};\nline-height: ${t.lineHeight};`
    )
    .join('\n\n')

  return (
    <CollapsibleSection
      id="typography"
      title={`${typography.length} Typography Styles`}
      action={<CopyButton text={cssText} />}
    >
      <div className="p-3 space-y-3">
        {typography.map((info, index) => (
          <TypographyPreview key={index} info={info} />
        ))}
      </div>
    </CollapsibleSection>
  )
}
