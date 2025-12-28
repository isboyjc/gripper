import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import type { SelectedElementInfo } from '@/types'

interface PanelHeaderProps {
  elementInfo: SelectedElementInfo | null
}

/**
 * 侧边栏头部组件
 */
export function PanelHeader({ elementInfo }: PanelHeaderProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="px-4 py-3 border-b border-border bg-background sticky top-0 z-50">
      {/* Logo 和标题 */}
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-foreground">
          <path fill="currentColor" d="M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025"/>
        </svg>
        <h1 className="font-semibold text-sm">Gripper</h1>
      </div>

      {/* 元素信息 */}
      {elementInfo ? (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground font-mono truncate flex-1">
              {elementInfo.selector}
            </span>
            <button
              type="button"
              onClick={() => copy(elementInfo.selector)}
              className={cn(
                'p-1 rounded',
                'text-muted-foreground',
                'hover:bg-accent hover:text-foreground',
                'transition-colors'
              )}
              title={copied ? '已复制' : '复制选择器'}
            >
              {copied ? (
                <Check size={14} className="text-success" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {elementInfo.boxModel.content.width} × {elementInfo.boxModel.content.height}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          未选中元素
        </div>
      )}
    </div>
  )
}
