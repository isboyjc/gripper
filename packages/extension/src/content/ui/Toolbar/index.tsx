import { useCallback, useEffect } from 'react'
import { Minus } from 'lucide-react'
import { useToolbarStore } from '@/stores/toolbarStore'
import { tools, getToolsByGroup, getPausePlayIcon } from './tools'
import { ToolbarButton } from './ToolbarButton'
import { ToolbarDivider } from './ToolbarDivider'
import type { ToolId } from '@/types'
import type { I18nMessages } from '@/i18n'

interface ToolbarProps {
  theme: 'light' | 'dark'
  t: I18nMessages['toolbar']
  onDisable: () => void
  onSelectParent: () => void
  onSelectChild: () => void
  canSelectParent: boolean
  canSelectChild: boolean
  isPaused: boolean
  onTogglePause: () => void
  onToggleInspector: () => void
  onToggleEyedropper: () => void
  onToggleInspectAll: () => void
  onToggleSearch: () => void
  isInspectorActive: boolean
  isEyedropperActive: boolean
  isInspectAllActive: boolean
  isSearchActive: boolean
}

export function Toolbar({
  theme,
  t,
  onDisable,
  onSelectParent,
  onSelectChild,
  canSelectParent,
  canSelectChild,
  isPaused,
  onTogglePause,
  onToggleInspector,
  onToggleEyedropper,
  onToggleInspectAll,
  onToggleSearch,
  isInspectorActive,
  isEyedropperActive,
  isInspectAllActive,
  isSearchActive,
}: ToolbarProps) {
  const { activeTools, toggleTool, isMinimized, setMinimized, isSidePanelOpen, setSidePanelOpen } = useToolbarStore()
  const isDark = theme === 'dark'

  const getToolbarStyle = (): React.CSSProperties => ({
    position: 'fixed',
    bottom: isMinimized ? '0.5rem' : '0.75rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: isMinimized ? '4px' : '6px 8px',
    maxWidth: 'calc(100vw - 16px)',
    overflow: 'visible',  // 允许 tooltip 显示
    backgroundColor: isDark ? 'rgba(24, 24, 27, 0.96)' : 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(63, 63, 70, 0.6)' : 'rgba(228, 228, 231, 0.8)'}`,
    borderRadius: isMinimized ? '8px' : '10px',
    boxShadow: isDark ? '0 8px 32px -8px rgba(0, 0, 0, 0.5)' : '0 8px 32px -8px rgba(0, 0, 0, 0.15)',
    transition: 'all 200ms ease',
  })

  const handleToolClick = useCallback(async (toolId: ToolId) => {
    if (isPaused && !['pause', 'minimize', 'power'].includes(toolId)) return

    switch (toolId) {
      case 'select-parent': onSelectParent(); break
      case 'select-child': onSelectChild(); break
      case 'minimize': setMinimized(true); break
      case 'power': onDisable(); break
      case 'pause': onTogglePause(); break
      case 'eyedropper': onToggleEyedropper(); break
      case 'inspect-all': onToggleInspectAll(); break
      case 'search': onToggleSearch(); break
      case 'sidepanel':
        try {
          if (isSidePanelOpen) {
            setSidePanelOpen(false)
          } else {
            chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, (response) => {
              if (response?.success) setSidePanelOpen(true)
            })
          }
        } catch (error) { console.error('[Gripper] Side panel error:', error) }
        break
      case 'inspector':
        onToggleInspector()
        break
      default: toggleTool(toolId)
    }
  }, [toggleTool, setMinimized, onDisable, onSelectParent, onSelectChild, isPaused, onTogglePause, onToggleInspector, onToggleEyedropper, onToggleInspectAll, onToggleSearch, isSidePanelOpen, setSidePanelOpen])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在可编辑元素中（输入框、文本域、contenteditable）
      const target = e.target as HTMLElement
      const isEditable = target?.tagName === 'INPUT' || 
                         target?.tagName === 'TEXTAREA' || 
                         target?.isContentEditable ||
                         target?.closest('[contenteditable="true"]')
      
      // 在可编辑元素中时，不拦截任何快捷键（让用户正常输入）
      if (isEditable) return
      
      // 搜索模式下不触发快捷键（除了 Escape）
      if (isSearchActive && e.key !== 'Escape') return
      
      // Escape 键始终可用 - 关闭插件
      if (e.key === 'Escape') {
        e.preventDefault()
        onDisable()
        return
      }
      
      // 暂停状态下，只允许暂停/恢复快捷键（P键）
      if (isPaused) {
        if (e.key.toUpperCase() === 'P') {
          e.preventDefault()
          handleToolClick('pause')
        }
        // 暂停时不阻断其他按键，让页面正常处理
        return
      }
      
      // 以下是非暂停状态的快捷键处理
      
      // 上下键选择父级/子级
      if (e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation()
        if (canSelectParent) onSelectParent()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault(); e.stopPropagation()
        if (canSelectChild) onSelectChild()
        return
      }

      const key = e.key.toUpperCase()
      const tool = tools.find((t) => t.shortcut?.toUpperCase() === key)
      if (tool) {
        e.preventDefault()
        handleToolClick(tool.id)
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [handleToolClick, canSelectParent, canSelectChild, onSelectParent, onSelectChild, isPaused, onDisable, isSearchActive])

  // 缩小状态 - 吸附在底部的小按钮
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2147483647,
          padding: '2px 12px',
          backgroundColor: isDark ? 'rgba(24, 24, 27, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(63, 63, 70, 0.6)' : 'rgba(228, 228, 231, 0.8)'}`,
          borderBottom: 'none',
          borderRadius: '6px 6px 0 0',
          boxShadow: isDark ? '0 -2px 12px -2px rgba(0, 0, 0, 0.3)' : '0 -2px 12px -2px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setMinimized(false)}
        role="button"
        title={t.expand}
      >
        <Minus size={12} style={{ color: isDark ? '#a1a1aa' : '#71717a' }} />
      </div>
    )
  }

  const navigationTools = getToolsByGroup('navigation')
  const mainTools = getToolsByGroup('tools')
  const viewTools = getToolsByGroup('view')
  const controlTools = getToolsByGroup('control')
  const PauseIcon = getPausePlayIcon(isPaused)

  return (
    <div style={getToolbarStyle()} role="toolbar">
      {navigationTools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          tool={tool}
          theme={theme}
          disabled={isPaused || (tool.id === 'select-parent' ? !canSelectParent : !canSelectChild)}
          onClick={() => handleToolClick(tool.id)}
          t={t}
        />
      ))}

      <ToolbarDivider theme={theme} />

      {mainTools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          tool={tool}
          theme={theme}
          isActive={
            tool.id === 'inspector' ? isInspectorActive :
            tool.id === 'eyedropper' ? isEyedropperActive :
            tool.id === 'inspect-all' ? isInspectAllActive :
            tool.id === 'search' ? isSearchActive :
            activeTools.includes(tool.id)
          }
          disabled={isPaused}
          onClick={() => handleToolClick(tool.id)}
          t={t}
        />
      ))}

      <ToolbarDivider theme={theme} />

      {viewTools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          tool={tool}
          theme={theme}
          isActive={false}  // sidepanel 不需要选中态
          disabled={isPaused}
          onClick={() => handleToolClick(tool.id)}
          t={t}
        />
      ))}

      <ToolbarDivider theme={theme} />

      <ToolbarButton 
        tool={{ ...controlTools.find(t => t.id === 'pause')!, label: isPaused ? 'resume' : 'pause', icon: PauseIcon }} 
        theme={theme} 
        isActive={isPaused} 
        onClick={() => handleToolClick('pause')} 
        t={t}
      />
      <ToolbarButton tool={controlTools.find(t => t.id === 'minimize')!} theme={theme} onClick={() => handleToolClick('minimize')} t={t} />
      <ToolbarButton tool={controlTools.find(t => t.id === 'power')!} theme={theme} onClick={() => handleToolClick('power')} t={t} />
    </div>
  )
}
