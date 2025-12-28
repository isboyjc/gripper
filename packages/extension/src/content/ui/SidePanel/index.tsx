import { cn } from '@/lib/utils'
import { useSidePanelStore } from '@/stores/sidePanelStore'
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
      aria-label="元素信息面板"
    >
      {/* 头部 */}
      <PanelHeader element={selectedElement} info={elementInfo} />

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedElement && elementInfo ? (
          <>
            <DocumentTree element={selectedElement} />
            <BoxModel info={elementInfo.boxModel} />
            <CSSProperties styles={elementInfo.computedStyles} />
            <ColorsList colors={elementInfo.colors} />
            <TypographyList typography={elementInfo.typography} />
            <AssetsList assets={elementInfo.assets} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                在页面上点击元素以查看详情
              </p>
              <p className="text-muted-foreground/60 text-xs mt-2">
                使用检查器工具 (V) 选择元素
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
