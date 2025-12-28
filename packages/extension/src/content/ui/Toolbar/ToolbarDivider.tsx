interface ToolbarDividerProps {
  theme: 'light' | 'dark'
}

/**
 * 工具栏分隔线组件
 */
export function ToolbarDivider({ theme }: ToolbarDividerProps) {
  const isDark = theme === 'dark'

  return (
    <div
      style={{
        width: '1px',
        height: '18px',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
        margin: '0 6px', // 更大间距
        flexShrink: 0,
      }}
      role="separator"
      aria-orientation="vertical"
    />
  )
}
