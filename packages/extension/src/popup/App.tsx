import { useEffect, useState, useCallback } from 'react'
import { Power, Moon, Sun, Monitor, ExternalLink, Globe, Camera, ChevronDown } from 'lucide-react'
import type { Locale } from '@/i18n'
import { getMessages, detectLocale } from '@/i18n'
import { useScreenshotStore } from '@/stores/screenshotStore'

type ThemeMode = 'light' | 'dark' | 'system'

interface ExtensionState {
  enabled: boolean
  theme: ThemeMode
  locale: Locale
  currentTabId: number | null
}

export function App() {
  const [state, setState] = useState<ExtensionState>({
    enabled: false,
    theme: 'system',
    locale: detectLocale(),
    currentTabId: null,
  })
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')
  const [isScreenshotSettingsExpanded, setIsScreenshotSettingsExpanded] = useState(false)

  const screenshotSettings = useScreenshotStore()
  const t = getMessages(state.locale)

  // 获取当前 tab 的状态
  const fetchTabState = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        const tabId = tab.id
        // 获取该 tab 的状态
        const response = await chrome.runtime.sendMessage({ type: 'GET_STATE', tabId })
        if (response?.success) {
          setState(prev => ({
            ...prev,
            enabled: response.data.enabled ?? false,
            theme: (response.data.theme as ThemeMode) || 'system',
            locale: (response.data.locale as Locale) || detectLocale(),
            currentTabId: tabId,
          }))
        }
      }
    } catch (error) {
      console.error('[Gripper Popup] Failed to get tab state:', error)
    }
  }, [])

  useEffect(() => {
    fetchTabState()

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setCurrentTheme(isDark ? 'dark' : 'light')

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setCurrentTheme(e.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [fetchTabState])

  useEffect(() => {
    const actualTheme = state.theme === 'system' ? currentTheme : state.theme
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(actualTheme)
  }, [state.theme, currentTheme])

  const toggleExtension = async () => {
    if (!state.currentTabId) return

    const newEnabled = !state.enabled
    setState((prev) => ({ ...prev, enabled: newEnabled }))

    try {
      // 通过 background 切换当前 tab 的状态
      await chrome.runtime.sendMessage({
        type: 'TOGGLE_EXTENSION',
        tabId: state.currentTabId,
        payload: newEnabled,
      })

      if (!newEnabled) {
        // 关闭时也关闭侧边栏
        chrome.runtime.sendMessage({ type: 'CLOSE_SIDE_PANEL', tabId: state.currentTabId })
      }
    } catch (error) {
      console.error('[Gripper Popup] Failed to toggle extension:', error)
    }
  }

  const toggleTheme = async () => {
    const themes: ThemeMode[] = ['system', 'light', 'dark']
    const nextTheme = themes[(themes.indexOf(state.theme) + 1) % themes.length]
    setState((prev) => ({ ...prev, theme: nextTheme }))

    try {
      // 通过 background 分发主题变化
      await chrome.runtime.sendMessage({ type: 'THEME_CHANGE', payload: nextTheme })
    } catch (error) {
      console.error('[Gripper Popup] Failed to send theme change:', error)
    }
  }

  const toggleLocale = async () => {
    const newLocale: Locale = state.locale === 'en' ? 'zh' : 'en'
    setState((prev) => ({ ...prev, locale: newLocale }))
    
    // 通过 background 统一分发到所有 tab 和 sidepanel
    chrome.runtime.sendMessage({ type: 'LOCALE_CHANGE', payload: newLocale })
  }

  const getThemeIcon = () => {
    if (state.theme === 'system') return Monitor
    return state.theme === 'dark' ? Moon : Sun
  }

  const getThemeLabel = () => {
    switch (state.theme) {
      case 'system': return t.popup.themeSystem
      case 'light': return t.popup.themeLight
      case 'dark': return t.popup.themeDark
    }
  }

  const ThemeIcon = getThemeIcon()
  const isDark = (state.theme === 'system' ? currentTheme : state.theme) === 'dark'

  const containerStyle: React.CSSProperties = {
    width: '260px',
    backgroundColor: isDark ? '#171717' : '#ffffff',
    color: isDark ? '#fafafa' : '#09090b',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }

  const borderColor = isDark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(228, 228, 231, 0.8)'

  const btnStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isDark ? '#fafafa' : '#09090b',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
  }

  return (
    <div style={containerStyle}>
      {/* 头部 */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
              <path fill={isDark ? '#ffffff' : '#000000'} d="M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025"/>
            </svg>
            <div>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{t.popup.title}</h1>
              <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#a1a1aa' : '#71717a' }}>{t.popup.subtitle}</p>
            </div>
          </div>
          
          <button
            onClick={toggleExtension}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 150ms',
              backgroundColor: state.enabled ? 'rgba(34, 197, 94, 0.15)' : isDark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(244, 244, 245, 0.8)',
              color: state.enabled ? '#22c55e' : isDark ? '#a1a1aa' : '#71717a',
            }}
            title={state.enabled ? t.popup.disabled : t.popup.enabled}
          >
            <Power size={20} />
          </button>
        </div>
      </div>

      {/* 状态 */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: isDark ? '#a1a1aa' : '#71717a' }}>{t.popup.status}</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: state.enabled ? '#22c55e' : isDark ? '#ef4444' : '#dc2626' }}>
          {state.enabled ? t.popup.enabled : t.popup.disabled}
        </span>
      </div>

      {/* 操作 */}
      <div style={{ padding: '6px' }}>
        <button onClick={toggleTheme} style={btnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(63, 63, 70, 0.3)' : 'rgba(244, 244, 245, 0.8)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <ThemeIcon size={16} style={{ color: isDark ? '#a1a1aa' : '#71717a' }} />
          <span style={{ flex: 1 }}>{t.popup.theme}</span>
          <span style={{ fontSize: '12px', color: isDark ? '#71717a' : '#a1a1aa' }}>{getThemeLabel()}</span>
        </button>

        <button onClick={toggleLocale} style={btnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(63, 63, 70, 0.3)' : 'rgba(244, 244, 245, 0.8)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <Globe size={16} style={{ color: isDark ? '#a1a1aa' : '#71717a' }} />
          <span style={{ flex: 1 }}>{t.popup.language}</span>
          <span style={{ fontSize: '12px', color: isDark ? '#71717a' : '#a1a1aa' }}>{state.locale === 'en' ? 'English' : '中文'}</span>
        </button>

        {/* 截图设置折叠面板 */}
        <div style={{ marginTop: '2px' }}>
          <button
            onClick={() => setIsScreenshotSettingsExpanded(!isScreenshotSettingsExpanded)}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(63, 63, 70, 0.3)' : 'rgba(244, 244, 245, 0.8)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Camera size={16} style={{ color: isDark ? '#a1a1aa' : '#71717a' }} />
            <span style={{ flex: 1 }}>{t.popup.screenshotSettings}</span>
            <ChevronDown
              size={14}
              style={{
                color: isDark ? '#71717a' : '#a1a1aa',
                transform: isScreenshotSettingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease'
              }}
            />
          </button>

          {isScreenshotSettingsExpanded && (
            <div style={{
              padding: '8px 14px 12px 42px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: isDark ? '#d4d4d8' : '#3f3f46'
              }}>
                <input
                  type="checkbox"
                  checked={screenshotSettings.showWatermark}
                  onChange={(e) => screenshotSettings.setShowWatermark(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{t.popup.showWatermark}</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: isDark ? '#d4d4d8' : '#3f3f46',
                opacity: screenshotSettings.showWatermark ? 1 : 0.5
              }}>
                <input
                  type="checkbox"
                  checked={screenshotSettings.includeTimestamp}
                  onChange={(e) => screenshotSettings.setIncludeTimestamp(e.target.checked)}
                  disabled={!screenshotSettings.showWatermark}
                  style={{ cursor: screenshotSettings.showWatermark ? 'pointer' : 'not-allowed' }}
                />
                <span>{t.popup.includeTimestamp}</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: isDark ? '#d4d4d8' : '#3f3f46'
              }}>
                <input
                  type="checkbox"
                  checked={screenshotSettings.expandCaptureArea}
                  onChange={(e) => screenshotSettings.setExpandCaptureArea(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{t.popup.expandCaptureArea}</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: isDark ? '#d4d4d8' : '#3f3f46'
              }}>
                <input
                  type="checkbox"
                  checked={screenshotSettings.showGridOverlay}
                  onChange={(e) => screenshotSettings.setShowGridOverlay(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>{t.popup.showGridOverlay}</span>
              </label>
            </div>
          )}
        </div>

        <button
          onClick={() => chrome.tabs.create({ url: 'https://github.com/isboyjc/gripper' })}
          style={btnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(63, 63, 70, 0.3)' : 'rgba(244, 244, 245, 0.8)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <ExternalLink size={16} style={{ color: isDark ? '#a1a1aa' : '#71717a' }} />
          <span>{t.popup.learnMore}</span>
        </button>
      </div>

      {/* 底部 */}
      <div style={{ padding: '8px 16px', borderTop: `1px solid ${borderColor}` }}>
        <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#52525b' : '#a1a1aa', textAlign: 'center' }}>
          {t.popup.version} 1.0.0
        </p>
      </div>
    </div>
  )
}
