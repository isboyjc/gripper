import { ChevronRight, Square, SquareStack } from 'lucide-react'
import { CollapsibleSection } from '../components'
import { cn } from '@/lib/utils'

interface DocumentTreeProps {
  element: Element
}

/**
 * 获取元素的 DOM 路径
 */
function getElementPath(element: Element): Element[] {
  const path: Element[] = []
  let current: Element | null = element

  while (current && current !== document.body) {
    path.unshift(current)
    current = current.parentElement
  }

  // 最多显示 5 层
  return path.slice(-5)
}

/**
 * 格式化元素选择器
 */
function formatSelector(element: Element): string {
  const parts: string[] = [element.tagName.toLowerCase()]

  // 类名（最多取前 3 个）
  const classes = Array.from(element.classList).slice(0, 3)
  if (classes.length > 0) {
    parts.push(`.${classes.join('.')}`)
  }

  return parts.join('')
}

/**
 * 文档树组件
 */
export function DocumentTree({ element }: DocumentTreeProps) {
  const path = getElementPath(element)

  return (
    <CollapsibleSection id="document" title="Document">
      <div className="p-3">
        <div className="space-y-1">
          {path.map((el, index) => {
            const isLast = index === path.length - 1
            const selector = formatSelector(el)

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-1 text-xs font-mono',
                  'pl-[calc(theme(spacing.3)*var(--depth))]',
                  isLast ? 'text-foreground' : 'text-muted-foreground'
                )}
                style={{ '--depth': index } as React.CSSProperties}
              >
                {/* 缩进线和图标 */}
                <span className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight size={12} className="text-muted-foreground/50" />
                  )}
                  {isLast ? (
                    <Square size={12} className="text-info" />
                  ) : (
                    <SquareStack size={12} className="text-muted-foreground/70" />
                  )}
                </span>

                {/* 选择器 */}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded',
                    isLast && 'bg-info/10 text-info'
                  )}
                >
                  {selector}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </CollapsibleSection>
  )
}
