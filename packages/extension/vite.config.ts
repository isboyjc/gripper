import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import webExtension from 'vite-plugin-web-extension'
import path from 'path'
import { readFileSync } from 'fs'

// 浏览器类型
type Browser = 'chrome' | 'firefox' | 'edge'

// 获取目标浏览器
const browser = (process.env.BROWSER || 'chrome') as Browser

// 从 package.json 读取版本号
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
const version = packageJson.version || '1.0.0'

// 通用 manifest 配置
const commonManifest = {
  name: 'Gripper - DevTools for Designers',
  version,
  description: 'A powerful browser extension for developers and designers. Inspect elements, pick colors, analyze typography, and export assets.',
  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
}

// Chrome/Edge MV3 manifest
const chromiumManifest = {
  manifest_version: 3,
  ...commonManifest,
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
    },
    default_title: 'Gripper',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module' as const,
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle' as const,
    },
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  permissions: ['activeTab', 'storage', 'sidePanel', 'scripting', 'downloads'],
  host_permissions: ['<all_urls>'],
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', '*.png', '*.woff', '*.woff2'],
      matches: ['<all_urls>'],
    },
  ],
}

// Firefox MV3 manifest (Firefox 109+)
const firefoxManifest = {
  manifest_version: 3,
  ...commonManifest,
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
    },
    default_title: 'Gripper',
  },
  background: {
    scripts: ['src/background/index.ts'],
    type: 'module' as const,
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle' as const,
    },
  ],
  // Firefox 使用 sidebar_action 替代 side_panel
  sidebar_action: {
    default_panel: 'src/sidepanel/index.html',
    default_title: 'Gripper',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
    },
  },
  permissions: ['activeTab', 'storage', 'scripting', 'downloads'],
  host_permissions: ['<all_urls>'],
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', '*.png', '*.woff', '*.woff2'],
      matches: ['<all_urls>'],
    },
  ],
  browser_specific_settings: {
    gecko: {
      id: 'gripper@sentenceend.com',
      strict_min_version: '112.0',
      // Firefox 数据收集权限声明 - 不收集任何数据
      data_collection_permissions: {
        required: ['none']
      },
    },
  },
}

// 获取对应浏览器的 manifest
function getManifest() {
  switch (browser) {
    case 'firefox':
      return firefoxManifest
    case 'edge':
    case 'chrome':
    default:
      return chromiumManifest
  }
}

// 获取输出目录
function getOutDir() {
  return browser === 'chrome' ? 'dist' : `dist-${browser}`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    webExtension({
      manifest: getManifest,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: getOutDir(),
    emptyOutDir: true,
  },
  define: {
    __BROWSER__: JSON.stringify(browser),
  },
})
