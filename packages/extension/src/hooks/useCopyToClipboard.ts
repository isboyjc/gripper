import { useState, useCallback } from 'react'

interface UseCopyToClipboardReturn {
  /** 是否已复制 */
  copied: boolean
  /** 复制函数 */
  copy: (text: string) => Promise<boolean>
  /** 重置状态 */
  reset: () => void
}

/**
 * 复制到剪贴板的 Hook
 * @param resetDelay 复制成功后重置状态的延迟时间（毫秒），默认 2000ms
 */
export function useCopyToClipboard(resetDelay = 2000): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard API not available')
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)

        // 自动重置状态
        setTimeout(() => {
          setCopied(false)
        }, resetDelay)

        return true
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        setCopied(false)
        return false
      }
    },
    [resetDelay]
  )

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return { copied, copy, reset }
}
