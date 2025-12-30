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
    screenshot: string
    layoutVisualizer: string
    sidepanel: string
    pause: string
    resume: string
    minimize: string
    expand: string
    close: string
  }
  // 截图
  screenshot: {
    capturedBy: string // "Captured by Gripper"
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
    screenshotSettings: string
    screenshotSettingsDesc: string
    showWatermark: string
    includeTimestamp: string
    expandCaptureArea: string
    showGridOverlay: string
    learnMore: string
    version: string
  }
  // 侧边栏
  sidepanel: {
    noElementSelected: string
    useInspector: string
    shortcuts: string
    version: string
    extensionNotEnabled: string
    clickToEnable: string
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
    downloadSelected: string
    showAll: string
    collapse: string
    selectAll: string
    deselectAll: string
    copySelected: string
    locateInPage: string
    preview: string
    copySelector: string
    selectorCopied: string
    copyAllStyles: string
    copySvg: string
    copyBase64: string
    copyUrl: string
    // 颜色相关
    textColors: string
    bgColors: string
    borderColors: string
    // 资产相关
    noPreview: string
    filterAll: string
    filterImage: string
    filterVideo: string
    filterAudio: string
    noAssetsInFilter: string
    // 排版相关
    size: string
    weight: string
    lineHeight: string
    letterSpacing: string
    downloadFont: string
    copyCss: string
    fontNotFound: string
    // 通用
    more: string
    characters: string
    paragraphs: string
    lines: string
  }
  // 搜索
  search: {
    placeholder: string
    previousResult: string
    nextResult: string
    close: string
  }
  // 盒模型
  boxModel: {
    margin: string
    border: string
    padding: string
    content: string
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
      screenshot: 'Screenshot',
      layoutVisualizer: 'Grid/Flex',
      sidepanel: 'Side Panel',
      pause: 'Pause',
      resume: 'Resume',
      minimize: 'Minimize',
      expand: 'Expand',
      close: 'Close',
    },
    screenshot: {
      capturedBy: 'Captured by Gripper',
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
      screenshotSettings: 'Screenshot Settings',
      screenshotSettingsDesc: 'Customize screenshot capture options',
      showWatermark: 'Show watermark',
      includeTimestamp: 'Include timestamp',
      expandCaptureArea: 'Expand capture area',
      showGridOverlay: 'Show grid overlay',
      learnMore: 'Learn More',
      version: 'Version',
    },
    sidepanel: {
      noElementSelected: 'Click an element on the page to view details',
      useInspector: 'Use Inspector (V) to select element',
      shortcuts: 'Shortcuts: V Inspector | S Side Panel',
      version: 'v1.0.0',
      extensionNotEnabled: 'Extension is not enabled on this page',
      clickToEnable: 'Click the extension icon to enable',
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
      downloadSelected: 'Download Selected',
      showAll: 'Show all',
      collapse: 'Collapse',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      copySelected: 'Copy Selected',
      locateInPage: 'Locate in Page',
      preview: 'Preview',
      copySelector: 'Copy Selector',
      selectorCopied: 'Selector Copied',
      copyAllStyles: 'Copy All Styles',
      copySvg: 'Copy SVG',
      copyBase64: 'Copy Base64',
      copyUrl: 'Copy URL',
      // 颜色相关
      textColors: 'Text Colors',
      bgColors: 'Background Colors',
      borderColors: 'Border Colors',
      // 资产相关
      noPreview: 'No preview available',
      filterAll: 'All',
      filterImage: 'Image',
      filterVideo: 'Video',
      filterAudio: 'Audio',
      noAssetsInFilter: 'No assets in this category',
      // 排版相关
      size: 'Size',
      weight: 'Weight',
      lineHeight: 'Line Height',
      letterSpacing: 'Letter Spacing',
      downloadFont: 'Download Font',
      copyCss: 'Copy CSS',
      fontNotFound: 'Font file not found',
      // 通用
      more: 'more',
      characters: 'characters',
      paragraphs: 'paragraphs',
      lines: 'lines',
    },
    search: {
      placeholder: 'Enter selector (e.g. div.class, #id)',
      previousResult: 'Previous',
      nextResult: 'Next',
      close: 'Close',
    },
    boxModel: {
      margin: 'Margin',
      border: 'Border',
      padding: 'Padding',
      content: 'Content',
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
      screenshot: '截图',
      layoutVisualizer: '布局可视化',
      sidepanel: '侧边栏',
      pause: '暂停',
      resume: '恢复',
      minimize: '最小化',
      expand: '展开',
      close: '关闭',
    },
    screenshot: {
      capturedBy: '由 Gripper 截取',
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
      screenshotSettings: '截图设置',
      screenshotSettingsDesc: '自定义截图选项',
      showWatermark: '显示水印',
      includeTimestamp: '包含时间戳',
      expandCaptureArea: '扩展截图区域',
      showGridOverlay: '显示网格覆盖',
      learnMore: '查看更多',
      version: '版本',
    },
    sidepanel: {
      noElementSelected: '在页面上点击元素以查看详情',
      useInspector: '使用检查器 (V) 选择元素',
      shortcuts: '快捷键: V 检查器 | S 侧边栏',
      version: 'v1.0.0',
      extensionNotEnabled: '插件未在此页面启用',
      clickToEnable: '点击插件图标以启用',
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
      downloadSelected: '下载选中',
      showAll: '显示全部',
      collapse: '收起',
      selectAll: '全选',
      deselectAll: '取消全选',
      copySelected: '复制选中',
      locateInPage: '页面定位',
      preview: '预览',
      copySelector: '复制选择器',
      selectorCopied: '选择器已复制',
      copyAllStyles: '复制全部样式',
      copySvg: '复制 SVG',
      copyBase64: '复制 Base64',
      copyUrl: '复制 URL',
      // 颜色相关
      textColors: '文字颜色',
      bgColors: '背景颜色',
      borderColors: '边框颜色',
      // 资产相关
      noPreview: '无法预览',
      filterAll: '全部',
      filterImage: '图片',
      filterVideo: '视频',
      filterAudio: '音频',
      noAssetsInFilter: '此分类下无资源',
      // 排版相关
      size: '字号',
      weight: '字重',
      lineHeight: '行高',
      letterSpacing: '字间距',
      downloadFont: '下载字体',
      copyCss: '复制 CSS',
      fontNotFound: '未找到字体文件',
      // 通用
      more: '更多',
      characters: '个字符',
      paragraphs: '个段落',
      lines: '行',
    },
    search: {
      placeholder: '输入选择器 (例如 div.class, #id)',
      previousResult: '上一个',
      nextResult: '下一个',
      close: '关闭',
    },
    boxModel: {
      margin: '外边距',
      border: '边框',
      padding: '内边距',
      content: '内容',
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
