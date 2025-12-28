/**
 * 国际化配置
 */

export type Locale = 'en' | 'zh'

export interface I18nMessages {
  // 工具栏
  toolbar: {
    selectParent: string
    selectChild: string
    inspector: string
    inspectAll: string
    search: string
    eyedropper: string
    sidepanel: string
    pause: string
    resume: string
    minimize: string
    expand: string
    close: string
  }
  // 弹出框
  popup: {
    title: string
    subtitle: string
    status: string
    enabled: string
    disabled: string
    theme: string
    themeSystem: string
    themeLight: string
    themeDark: string
    language: string
    learnMore: string
    version: string
  }
  // 侧边栏
  sidepanel: {
    noElementSelected: string
    useInspector: string
    shortcuts: string
    version: string
    // 模块标题
    documentTree: string
    boxModel: string
    cssProperties: string
    textContent: string
    colors: string
    typography: string
    assets: string
    // 按钮和操作
    copy: string
    copied: string
    download: string
    downloadAll: string
    showAll: string
    collapse: string
    // 颜色相关
    textColors: string
    bgColors: string
    borderColors: string
    // 资产相关
    noPreview: string
    filterAll: string
    filterImage: string
    noAssetsInFilter: string
    // 通用
    more: string
    characters: string
    paragraphs: string
  }
  // 提示
  tips: {
    colorCopied: string
    noElementSelected: string
  }
}

const messages: Record<Locale, I18nMessages> = {
  en: {
    toolbar: {
      selectParent: 'Select Parent',
      selectChild: 'Select Child',
      inspector: 'Inspector',
      inspectAll: 'Inspect All',
      search: 'Find Element',
      eyedropper: 'Color Picker',
      sidepanel: 'Side Panel',
      pause: 'Pause',
      resume: 'Resume',
      minimize: 'Minimize',
      expand: 'Expand',
      close: 'Close',
    },
    popup: {
      title: 'Gripper',
      subtitle: 'DevTools for Designers',
      status: 'Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      theme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      language: 'Language',
      learnMore: 'Learn More',
      version: 'Version',
    },
    sidepanel: {
      noElementSelected: 'Click an element on the page to view details',
      useInspector: 'Use Inspector (V) to select element',
      shortcuts: 'Shortcuts: V Inspector | S Side Panel',
      version: 'v0.1.0',
      // 模块标题
      documentTree: 'Document',
      boxModel: 'Box Model',
      cssProperties: 'CSS Properties',
      textContent: 'Text Content',
      colors: 'Colors',
      typography: 'Typography Styles',
      assets: 'Assets',
      // 按钮和操作
      copy: 'Copy',
      copied: 'Copied',
      download: 'Download',
      downloadAll: 'Download All',
      showAll: 'Show all',
      collapse: 'Collapse',
      // 颜色相关
      textColors: 'Text Colors',
      bgColors: 'Background Colors',
      borderColors: 'Border Colors',
      // 资产相关
      noPreview: 'No preview available',
      filterAll: 'All',
      filterImage: 'Image',
      noAssetsInFilter: 'No assets in this category',
      // 通用
      more: 'more',
      characters: 'characters',
      paragraphs: 'paragraphs',
    },
    tips: {
      colorCopied: 'Color copied!',
      noElementSelected: 'No element selected',
    },
  },
  zh: {
    toolbar: {
      selectParent: '选择父级',
      selectChild: '选择子级',
      inspector: '检查器',
      inspectAll: '全量审查',
      search: '查找元素',
      eyedropper: '吸管取色',
      sidepanel: '侧边栏',
      pause: '暂停',
      resume: '恢复',
      minimize: '最小化',
      expand: '展开',
      close: '关闭',
    },
    popup: {
      title: 'Gripper',
      subtitle: '开发设计工具',
      status: '状态',
      enabled: '已启用',
      disabled: '已禁用',
      theme: '主题',
      themeSystem: '跟随系统',
      themeLight: '亮色',
      themeDark: '暗色',
      language: '语言',
      learnMore: '查看更多',
      version: '版本',
    },
    sidepanel: {
      noElementSelected: '在页面上点击元素以查看详情',
      useInspector: '使用检查器 (V) 选择元素',
      shortcuts: '快捷键: V 检查器 | S 侧边栏',
      version: 'v0.1.0',
      // 模块标题
      documentTree: '文档',
      boxModel: '盒模型',
      cssProperties: 'CSS 属性',
      textContent: '文本内容',
      colors: '颜色',
      typography: '排版样式',
      assets: '资源',
      // 按钮和操作
      copy: '复制',
      copied: '已复制',
      download: '下载',
      downloadAll: '全部下载',
      showAll: '显示全部',
      collapse: '收起',
      // 颜色相关
      textColors: '文字颜色',
      bgColors: '背景颜色',
      borderColors: '边框颜色',
      // 资产相关
      noPreview: '无法预览',
      filterAll: '全部',
      filterImage: '图片',
      noAssetsInFilter: '此分类下无资源',
      // 通用
      more: '更多',
      characters: '个字符',
      paragraphs: '个段落',
    },
    tips: {
      colorCopied: '颜色已复制！',
      noElementSelected: '未选中元素',
    },
  },
}

/**
 * 检测浏览器/页面语言
 */
export function detectLocale(): Locale {
  const lang = navigator.language || document.documentElement.lang || 'en'
  return lang.startsWith('zh') ? 'zh' : 'en'
}

/**
 * 获取翻译文本
 */
export function getMessages(locale: Locale): I18nMessages {
  return messages[locale] || messages.en
}

/**
 * 创建 t 函数
 */
export function createT(locale: Locale) {
  const msgs = getMessages(locale)
  return msgs
}
