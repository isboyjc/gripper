import {
  ChevronUp,
  ChevronDown,
  Pointer,
  Hand,
  Search,
  Pipette,
  PanelRight,
  Pause,
  Play,
  Power,
  Minus,
} from 'lucide-react'
import type { Tool, ToolId } from '@/types'

/**
 * 工具配置列表
 */
export const tools: Tool[] = [
  // 导航组
  {
    id: 'select-parent',
    label: 'selectParent',
    icon: ChevronUp,
    shortcut: '↑',
    group: 'navigation',
  },
  {
    id: 'select-child',
    label: 'selectChild',
    icon: ChevronDown,
    shortcut: '↓',
    group: 'navigation',
  },

  // 工具组
  {
    id: 'inspector',
    label: 'inspector',
    icon: Pointer,  // 审查元素使用 pointer 图标
    shortcut: 'V',
    toggle: true,
    group: 'tools',
  },
  {
    id: 'inspect-all',
    label: 'inspectAll',
    icon: Hand,  // 全局审查使用 hand 图标
    shortcut: 'A',
    toggle: true,
    group: 'tools',
  },
  {
    id: 'search',
    label: 'search',
    icon: Search,
    shortcut: 'F',
    toggle: true,
    group: 'tools',
  },
  {
    id: 'eyedropper',
    label: 'eyedropper',
    icon: Pipette,
    shortcut: 'I',
    toggle: true,
    group: 'tools',
  },

  // 视图组
  {
    id: 'sidepanel',
    label: 'sidepanel',
    icon: PanelRight,
    shortcut: 'S',
    group: 'view',
  },

  // 控制组
  {
    id: 'pause',
    label: 'pause',
    icon: Pause,
    shortcut: 'P',
    toggle: true,
    group: 'control',
  },
  {
    id: 'minimize',
    label: 'minimize',
    icon: Minus,
    group: 'control',
  },
  {
    id: 'power',
    label: 'close',
    icon: Power,
    shortcut: 'Escape',
    group: 'control',
  },
]

export function getToolById(id: ToolId): Tool | undefined {
  return tools.find((tool) => tool.id === id)
}

export function getToolsByGroup(group: Tool['group']): Tool[] {
  return tools.filter((tool) => tool.group === group)
}

export function getPausePlayIcon(isPaused: boolean) {
  return isPaused ? Play : Pause
}
