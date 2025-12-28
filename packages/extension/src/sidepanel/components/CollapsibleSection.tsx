import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  expanded: boolean
  onToggle: () => void
  action?: ReactNode
  children: ReactNode
}

/**
 * 可折叠区域组件
 */
export function CollapsibleSection({
  title,
  expanded,
  onToggle,
  action,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 py-3',
          'hover:bg-accent transition-colors',
          'text-left'
        )}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={16}
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-90'
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

      {expanded && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
