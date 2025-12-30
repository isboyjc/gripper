import { cn } from '@/lib/utils'
import { useSidePanelStore } from '@/stores/sidePanelStore'
import { detectLocale, getMessages } from '@/i18n'
import type { I18nMessages } from '@/i18n'
import { PanelHeader } from './PanelHeader'
import {
  DocumentTree,
  BoxModel,
  CSSProperties,
  ColorsList,
  TypographyList,
  AssetsList,
} from './sections'

/**
 * 侧边栏面板组件
 */
export function SidePanel() {
  const { isOpen, selectedElement, elementInfo } = useSidePanelStore()
  const t: I18nMessages = getMessages(detectLocale())

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed top-0 right-0 z-[999998]',
        'w-[360px] h-screen',
        'bg-sidebar/98 backdrop-blur-xl',
        'border-l border-sidebar-border',
        'shadow-lg',
        'flex flex-col overflow-hidden',
        'animate-in slide-in-from-right duration-300'
      )}
      role="complementary"
      aria-label="Element Info Panel"
    >
      {/* 头部 */}
      <PanelHeader element={selectedElement} info={elementInfo} t={t.sidepanel} />

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedElement && elementInfo ? (
          <>
            <DocumentTree element={selectedElement} />
            <BoxModel info={elementInfo.boxModel} />
            <CSSProperties styles={elementInfo.computedStyles} />
            <ColorsList colors={elementInfo.colors} t={t.sidepanel} />
            <TypographyList typography={elementInfo.typography} />
            <AssetsList assets={elementInfo.assets} t={t.sidepanel} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                {t.sidepanel.noElementSelected}
              </p>
              <p className="text-muted-foreground/60 text-xs mt-2">
                {t.sidepanel.useInspector}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
