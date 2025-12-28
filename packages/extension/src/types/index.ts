/**
 * 工具 ID 类型
 */
export type ToolId =
  | 'select-parent'
  | 'select-child'
  | 'inspector'
  | 'inspect-all'
  | 'search'
  | 'eyedropper'
  | 'sidepanel'
  | 'pause'
  | 'minimize'
  | 'power'

/**
 * 工具配置
 */
export interface Tool {
  id: ToolId
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  shortcut?: string
  toggle?: boolean
  group?: 'navigation' | 'tools' | 'view' | 'control'
}

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * 元素盒模型信息
 */
export interface BoxModelInfo {
  margin: { top: number; right: number; bottom: number; left: number }
  border: { top: number; right: number; bottom: number; left: number }
  padding: { top: number; right: number; bottom: number; left: number }
  content: { width: number; height: number }
}

/**
 * 颜色信息
 */
export interface ColorInfo {
  name?: string
  hex: string
  rgb: string
  hsl: string
  property: string
  count?: number
}

/**
 * 排版信息
 */
export interface TypographyInfo {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  textAlign?: string
  textTransform?: string
  color?: string
}

/**
 * 资源信息
 */
export interface AssetInfo {
  type: 'image' | 'svg' | 'video' | 'font'
  url: string
  size?: { width: number; height: number }
  fileSize?: number
  content?: string // SVG 内容或 data URL
}

/**
 * 文档节点信息
 */
export interface DocumentNode {
  tagName: string
  id?: string
  className?: string
}

/**
 * 选中元素信息
 */
export interface SelectedElementInfo {
  tagName: string
  className?: string
  id?: string
  selector: string
  dimensions?: { width: number; height: number }
  position?: { x: number; y: number }
  rect?: DOMRect
  boxModel: BoxModelInfo
  computedStyles?: Record<string, string>
  textContent?: string
  colors: ColorInfo[]
  typography: TypographyInfo[]
  assets?: AssetInfo[]
  ancestors?: DocumentNode[]
  children?: DocumentNode[]
}

/**
 * 消息类型
 */
export type MessageType =
  | 'TOGGLE_EXTENSION'
  | 'TOGGLE_TOOL'
  | 'GET_ELEMENT_INFO'
  | 'ELEMENT_SELECTED'
  | 'THEME_CHANGE'
  | 'SETTINGS_UPDATE'

/**
 * 消息结构
 */
export interface Message {
  type: MessageType
  payload?: unknown
}

/**
 * 颜色格式
 */
export type ColorFormat = 'HEX/HEXA' | 'RGB/RGBA' | 'HSL/HSLA'
