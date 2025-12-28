import { describe, it, expect, beforeEach } from 'vitest'
import { useSidePanelStore } from '@/stores/sidePanelStore'

describe('sidePanelStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    useSidePanelStore.setState({
      isOpen: false,
      width: 360,
      selectedElement: null,
      elementInfo: null,
      colorFormat: 'HEX/HEXA',
      expandedSections: ['box-model', 'css', 'colors'],
    })
  })

  describe('toggle', () => {
    it('应该切换侧边栏状态', () => {
      const { toggle } = useSidePanelStore.getState()

      toggle()
      expect(useSidePanelStore.getState().isOpen).toBe(true)

      toggle()
      expect(useSidePanelStore.getState().isOpen).toBe(false)
    })
  })

  describe('setOpen', () => {
    it('应该设置打开状态', () => {
      const { setOpen } = useSidePanelStore.getState()

      setOpen(true)
      expect(useSidePanelStore.getState().isOpen).toBe(true)

      setOpen(false)
      expect(useSidePanelStore.getState().isOpen).toBe(false)
    })
  })

  describe('setWidth', () => {
    it('应该设置宽度', () => {
      const { setWidth } = useSidePanelStore.getState()

      setWidth(400)
      expect(useSidePanelStore.getState().width).toBe(400)
    })
  })

  describe('setColorFormat', () => {
    it('应该设置颜色格式', () => {
      const { setColorFormat } = useSidePanelStore.getState()

      setColorFormat('RGB/RGBA')
      expect(useSidePanelStore.getState().colorFormat).toBe('RGB/RGBA')

      setColorFormat('HSL/HSLA')
      expect(useSidePanelStore.getState().colorFormat).toBe('HSL/HSLA')
    })
  })

  describe('toggleSection', () => {
    it('应该切换面板展开状态', () => {
      const { toggleSection } = useSidePanelStore.getState()

      // 默认展开的面板
      expect(useSidePanelStore.getState().expandedSections).toContain('box-model')

      // 折叠
      toggleSection('box-model')
      expect(useSidePanelStore.getState().expandedSections).not.toContain('box-model')

      // 展开
      toggleSection('box-model')
      expect(useSidePanelStore.getState().expandedSections).toContain('box-model')
    })

    it('应该展开新面板', () => {
      const { toggleSection } = useSidePanelStore.getState()

      toggleSection('typography')
      expect(useSidePanelStore.getState().expandedSections).toContain('typography')
    })
  })
})
