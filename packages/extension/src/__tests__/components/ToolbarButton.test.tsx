import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToolbarButton } from '@/content/ui/Toolbar/ToolbarButton'
import { MousePointer2 } from 'lucide-react'
import type { Tool } from '@/types'
import type { I18nMessages } from '@/i18n'

const mockTool: Tool = {
  id: 'inspector',
  label: 'inspector',
  icon: MousePointer2,
  shortcut: 'V',
  toggle: true,
  group: 'tools',
}

const mockT: I18nMessages['toolbar'] = {
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
}

describe('ToolbarButton', () => {
  it('应该正确渲染按钮', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tool={mockTool} theme="dark" onClick={onClick} t={mockT} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('点击应该触发 onClick', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tool={mockTool} theme="dark" onClick={onClick} t={mockT} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态下点击不触发 onClick', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tool={mockTool} theme="dark" onClick={onClick} disabled t={mockT} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('激活状态应该显示指示器', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tool={mockTool} theme="dark" isActive onClick={onClick} t={mockT} />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-pressed')).toBe('true')
  })

  it('禁用状态应该有正确样式', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tool={mockTool} theme="dark" disabled onClick={onClick} t={mockT} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('亮色主题应该正确渲染', () => {
    const onClick = vi.fn()
    render(<ToolbarButton tool={mockTool} theme="light" onClick={onClick} t={mockT} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
