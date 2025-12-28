export type Locale = 'en' | 'zh'

export interface Messages {
  nav: {
    features: string
    usage: string
    download: string
  }
  hero: {
    badge: string
    tagline: string
    description: string
    downloadBtn: string
    learnMoreBtn: string
  }
  features: {
    title: string
    subtitle: string
    items: {
      inspector: { title: string; desc: string }
      colorPicker: { title: string; desc: string }
      typography: { title: string; desc: string }
      boxModel: { title: string; desc: string }
      assets: { title: string; desc: string }
      search: { title: string; desc: string }
      sidePanel: { title: string; desc: string }
      shortcuts: { title: string; desc: string }
    }
  }
  usage: {
    title: string
    subtitle: string
    quickStart: string
    steps: {
      install: { title: string; desc: string }
      activate: { title: string; desc: string }
      inspect: { title: string; desc: string }
      sidePanel: { title: string; desc: string }
    }
    shortcuts: string
    shortcutItems: {
      inspector: string
      colorPicker: string
      search: string
      sidePanel: string
      inspectAll: string
      parent: string
      child: string
      pause: string
      close: string
    }
  }
  download: {
    title: string
    subtitle: string
    comingSoon: string
    downloadNow: string
    features: {
      free: string
      noData: string
      openSource: string
    }
  }
  footer: {
    reportIssue: string
    license: string
  }
}

const messages: Record<Locale, Messages> = {
  en: {
    nav: {
      features: 'Features',
      usage: 'Usage',
      download: 'Download',
    },
    hero: {
      badge: 'Free & Open Source',
      tagline: 'DevTools for Designers',
      description: 'A powerful browser extension that helps you inspect elements, pick colors, analyze typography, and export assets with ease.',
      downloadBtn: 'Download Now',
      learnMoreBtn: 'Learn More',
    },
    features: {
      title: 'Powerful Features',
      subtitle: 'Everything you need to inspect and analyze any webpage, all in one elegant toolbar.',
      items: {
        inspector: {
          title: 'Element Inspector',
          desc: 'Click any element to instantly view its CSS properties, dimensions, and computed styles.',
        },
        colorPicker: {
          title: 'Color Picker',
          desc: 'Pick any color from the page with a magnified preview. Automatically copies to clipboard.',
        },
        typography: {
          title: 'Typography Analysis',
          desc: 'Analyze fonts, sizes, weights, line heights, and letter spacing of any text element.',
        },
        boxModel: {
          title: 'Box Model Viewer',
          desc: 'Visualize margin, border, padding, and content dimensions with an interactive box model.',
        },
        assets: {
          title: 'Asset Export',
          desc: 'Export images, SVGs, and other assets directly from the page with one click.',
        },
        search: {
          title: 'Element Search',
          desc: 'Search elements by tag name, class, or ID. Navigate results with keyboard shortcuts.',
        },
        sidePanel: {
          title: 'Side Panel',
          desc: 'View detailed element information in a convenient side panel without leaving the page.',
        },
        shortcuts: {
          title: 'Keyboard Shortcuts',
          desc: 'Boost productivity with intuitive keyboard shortcuts for all major actions.',
        },
      },
    },
    usage: {
      title: 'How to Use',
      subtitle: 'Get started in seconds with an intuitive interface and powerful keyboard shortcuts.',
      quickStart: 'Quick Start',
      steps: {
        install: {
          title: 'Install Extension',
          desc: "Download and install Gripper from your browser's extension store.",
        },
        activate: {
          title: 'Activate on Page',
          desc: 'Click the Gripper icon in toolbar or use keyboard to activate.',
        },
        inspect: {
          title: 'Start Inspecting',
          desc: 'Hover over elements to see highlights, click to select and view details.',
        },
        sidePanel: {
          title: 'Use Side Panel',
          desc: 'Press S to open side panel for detailed element information.',
        },
      },
      shortcuts: 'Keyboard Shortcuts',
      shortcutItems: {
        inspector: 'Toggle Inspector',
        colorPicker: 'Color Picker',
        search: 'Search Element',
        sidePanel: 'Side Panel',
        inspectAll: 'Inspect All',
        parent: 'Select Parent',
        child: 'Select Child',
        pause: 'Pause/Resume',
        close: 'Close Extension',
      },
    },
    download: {
      title: 'Download Gripper',
      subtitle: 'Available for all major browsers. Free and open source forever.',
      comingSoon: 'Coming Soon',
      downloadNow: 'Download Now',
      features: {
        free: 'Free Forever',
        noData: 'No Data Collection',
        openSource: 'Open Source',
      },
    },
    footer: {
      reportIssue: 'Report Issue',
      license: 'MIT License',
    },
  },
  zh: {
    nav: {
      features: '功能',
      usage: '使用指南',
      download: '下载',
    },
    hero: {
      badge: '免费开源',
      tagline: '专为设计师打造的开发工具',
      description: '一款强大的浏览器扩展，帮助你轻松检查元素、拾取颜色、分析排版并导出资源。',
      downloadBtn: '立即下载',
      learnMoreBtn: '了解更多',
    },
    features: {
      title: '强大功能',
      subtitle: '一个优雅的工具栏，满足你检查和分析任何网页的所有需求。',
      items: {
        inspector: {
          title: '元素检查器',
          desc: '点击任意元素，即时查看其 CSS 属性、尺寸和计算样式。',
        },
        colorPicker: {
          title: '取色器',
          desc: '从页面拾取任意颜色，带放大预览，自动复制到剪贴板。',
        },
        typography: {
          title: '排版分析',
          desc: '分析任意文本元素的字体、大小、粗细、行高和字间距。',
        },
        boxModel: {
          title: '盒模型查看器',
          desc: '通过交互式盒模型可视化边距、边框、内边距和内容尺寸。',
        },
        assets: {
          title: '资源导出',
          desc: '一键从页面直接导出图片、SVG 和其他资源。',
        },
        search: {
          title: '元素搜索',
          desc: '按标签名、类名或 ID 搜索元素，用键盘快捷键导航结果。',
        },
        sidePanel: {
          title: '侧边栏',
          desc: '在便捷的侧边栏中查看详细的元素信息，无需离开页面。',
        },
        shortcuts: {
          title: '键盘快捷键',
          desc: '使用直观的键盘快捷键提升效率，涵盖所有主要操作。',
        },
      },
    },
    usage: {
      title: '使用指南',
      subtitle: '直观的界面和强大的键盘快捷键，让你在几秒内快速上手。',
      quickStart: '快速开始',
      steps: {
        install: {
          title: '安装扩展',
          desc: '从浏览器扩展商店下载并安装 Gripper。',
        },
        activate: {
          title: '激活扩展',
          desc: '点击工具栏中的 Gripper 图标或使用键盘快捷键激活。',
        },
        inspect: {
          title: '开始检查',
          desc: '悬停在元素上查看高亮效果，点击选中并查看详情。',
        },
        sidePanel: {
          title: '使用侧边栏',
          desc: '按 S 键打开侧边栏查看详细的元素信息。',
        },
      },
      shortcuts: '键盘快捷键',
      shortcutItems: {
        inspector: '切换检查器',
        colorPicker: '取色器',
        search: '搜索元素',
        sidePanel: '侧边栏',
        inspectAll: '全量审查',
        parent: '选择父级',
        child: '选择子级',
        pause: '暂停/恢复',
        close: '关闭扩展',
      },
    },
    download: {
      title: '下载 Gripper',
      subtitle: '支持所有主流浏览器，永久免费且开源。',
      comingSoon: '即将推出',
      downloadNow: '立即下载',
      features: {
        free: '永久免费',
        noData: '不收集数据',
        openSource: '开源项目',
      },
    },
    footer: {
      reportIssue: '反馈问题',
      license: 'MIT 许可证',
    },
  },
}

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

export function detectLocale(): Locale {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language || ''
    return lang.startsWith('zh') ? 'zh' : 'en'
  }
  return 'en'
}
