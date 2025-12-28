import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidePanelStore } from '@/stores/sidePanelStore'

interface CollapsibleSectionProps {
  /** 区域 ID */
  id: string
  /** 标题 */
  title: string
  /** 右侧操作区域 */
  action?: ReactNode
  /** 子内容 */
  children: ReactNode
  /** 是否默认展开 */
  defaultOpen?: boolean
}

/**
 * 可折叠区域组件
 */
export function CollapsibleSection({
  id,
  title,
  action,
  children,
}: CollapsibleSectionProps) {
  const { expandedSections, toggleSection } = useSidePanelStore()
  const isOpen = expandedSections.includes(id)

  return (
    <div className="border-b border-sidebar-border">
      {/* 头部 */}
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 py-3',
          'hover:bg-accent transition-colors',
          'text-left'
        )}
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={16}
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-90'
            )}
          />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {action && (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center">
            {action}
          </div>
        )}
      </button>

      {/* 内容 */}
      {isOpen && (
        <div
          id={`section-${id}`}
          className="animate-in slide-in-from-top-2 duration-200"
        >
          {children}
        </div>
      )}
    </div>
  )
}
