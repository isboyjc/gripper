import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 检测用户当前使用的浏览器类型
 * @returns 'chrome' | 'edge' | 'firefox' | 'other'
 */
export function detectBrowser(): 'chrome' | 'edge' | 'firefox' | 'other' {
  if (typeof window === 'undefined') {
    return 'other';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Edge 检测（需要放在 Chrome 之前，因为 Edge 的 userAgent 也包含 Chrome）
  if (userAgent.includes('edg/') || userAgent.includes('edgios/')) {
    return 'edge';
  }

  // Firefox 检测
  if (userAgent.includes('firefox/') || userAgent.includes('fxios/')) {
    return 'firefox';
  }

  // Chrome 检测
  if (userAgent.includes('chrome/') && !userAgent.includes('edg/')) {
    return 'chrome';
  }

  // 默认返回 other
  return 'other';
}
