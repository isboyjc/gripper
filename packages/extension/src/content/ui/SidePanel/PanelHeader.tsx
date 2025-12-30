import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidePanelStore } from '@/stores/sidePanelStore'
import { CopyButton } from './components'
import type { SelectedElementInfo } from '@/types'
import type { I18nMessages } from '@/i18n'

interface PanelHeaderProps {
  element: Element | null
  info: SelectedElementInfo | null
  t?: I18nMessages['sidepanel']
}

/**
 * 侧边栏头部组件
 */
export function PanelHeader({ element, info, t }: PanelHeaderProps) {
  const { setOpen } = useSidePanelStore()

  return (
    <div className="px-4 py-3 border-b border-sidebar-border bg-sidebar">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {element && info ? (
            <>
              {/* 元素选择器 */}
              <span className="text-sm font-medium text-foreground truncate">
                {info.selector}
              </span>
              <CopyButton text={info.selector} size={12} t={t} />
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t?.noElementSelected || 'No element selected'}
            </span>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={cn(
            'p-1 rounded',
            'text-muted-foreground',
            'hover:bg-accent hover:text-foreground',
            'transition-colors'
          )}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* 尺寸信息 */}
      {info && (
        <div className="text-xs text-muted-foreground">
          {info.boxModel.content.width} × {info.boxModel.content.height}
        </div>
      )}
    </div>
  )
}
