import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，使用 tailwind-merge 处理类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * 格式化像素值
 */
export function formatPx(value: number): string {
  return `${value}px`
}

/**
 * 解析像素值
 */
export function parsePx(value: string): number {
  return parseFloat(value.replace('px', '')) || 0
}

/**
 * 获取扩展版本号
 * @returns 版本号字符串，例如 "v1.0.2"
 */
export function getExtensionVersion(): string {
  try {
    const version = chrome.runtime.getManifest().version
    return `v${version}`
  } catch (error) {
    console.error('Failed to get extension version:', error)
    return 'v1.0.0' // 降级返回默认版本
  }
}
