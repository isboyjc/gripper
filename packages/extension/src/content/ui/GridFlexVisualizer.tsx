import { useEffect, useState, useCallback, useRef } from 'react'

interface GridFlexVisualizerProps {
  isActive: boolean
}

interface LayoutInfo {
  id: number
  element: Element
  rect: DOMRect
  type: 'grid' | 'flex'
  isInline: boolean
  // Grid specific
  gridRows?: number
  gridCols?: number
  gridGap?: { row: number; column: number }
  // Flex specific
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexGap?: number
  itemCount?: number
}

const COLORS = {
  grid: {
    border: '#a855f7',
    line: 'rgba(168, 85, 247, 0.3)',
    label: 'rgba(168, 85, 247, 0.95)',
    text: '#ffffff',
  },
  flex: {
    border: '#10b981',
    axis: 'rgba(16, 185, 129, 0.5)',
    label: 'rgba(16, 185, 129, 0.95)',
    text: '#ffffff',
  },
}

/**
 * 检测元素是否为 Grid 容器
 */
function isGridContainer(element: Element): boolean {
  const style = window.getComputedStyle(element)
  return style.display === 'grid' || style.display === 'inline-grid'
}

/**
 * 检测元素是否为 Flex 容器
 */
function isFlexContainer(element: Element): boolean {
  const style = window.getComputedStyle(element)
  return style.display === 'flex' || style.display === 'inline-flex'
}

/**
 * 获取 Grid 容器信息
 */
function getGridInfo(element: Element, rect: DOMRect, id: number): LayoutInfo | null {
  const style = window.getComputedStyle(element)
  const gridTemplateRows = style.gridTemplateRows
  const gridTemplateColumns = style.gridTemplateColumns

  // 计算行列数
  const rows = gridTemplateRows && gridTemplateRows !== 'none'
    ? gridTemplateRows.split(/\s+/).filter(s => s && s !== 'none').length
    : 0
  const cols = gridTemplateColumns && gridTemplateColumns !== 'none'
    ? gridTemplateColumns.split(/\s+/).filter(s => s && s !== 'none').length
    : 0

  const rowGap = parseFloat(style.rowGap) || 0
  const columnGap = parseFloat(style.columnGap) || 0

  return {
    id,
    element,
    rect,
    type: 'grid',
    isInline: style.display === 'inline-grid',
    gridRows: rows,
    gridCols: cols,
    gridGap: { row: rowGap, column: columnGap },
  }
}

/**
 * 获取 Flex 容器信息
 */
function getFlexInfo(element: Element, rect: DOMRect, id: number): LayoutInfo | null {
  const style = window.getComputedStyle(element)
  const flexDirection = style.flexDirection as LayoutInfo['flexDirection']
  const gap = parseFloat(style.gap) || 0
  const itemCount = Array.from(element.children).filter(child => {
    const childStyle = window.getComputedStyle(child)
    return childStyle.display !== 'none'
  }).length

  return {
    id,
    element,
    rect,
    type: 'flex',
    isInline: style.display === 'inline-flex',
    flexDirection,
    flexGap: gap,
    itemCount,
  }
}

/**
 * Grid/Flexbox 可视化组件
 */
export function GridFlexVisualizer({ isActive }: GridFlexVisualizerProps) {
  const [layouts, setLayouts] = useState<LayoutInfo[]>([])
  const observerRef = useRef<MutationObserver | null>(null)
  const updateTimeoutRef = useRef<number | null>(null)

  const collectLayouts = useCallback(() => {
    if (!isActive) {
      setLayouts([])
      return
    }

    const allLayouts: LayoutInfo[] = []
    let idCounter = 0

    const allElements = document.querySelectorAll('*')

    allElements.forEach((el) => {
      // 跳过插件自身元素
      if (el.closest('#gripper-root')) return
      if (el.closest('#gripper-responsive-wrapper')) return

      // 跳过不可见元素
      const tagName = el.tagName.toLowerCase()
      if (['script', 'style', 'meta', 'link', 'title', 'head', 'noscript', 'br'].includes(tagName)) return
      if (el.hasAttribute('hidden')) return

      const rect = el.getBoundingClientRect()
      if (rect.width < 20 || rect.height < 20) return

      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) return

      // 检测 Grid 或 Flex
      if (isGridContainer(el)) {
        const info = getGridInfo(el, rect, idCounter++)
        if (info) allLayouts.push(info)
      } else if (isFlexContainer(el)) {
        const info = getFlexInfo(el, rect, idCounter++)
        if (info) allLayouts.push(info)
      }
    })

    setLayouts(allLayouts.slice(0, 100))
  }, [isActive])

  // 初始收集和滚动/resize 监听
  useEffect(() => {
    collectLayouts()

    const debouncedUpdate = () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => {
        if (isActive) collectLayouts()
      }, 100)
    }

    window.addEventListener('scroll', debouncedUpdate, true)
    window.addEventListener('resize', debouncedUpdate)

    return () => {
      window.removeEventListener('scroll', debouncedUpdate, true)
      window.removeEventListener('resize', debouncedUpdate)
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [isActive, collectLayouts])

  // MutationObserver 监听动态元素
  useEffect(() => {
    if (!isActive) return

    const observer = new MutationObserver(() => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => {
        collectLayouts()
      }, 300)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    observerRef.current = observer

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [isActive, collectLayouts])

  if (!isActive || layouts.length === 0) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2147483640 }}>
      {layouts.map((layout) => {
        const isGrid = layout.type === 'grid'
        const colors = isGrid ? COLORS.grid : COLORS.flex

        return (
          <div key={`layout-${layout.id}`}>
            {/* 容器边框 */}
            <div
              style={{
                position: 'fixed',
                top: layout.rect.top,
                left: layout.rect.left,
                width: layout.rect.width,
                height: layout.rect.height,
                border: `2px solid ${colors.border}`,
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Grid 线条 */}
            {isGrid && layout.gridRows && layout.gridCols && (
              <>
                {/* 行线 */}
                {Array.from({ length: layout.gridRows + 1 }).map((_, i) => {
                  const y = layout.rect.top + (layout.rect.height / (layout.gridRows || 1)) * i
                  return (
                    <div
                      key={`grid-row-${layout.id}-${i}`}
                      style={{
                        position: 'fixed',
                        top: y,
                        left: layout.rect.left,
                        width: layout.rect.width,
                        height: 0,
                        borderTop: `1px dashed ${COLORS.grid.line}`,
                        pointerEvents: 'none',
                        zIndex: 2147483641,
                      }}
                    />
                  )
                })}

                {/* 列线 */}
                {Array.from({ length: layout.gridCols + 1 }).map((_, i) => {
                  const x = layout.rect.left + (layout.rect.width / (layout.gridCols || 1)) * i
                  return (
                    <div
                      key={`grid-col-${layout.id}-${i}`}
                      style={{
                        position: 'fixed',
                        top: layout.rect.top,
                        left: x,
                        width: 0,
                        height: layout.rect.height,
                        borderLeft: `1px dashed ${COLORS.grid.line}`,
                        pointerEvents: 'none',
                        zIndex: 2147483641,
                      }}
                    />
                  )
                })}
              </>
            )}

            {/* Flex 主轴指示器 */}
            {!isGrid && layout.flexDirection && (
              <>
                {(layout.flexDirection === 'row' || layout.flexDirection === 'row-reverse') && (
                  <div
                    style={{
                      position: 'fixed',
                      top: layout.rect.top + layout.rect.height / 2,
                      left: layout.rect.left + 10,
                      width: layout.rect.width - 20,
                      height: 0,
                      borderTop: `2px solid ${COLORS.flex.axis}`,
                      pointerEvents: 'none',
                      zIndex: 2147483641,
                    }}
                  >
                    {/* 箭头 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: layout.flexDirection === 'row' ? -8 : 'auto',
                        left: layout.flexDirection === 'row-reverse' ? -8 : 'auto',
                        width: 0,
                        height: 0,
                        borderTop: `4px solid transparent`,
                        borderBottom: `4px solid transparent`,
                        borderLeft: layout.flexDirection === 'row' ? `8px solid ${COLORS.flex.axis}` : 'none',
                        borderRight: layout.flexDirection === 'row-reverse' ? `8px solid ${COLORS.flex.axis}` : 'none',
                      }}
                    />
                  </div>
                )}

                {(layout.flexDirection === 'column' || layout.flexDirection === 'column-reverse') && (
                  <div
                    style={{
                      position: 'fixed',
                      top: layout.rect.top + 10,
                      left: layout.rect.left + layout.rect.width / 2,
                      width: 0,
                      height: layout.rect.height - 20,
                      borderLeft: `2px solid ${COLORS.flex.axis}`,
                      pointerEvents: 'none',
                      zIndex: 2147483641,
                    }}
                  >
                    {/* 箭头 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: layout.flexDirection === 'column' ? -8 : 'auto',
                        top: layout.flexDirection === 'column-reverse' ? -8 : 'auto',
                        left: -4,
                        width: 0,
                        height: 0,
                        borderLeft: `4px solid transparent`,
                        borderRight: `4px solid transparent`,
                        borderTop: layout.flexDirection === 'column-reverse' ? `8px solid ${COLORS.flex.axis}` : 'none',
                        borderBottom: layout.flexDirection === 'column' ? `8px solid ${COLORS.flex.axis}` : 'none',
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* 标签 */}
            <div
              style={{
                position: 'fixed',
                top: layout.rect.top - 18,
                left: layout.rect.left,
                padding: '2px 6px',
                backgroundColor: colors.label,
                color: colors.text,
                fontSize: '10px',
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 600,
                lineHeight: '1.4',
                whiteSpace: 'nowrap',
                borderRadius: '2px',
                zIndex: 2147483642,
              }}
            >
              {isGrid
                ? `Grid ${layout.gridRows}×${layout.gridCols}${layout.gridGap && (layout.gridGap.row > 0 || layout.gridGap.column > 0) ? ` gap:${layout.gridGap.row}/${layout.gridGap.column}` : ''}`
                : `Flex ${layout.flexDirection}${layout.flexGap ? ` gap:${layout.flexGap}` : ''} (${layout.itemCount} items)`
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
