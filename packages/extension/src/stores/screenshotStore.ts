import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { ScreenshotSettings } from '@/types'

interface ScreenshotState extends ScreenshotSettings {
  setShowWatermark: (value: boolean) => void
  setIncludeTimestamp: (value: boolean) => void
  setExpandCaptureArea: (value: boolean) => void
  setShowGridOverlay: (value: boolean) => void
  reset: () => void
}

const initialState: ScreenshotSettings = {
  showWatermark: true,
  includeTimestamp: true,
  expandCaptureArea: true,
  showGridOverlay: true,
}

// Chrome Storage adapter for Zustand persist
const chromeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(name)
    return (result[name] as string) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [name]: value })
  },
  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.local.remove(name)
  },
}

export const useScreenshotStore = create<ScreenshotState>()(
  persist(
    (set) => ({
      ...initialState,

      setShowWatermark: (value) => set({ showWatermark: value }),
      setIncludeTimestamp: (value) => set({ includeTimestamp: value }),
      setExpandCaptureArea: (value) => set({ expandCaptureArea: value }),
      setShowGridOverlay: (value) => set({ showGridOverlay: value }),
      reset: () => set(initialState),
    }),
    {
      name: 'gripper-screenshot-settings',
      storage: createJSONStorage(() => chromeStorage),
    }
  )
)
