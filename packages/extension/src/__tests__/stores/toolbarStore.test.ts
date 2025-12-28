import { describe, it, expect, beforeEach } from 'vitest'
import { useToolbarStore, getSystemTheme, getActualTheme } from '@/stores/toolbarStore'

describe('toolbarStore', () => {
  beforeEach(() => {
    useToolbarStore.getState().reset()
  })

  describe('toggleTool', () => {
    it('应该能够激活一个工具', () => {
      const { toggleTool, activeTools } = useToolbarStore.getState()
      
      // 默认 inspector 是激活的
      expect(activeTools).toContain('inspector')
      
      // 切换 eyedropper
      toggleTool('eyedropper')
      expect(useToolbarStore.getState().activeTools).toContain('eyedropper')
    })

    it('应该能够停用一个已激活的工具', () => {
      const { toggleTool } = useToolbarStore.getState()
      
      toggleTool('inspector')
      expect(useToolbarStore.getState().activeTools).not.toContain('inspector')
    })

    it('互斥工具应该只能激活一个', () => {
      const { toggleTool } = useToolbarStore.getState()
      
      // inspector 是默认激活的
      expect(useToolbarStore.getState().activeTools).toContain('inspector')
      
      // 激活 eyedropper 应该停用 inspector
      toggleTool('eyedropper')
      const tools = useToolbarStore.getState().activeTools
      expect(tools).toContain('eyedropper')
      expect(tools).not.toContain('inspector')
    })
  })

  describe('setToolActive', () => {
    it('应该能够设置工具状态', () => {
      const { setToolActive } = useToolbarStore.getState()
      
      setToolActive('eyedropper', true)
      expect(useToolbarStore.getState().activeTools).toContain('eyedropper')
      
      setToolActive('eyedropper', false)
      expect(useToolbarStore.getState().activeTools).not.toContain('eyedropper')
    })
  })

  describe('theme', () => {
    it('应该能够设置主题', () => {
      const { setTheme } = useToolbarStore.getState()
      
      setTheme('dark')
      expect(useToolbarStore.getState().theme).toBe('dark')
      
      setTheme('light')
      expect(useToolbarStore.getState().theme).toBe('light')
      
      setTheme('system')
      expect(useToolbarStore.getState().theme).toBe('system')
    })
  })

  describe('getSystemTheme', () => {
    it('应该返回 light 或 dark', () => {
      const theme = getSystemTheme()
      expect(['light', 'dark']).toContain(theme)
    })
  })

  describe('getActualTheme', () => {
    it('应该正确处理 system 主题', () => {
      const systemTheme = getSystemTheme()
      expect(getActualTheme('system')).toBe(systemTheme)
    })

    it('应该直接返回 light 或 dark 主题', () => {
      expect(getActualTheme('light')).toBe('light')
      expect(getActualTheme('dark')).toBe('dark')
    })
  })

  describe('setMinimized', () => {
    it('应该能够设置最小化状态', () => {
      const { setMinimized } = useToolbarStore.getState()
      
      setMinimized(true)
      expect(useToolbarStore.getState().isMinimized).toBe(true)
      
      setMinimized(false)
      expect(useToolbarStore.getState().isMinimized).toBe(false)
    })
  })

  describe('setEnabled', () => {
    it('应该能够设置启用状态', () => {
      const { setEnabled } = useToolbarStore.getState()
      
      setEnabled(true)
      expect(useToolbarStore.getState().isEnabled).toBe(true)
      
      setEnabled(false)
      expect(useToolbarStore.getState().isEnabled).toBe(false)
    })
  })
})
