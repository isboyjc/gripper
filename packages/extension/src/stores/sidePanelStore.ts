import { create } from 'zustand'
import type { SelectedElementInfo, ColorFormat } from '@/types'

interface SidePanelState {
  /** 侧边栏是否打开 */
  isOpen: boolean
  /** 侧边栏宽度 */
  width: number
  /** 选中的元素 */
  selectedElement: Element | null
  /** 选中元素的信息 */
  elementInfo: SelectedElementInfo | null
  /** 颜色格式 */
  colorFormat: ColorFormat
  /** 展开的面板 */
  expandedSections: string[]

  /** 切换侧边栏 */
  toggle: () => void
  /** 设置打开状态 */
  setOpen: (value: boolean) => void
  /** 设置宽度 */
  setWidth: (width: number) => void
  /** 设置选中元素 */
  setSelectedElement: (element: Element | null) => void
  /** 设置元素信息 */
  setElementInfo: (info: SelectedElementInfo | null) => void
  /** 设置颜色格式 */
  setColorFormat: (format: ColorFormat) => void
  /** 切换面板展开状态 */
  toggleSection: (sectionId: string) => void
}

export const useSidePanelStore = create<SidePanelState>((set, get) => ({
  isOpen: false,
  width: 360,
  selectedElement: null,
  elementInfo: null,
  colorFormat: 'HEX/HEXA',
  expandedSections: ['box-model', 'css', 'colors'],

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (value) => set({ isOpen: value }),
  setWidth: (width) => set({ width }),
  setSelectedElement: (element) => set({ selectedElement: element }),
  setElementInfo: (info) => set({ elementInfo: info }),
  setColorFormat: (format) => set({ colorFormat: format }),
  toggleSection: (sectionId) => {
    const { expandedSections } = get()
    const isExpanded = expandedSections.includes(sectionId)
    set({
      expandedSections: isExpanded
        ? expandedSections.filter((id) => id !== sectionId)
        : [...expandedSections, sectionId],
    })
  },
}))
