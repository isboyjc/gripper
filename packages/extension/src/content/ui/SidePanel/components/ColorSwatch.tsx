import { cn } from '@/lib/utils'

interface ColorSwatchProps {
  /** 颜色值（支持任何 CSS 颜色格式） */
  color: string
  /** 尺寸 */
  size?: number
  /** 自定义类名 */
  className?: string
}

/**
 * 颜色色块组件
 */
export function ColorSwatch({ color, size = 16, className }: ColorSwatchProps) {
  return (
    <div
      className={cn(
        'rounded-sm border border-border/50',
        'relative overflow-hidden',
        className
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* 透明度背景棋盘格 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%)
          `,
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
        }}
      />
      {/* 颜色层 */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}
