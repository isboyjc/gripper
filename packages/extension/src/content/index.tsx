import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useToolbarStore } from '@/stores/toolbarStore'

/**
 * Content Script 入口
 * 使用 Shadow DOM 确保样式隔离，不影响原始页面
 */

let root: Root | null = null
let host: HTMLDivElement | null = null
let shadow: ShadowRoot | null = null
let appContainer: HTMLDivElement | null = null
let styleElement: HTMLStyleElement | null = null

function init() {
  // 检查是否已经注入
  if (document.getElementById('gripper-root')) {
    console.log('[Gripper] Already injected')
    return
  }

  // 创建宿主容器
  host = document.createElement('div')
  host.id = 'gripper-root'
  host.style.display = 'none' // 默认隐藏
  
  // 使用 Shadow DOM 隔离样式
  shadow = host.attachShadow({ mode: 'open' })

  // 检测系统主题
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

  // 注入样式 - 完全隔离，不影响页面
  styleElement = document.createElement('style')
  styleElement.textContent = getStyles(isDarkMode)
  shadow.appendChild(styleElement)

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (styleElement) {
      styleElement.textContent = getStyles(e.matches)
    }
  })

  // 创建应用容器
  appContainer = document.createElement('div')
  appContainer.className = 'gripper-container'
  appContainer.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  shadow.appendChild(appContainer)

  // 注入到页面
  document.body.appendChild(host)

  // 渲染 React 应用（始终渲染，由 App 内部控制显示）
  root = createRoot(appContainer)
  root.render(<App shadowRoot={shadow} />)

  // 每个页面默认关闭状态，等待 background 发送消息来启用
  // 不再从 storage 读取全局 enabled 状态
  useToolbarStore.getState().setEnabled(false)
  hideExtension()
  console.log('[Gripper] Initial state: disabled (per-tab mode)')

  console.log('[Gripper] Injected successfully with Shadow DOM')
}

/**
 * 显示扩展 UI
 */
function showExtension() {
  if (!host) return
  host.style.display = 'block'
  // 同步状态到 Zustand store
  useToolbarStore.getState().setEnabled(true)
  console.log('[Gripper] Extension enabled')
}

/**
 * 隐藏扩展 UI
 */
function hideExtension() {
  if (!host) return
  host.style.display = 'none'
  // 同步状态到 Zustand store
  useToolbarStore.getState().setEnabled(false)
  // 选中元素状态的清除由 background 处理（按 tabId 存储）
  console.log('[Gripper] Extension disabled')
}

/**
 * 监听来自 Popup 或 Background 的消息
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Gripper Content] Received message:', message)
  
  switch (message.type) {
    case 'ENABLE_EXTENSION':
      showExtension()
      sendResponse({ success: true })
      break
      
    case 'DISABLE_EXTENSION':
      hideExtension()
      sendResponse({ success: true })
      break
      
    case 'THEME_CHANGED':
      // 主题变更 - 更新 Zustand store
      if (message.payload?.theme) {
        useToolbarStore.getState().setTheme(message.payload.theme)
      }
      sendResponse({ success: true })
      break
      
    case 'GET_STATUS':
      sendResponse({ 
        success: true, 
        enabled: useToolbarStore.getState().isEnabled
      })
      break
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }
  
  return true // 保持消息通道开放
})

/**
 * 获取样式内容
 */
function getStyles(isDark: boolean): string {
  const colors = isDark ? {
    // 暗色主题
    background: '240 6% 10%',
    foreground: '0 0% 98%',
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',
    border: '240 3.7% 20%',
    primary: '0 0% 98%',
    primaryForeground: '240 5.9% 10%',
  } : {
    // 亮色主题
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    muted: '240 4.8% 95.9%',
    mutedForeground: '240 3.8% 46.1%',
    border: '240 5.9% 90%',
    primary: '240 5.9% 10%',
    primaryForeground: '0 0% 98%',
  }

  return `
    /* 重置样式 - 只在 Shadow DOM 内生效 */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* 主题变量 */
    :host {
      --background: ${colors.background};
      --foreground: ${colors.foreground};
      --muted: ${colors.muted};
      --muted-foreground: ${colors.mutedForeground};
      --border: ${colors.border};
      --primary: ${colors.primary};
      --primary-foreground: ${colors.primaryForeground};
      
      /* 固定的高亮色 - 不受主题影响 */
      --highlight-red: 0 84% 60%;
      --highlight-blue: 217 91% 60%;
      --highlight-yellow: 48 96% 53%;
      --highlight-cyan: 187 85% 53%;
      --highlight-green: 142 71% 45%;
      --highlight-purple: 262 83% 58%;
    }

    .gripper-container {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* 工具栏按钮 */
    .toolbar-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.375rem;
      color: hsl(${colors.mutedForeground});
      transition: all 150ms;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    
    .toolbar-btn:hover {
      background-color: hsl(${colors.muted});
      color: hsl(${colors.foreground});
    }
    
    .toolbar-btn:focus {
      outline: none;
      box-shadow: 0 0 0 2px hsl(${colors.primary} / 0.3);
    }
    
    .toolbar-btn.active {
      background-color: hsl(${colors.muted});
      color: hsl(${colors.foreground});
    }
    
    .toolbar-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* 分隔线 */
    .toolbar-divider {
      width: 1px;
      height: 1.5rem;
      background-color: hsl(${colors.border});
      margin: 0 0.25rem;
    }
    
    /* 激活指示器 */
    .active-indicator {
      position: absolute;
      bottom: 0.25rem;
      left: 50%;
      transform: translateX(-50%);
      width: 0.25rem;
      height: 0.25rem;
      border-radius: 9999px;
      background-color: hsl(var(--highlight-blue));
    }
  `
}

// 等待 DOM 加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
