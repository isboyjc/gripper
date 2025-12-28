import { useState, useRef, useEffect } from 'react'
import type { Tool } from '@/types'
import type { I18nMessages } from '@/i18n'

interface ToolbarButtonProps {
  tool: Tool
  theme: 'light' | 'dark'
  isActive?: boolean
  onClick: () => void
  disabled?: boolean
  t: I18nMessages['toolbar']
}

/**
 * 工具栏按钮组件 - 带 Tooltip
 */
export function ToolbarButton({
  tool,
  theme,
  isActive = false,
  onClick,
  disabled = false,
  t,
}: ToolbarButtonProps) {
  const Icon = tool.icon
  const isDark = theme === 'dark'
  const [showTooltip, setShowTooltip] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  // 获取翻译后的标签
  const label = t[tool.label as keyof typeof t] || tool.label

  const getColor = () => {
    if (disabled) return isDark ? '#71717a' : '#a1a1aa'
    if (isActive) return isDark ? '#ffffff' : '#09090b'
    return isDark ? '#d4d4d8' : '#3f3f46'
  }

  const getBgColor = () => {
    if (isActive) return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
    return 'transparent'
  }

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: getColor(),
    backgroundColor: getBgColor(),
    transition: 'all 120ms ease',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
  }

  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '9999px',
    backgroundColor: '#3b82f6',
  }

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => setShowTooltip(true), 400)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowTooltip(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        style={buttonStyle}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={tool.toggle ? isActive : undefined}
        onMouseEnter={(e) => {
          handleMouseEnter()
          if (!disabled && !isActive) {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
            e.currentTarget.style.color = isDark ? '#ffffff' : '#09090b'
          }
        }}
        onMouseLeave={(e) => {
          handleMouseLeave()
          if (!disabled && !isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = getColor()
          }
        }}
      >
        <Icon size={17} />
        {isActive && tool.toggle && <span style={indicatorStyle} />}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '10px',
            padding: '6px 10px',
            backgroundColor: isDark ? '#27272a' : '#18181b',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 2147483647,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          {label}
          {tool.shortcut && (
            <kbd
              style={{
                padding: '2px 6px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {tool.shortcut}
            </kbd>
          )}
          {/* 箭头 */}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${isDark ? '#27272a' : '#18181b'}`,
            }}
          />
        </div>
      )}
    </div>
  )
}
