import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { getMessages } from '@/i18n'
import type { Locale } from '@/i18n'

interface ElementSearchProps {
  isActive: boolean
  onClose: () => void
  onSelectElement: (element: Element) => void
  theme: 'light' | 'dark'
  locale?: Locale
}

interface SearchResult {
  element: Element
}

export function ElementSearch({ isActive, onClose, onSelectElement, theme, locale = 'en' }: ElementSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isDark = theme === 'dark'
  const t = getMessages(locale).search

  // 搜索元素 - 支持组合选择器
  const searchElements = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setCurrentIndex(0)
      return
    }

    const q = searchQuery.trim()
    const found: SearchResult[] = []
    
    // 忽略的空白标签
    const ignoreTags = new Set(['script', 'style', 'link', 'meta', 'head', 'noscript', 'br', 'hr'])
    
    // 尝试作为 CSS 选择器直接查询
    try {
      const directMatches = document.querySelectorAll(q)
      directMatches.forEach((el) => {
        if (el.closest('[data-gripper-root]')) return
        const tagName = el.tagName.toLowerCase()
        if (ignoreTags.has(tagName)) return
        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          found.push({ element: el })
        }
      })
    } catch {
      // 不是有效的 CSS 选择器，继续模糊搜索
    }
    
    // 如果直接选择器没有找到结果，进行模糊搜索
    if (found.length === 0) {
      const lowerQ = q.toLowerCase()
      
      document.querySelectorAll('*').forEach((el) => {
        if (el.closest('[data-gripper-root]')) return
        
        const tagName = el.tagName.toLowerCase()
        if (ignoreTags.has(tagName)) return
        
        const id = el.id?.toLowerCase() || ''
        const className = typeof el.className === 'string' ? el.className.toLowerCase() : ''
        
        // 匹配标签名、ID 或类名
        if (tagName.includes(lowerQ) || id.includes(lowerQ) || className.includes(lowerQ)) {
          const rect = el.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            found.push({ element: el })
          }
        }
      })
    }

    setResults(found)
    setCurrentIndex(0)
    
    // 滚动到第一个结果并选中
    if (found.length > 0) {
      found[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      onSelectElement(found[0].element)
    }
  }, [onSelectElement])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => searchElements(query), 300)
    return () => clearTimeout(timer)
  }, [query, searchElements])

  // 聚焦输入框
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  // 切换到上一个/下一个结果
  const goToPrev = useCallback(() => {
    if (results.length === 0) return
    const newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1
    setCurrentIndex(newIndex)
    results[newIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    onSelectElement(results[newIndex].element)
  }, [results, currentIndex, onSelectElement])

  const goToNext = useCallback(() => {
    if (results.length === 0) return
    const newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    results[newIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    onSelectElement(results[newIndex].element)
  }, [results, currentIndex, onSelectElement])

  // 选中当前结果
  const selectCurrent = useCallback(() => {
    if (results.length > 0 && results[currentIndex]) {
      onSelectElement(results[currentIndex].element)
    }
  }, [results, currentIndex, onSelectElement])

  // 键盘事件
  useEffect(() => {
    if (!isActive) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        selectCurrent()
      } else if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault()
        goToNext()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onClose, selectCurrent, goToPrev, goToNext])

  // 清理搜索结果高亮
  useEffect(() => {
    if (!isActive) {
      setResults([])
      setQuery('')
    }
  }, [isActive])

  // 获取元素的实时位置
  const getElementRect = (element: Element) => {
    return element.getBoundingClientRect()
  }

  if (!isActive) return null

  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2147483646,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: isDark ? 'rgba(24, 24, 27, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(63, 63, 70, 0.6)' : 'rgba(228, 228, 231, 0.8)'}`,
    borderRadius: '10px',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.15)',
  }

  const inputStyle: React.CSSProperties = {
    width: '200px',
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: isDark ? 'rgba(39, 39, 42, 0.8)' : 'rgba(244, 244, 245, 0.8)',
    color: isDark ? '#fafafa' : '#18181b',
    border: `1px solid ${isDark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(228, 228, 231, 0.8)'}`,
    borderRadius: '6px',
    outline: 'none',
  }

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    color: isDark ? 'rgba(161, 161, 170, 0.9)' : 'rgba(113, 113, 122, 0.9)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  }

  return (
    <>
      {/* 搜索弹窗 */}
      <div style={popupStyle}>
        <Search size={16} style={{ color: isDark ? '#a1a1aa' : '#71717a' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={t.placeholder}
          style={inputStyle}
        />
        
        {results.length > 0 && (
          <>
            <span style={{ 
              fontSize: '12px', 
              color: isDark ? '#a1a1aa' : '#71717a',
              minWidth: '50px',
              textAlign: 'center'
            }}>
              {currentIndex + 1} / {results.length}
            </span>
            <button
              type="button"
              onClick={goToPrev}
              style={btnStyle}
              title={`${t.previousResult} (Ctrl+↑)`}
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              onClick={goToNext}
              style={btnStyle}
              title={`${t.nextResult} (Ctrl+↓)`}
            >
              <ChevronDown size={16} />
            </button>
          </>
        )}
        
        <button
          type="button"
          onClick={onClose}
          style={btnStyle}
          title={`${t.close} (Esc)`}
        >
          <X size={16} />
        </button>
      </div>

      {/* 搜索结果高亮 - 使用实时位置 */}
      <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 2147483645 }}>
        {results.map((result, index) => {
          const rect = getElementRect(result.element)
          const isCurrent = index === currentIndex
          
          // 只渲染在视口内的元素
          if (rect.bottom < 0 || rect.top > window.innerHeight || 
              rect.right < 0 || rect.left > window.innerWidth) {
            return null
          }
          
          return (
            <div
              key={index}
              style={{
                position: 'fixed',
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                border: `2px solid ${isCurrent ? '#ef4444' : '#3b82f6'}`,
                backgroundColor: isCurrent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                boxSizing: 'border-box',
              }}
            />
          )
        })}
      </div>
    </>
  )
}
