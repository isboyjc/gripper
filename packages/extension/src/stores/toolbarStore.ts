import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ToolId, ThemeMode } from '@/types'
import type { Locale } from '@/i18n'
import { detectLocale } from '@/i18n'

interface ToolbarState {
  activeTools: ToolId[]
  isMinimized: boolean
  theme: ThemeMode
  isEnabled: boolean  // 每个标签页独立，不持久化
  locale: Locale
  isSidePanelOpen: boolean

  toggleTool: (toolId: ToolId) => void
  setToolActive: (toolId: ToolId, active: boolean) => void
  setMinimized: (value: boolean) => void
  setTheme: (theme: ThemeMode) => void
  setEnabled: (value: boolean) => void
  setLocale: (locale: Locale) => void
  setSidePanelOpen: (open: boolean) => void
  reset: () => void
}

/** 互斥工具组 - inspector, inspect-all, eyedropper 同时只能激活一个 */
const EXCLUSIVE_TOOLS: ToolId[] = ['inspector', 'inspect-all', 'eyedropper']

const initialState = {
  activeTools: ['inspector'] as ToolId[],
  isMinimized: false,
  theme: 'system' as ThemeMode,
  isEnabled: false,  // 默认关闭
  locale: detectLocale(),
  isSidePanelOpen: false,
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

export function getActualTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export const useToolbarStore = create<ToolbarState>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleTool: (toolId) => {
        const { activeTools } = get()
        const isActive = activeTools.includes(toolId)

        if (EXCLUSIVE_TOOLS.includes(toolId)) {
          set({
            activeTools: isActive
              ? activeTools.filter((id) => id !== toolId)
              : [...activeTools.filter((id) => !EXCLUSIVE_TOOLS.includes(id)), toolId],
          })
        } else {
          set({
            activeTools: isActive
              ? activeTools.filter((id) => id !== toolId)
              : [...activeTools, toolId],
          })
        }
      },

      setToolActive: (toolId, active) => {
        const { activeTools } = get()
        if (active && !activeTools.includes(toolId)) {
          if (EXCLUSIVE_TOOLS.includes(toolId)) {
            set({
              activeTools: [...activeTools.filter((id) => !EXCLUSIVE_TOOLS.includes(id)), toolId],
            })
          } else {
            set({ activeTools: [...activeTools, toolId] })
          }
        } else if (!active && activeTools.includes(toolId)) {
          set({ activeTools: activeTools.filter((id) => id !== toolId) })
        }
      },

      setMinimized: (value) => set({ isMinimized: value }),
      setTheme: (theme) => set({ theme }),
      setEnabled: (value) => set({ isEnabled: value }),
      setLocale: (locale) => set({ locale }),
      setSidePanelOpen: (open) => set({ isSidePanelOpen: open }),
      reset: () => set({ ...initialState, theme: get().theme, locale: get().locale }),
    }),
    {
      name: 'gripper-toolbar',
      // 只持久化主题和语言，不持久化启用状态
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
      }),
    }
  )
)
