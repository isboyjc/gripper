import { useEffect, useState, useCallback, useMemo, useRef } from 'react'

interface InspectAllProps {
  isActive: boolean
}

interface ElementInfo {
  id: number
  element: Element
  rect: DOMRect
  tagName: string
  className: string
  width: number
  height: number
  parentId: number | null
}

interface GapInfo {
  x1: number
  y1: number
  x2: number
  y2: number
  value: number
  orientation: 'h' | 'v'
  type: 'sibling' | 'parent-child'
}

interface LabelPosition {
  x: number
  y: number
  width: number
  height: number
}

const COLORS = {
  border: '#3b82f6',
  labelBg: 'rgba(59, 130, 246, 0.9)',
  labelText: '#ffffff',
  gapText: '#dc2626',
  gapLine: 'rgba(220, 38, 38, 0.5)',
  parentChildLine: 'rgba(34, 197, 94, 0.5)',
  parentChildText: '#16a34a',
}

function isOverlapping(a: LabelPosition, b: LabelPosition, padding = 2): boolean {
  return !(
    a.x + a.width + padding < b.x ||
    b.x + b.width + padding < a.x ||
    a.y + a.height + padding < b.y ||
    b.y + b.height + padding < a.y
  )
}

/**
 * 计算间隙（兄弟元素和父子元素）
 */
function calculateGaps(elements: ElementInfo[], usedPositions: LabelPosition[]): GapInfo[] {
  const gaps: GapInfo[] = []
  const processed = new Set<string>()

  // 兄弟元素间隙 - 垂直
  const byTop = [...elements].sort((a, b) => a.rect.top - b.rect.top)
  for (let i = 0; i < byTop.length; i++) {
    for (let j = i + 1; j < byTop.length && j < i + 3; j++) {
      const a = byTop[i], b = byTop[j]
      const hOverlap = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left))
      if (hOverlap < 15) continue
      const gap = b.rect.top - a.rect.bottom
      if (gap > 2 && gap < 80) {
        const key = `v-${a.id}-${b.id}`
        if (!processed.has(key)) {
          processed.add(key)
          const midX = Math.max(a.rect.left, b.rect.left) + hOverlap / 2
          const labelPos: LabelPosition = { x: midX - 10, y: a.rect.bottom + gap / 2 - 6, width: 20, height: 12 }
          if (!usedPositions.some(p => isOverlapping(p, labelPos))) {
            usedPositions.push(labelPos)
            gaps.push({ x1: midX, y1: a.rect.bottom, x2: midX, y2: b.rect.top, value: Math.round(gap), orientation: 'v', type: 'sibling' })
          }
        }
        break
      }
    }
  }

  // 兄弟元素间隙 - 水平
  const byLeft = [...elements].sort((a, b) => a.rect.left - b.rect.left)
  for (let i = 0; i < byLeft.length; i++) {
    for (let j = i + 1; j < byLeft.length && j < i + 3; j++) {
      const a = byLeft[i], b = byLeft[j]
      const vOverlap = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top))
      if (vOverlap < 15) continue
      const gap = b.rect.left - a.rect.right
      if (gap > 2 && gap < 80) {
        const key = `h-${a.id}-${b.id}`
        if (!processed.has(key)) {
          processed.add(key)
          const midY = Math.max(a.rect.top, b.rect.top) + vOverlap / 2
          const labelPos: LabelPosition = { x: a.rect.right + gap / 2 - 10, y: midY - 6, width: 20, height: 12 }
          if (!usedPositions.some(p => isOverlapping(p, labelPos))) {
            usedPositions.push(labelPos)
            gaps.push({ x1: a.rect.right, y1: midY, x2: b.rect.left, y2: midY, value: Math.round(gap), orientation: 'h', type: 'sibling' })
          }
        }
        break
      }
    }
  }

  // 父子元素间隙（padding）
  elements.forEach(parent => {
    const children = elements.filter(c => c.parentId === parent.id)
    if (children.length === 0) return

    children.forEach(child => {
      // 上边距（父到子顶部）
      const topGap = child.rect.top - parent.rect.top
      if (topGap > 4 && topGap < 60) {
        const key = `pc-top-${parent.id}-${child.id}`
        if (!processed.has(key)) {
          processed.add(key)
          const midX = child.rect.left + child.rect.width / 2
          const labelPos: LabelPosition = { x: midX - 10, y: parent.rect.top + topGap / 2 - 6, width: 20, height: 12 }
          if (!usedPositions.some(p => isOverlapping(p, labelPos))) {
            usedPositions.push(labelPos)
            gaps.push({ x1: midX, y1: parent.rect.top, x2: midX, y2: child.rect.top, value: Math.round(topGap), orientation: 'v', type: 'parent-child' })
          }
        }
      }

      // 左边距
      const leftGap = child.rect.left - parent.rect.left
      if (leftGap > 4 && leftGap < 60) {
        const key = `pc-left-${parent.id}-${child.id}`
        if (!processed.has(key)) {
          processed.add(key)
          const midY = child.rect.top + child.rect.height / 2
          const labelPos: LabelPosition = { x: parent.rect.left + leftGap / 2 - 10, y: midY - 6, width: 20, height: 12 }
          if (!usedPositions.some(p => isOverlapping(p, labelPos))) {
            usedPositions.push(labelPos)
            gaps.push({ x1: parent.rect.left, y1: midY, x2: child.rect.left, y2: midY, value: Math.round(leftGap), orientation: 'h', type: 'parent-child' })
          }
        }
      }
    })
  })

  return gaps.slice(0, 50)
}

/**
 * 全量审查组件 - 支持动态元素
 */
export function InspectAll({ isActive }: InspectAllProps) {
  const [elements, setElements] = useState<ElementInfo[]>([])
  const observerRef = useRef<MutationObserver | null>(null)
  const updateTimeoutRef = useRef<number | null>(null)

  const collectElements = useCallback(() => {
    if (!isActive) {
      setElements([])
      return
    }

    const allElements: ElementInfo[] = []
    const elementMap = new Map<Element, number>()
    let idCounter = 0

    // 扩展选择器，包含更多元素类型，确保覆盖所有可见元素
    const selector = '*'
    const nodeList = document.querySelectorAll(selector)

    nodeList.forEach((el) => {
      // 跳过插件自身元素
      if (el.closest('#gripper-root')) return
      if (el.closest('#gripper-responsive-wrapper')) return

      // 跳过 script, style, meta 等不可见标签
      const tagName = el.tagName.toLowerCase()
      if (['script', 'style', 'meta', 'link', 'title', 'head', 'noscript', 'br'].includes(tagName)) return

      // 检查元素是否有 hidden 属性
      if (el.hasAttribute('hidden')) return

      const rect = el.getBoundingClientRect()
      // 放宽尺寸限制，捕获更小的元素
      if (rect.width < 10 || rect.height < 10) return
      // 不限制视口范围，捕获所有页面元素（包括视口外的）
      // if (rect.top > window.innerHeight + 100 || rect.bottom < -100) return
      // if (rect.left > window.innerWidth + 100 || rect.right < -100) return

      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) return

      // 检查祖先元素是否有 hidden 属性
      if (el.closest('[hidden]')) return

      const id = idCounter++
      elementMap.set(el, id)

      const className = typeof el.className === 'string' ? el.className.split(' ')[0] || '' : ''

      allElements.push({
        id,
        element: el,
        rect,
        tagName: el.tagName.toLowerCase(),
        className,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        parentId: null,
      })
    })

    // 建立父子关系
    allElements.forEach(info => {
      let parent = info.element.parentElement
      while (parent && parent !== document.body) {
        if (elementMap.has(parent)) {
          info.parentId = elementMap.get(parent)!
          break
        }
        parent = parent.parentElement
      }
    })

    // 增加元素数量限制，确保能显示更多元素
    setElements(allElements.slice(0, 200))
  }, [isActive])

  // 初始收集和滚动/resize 监听
  useEffect(() => {
    collectElements()
    
    const debouncedUpdate = () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => {
        if (isActive) collectElements()
      }, 100)
    }
    
    window.addEventListener('scroll', debouncedUpdate, true)
    window.addEventListener('resize', debouncedUpdate)
    
    return () => {
      window.removeEventListener('scroll', debouncedUpdate, true)
      window.removeEventListener('resize', debouncedUpdate)
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [isActive, collectElements])

  // MutationObserver 监听动态元素
  useEffect(() => {
    if (!isActive) return

    const observer = new MutationObserver(() => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = window.setTimeout(() => {
        collectElements()
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
  }, [isActive, collectElements])

  // 计算标签和间隙
  const { elementLabels, gaps } = useMemo(() => {
    const usedPositions: LabelPosition[] = []
    const elementLabels: Array<{ info: ElementInfo; pos: LabelPosition }> = []

    elements.forEach((info) => {
      const labelWidth = Math.min((info.tagName.length + (info.className ? info.className.length : 0)) * 5.5 + 45, 130)
      const labelHeight = 14
      
      const pos: LabelPosition = {
        x: info.rect.left + 2,
        y: info.rect.top + 2,
        width: labelWidth,
        height: labelHeight,
      }
      
      if (!usedPositions.some(p => isOverlapping(p, pos))) {
        usedPositions.push(pos)
        elementLabels.push({ info, pos })
      }
    })

    const gaps = calculateGaps(elements, usedPositions)
    
    return { elementLabels, gaps }
  }, [elements])

  if (!isActive || elements.length === 0) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2147483640 }}>
      {/* 元素边框 */}
      {elements.map((info) => (
        <div
          key={`border-${info.id}`}
          style={{
            position: 'fixed',
            top: info.rect.top,
            left: info.rect.left,
            width: info.rect.width,
            height: info.rect.height,
            border: `1px solid ${COLORS.border}`,
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
      ))}
      
      {/* 元素标签 */}
      {elementLabels.map(({ info, pos }) => (
        <div
          key={`label-${info.id}`}
          style={{
            position: 'fixed',
            top: pos.y,
            left: pos.x,
            padding: '1px 3px',
            backgroundColor: COLORS.labelBg,
            color: COLORS.labelText,
            fontSize: '8px',
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 500,
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            maxWidth: '130px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            borderRadius: '2px',
            zIndex: 2147483642,
          }}
        >
          {info.tagName} {info.width}×{info.height}
        </div>
      ))}
      
      {/* 间隙标注 */}
      {gaps.map((gap, i) => {
        const isH = gap.orientation === 'h'
        const midX = isH ? (gap.x1 + gap.x2) / 2 : gap.x1
        const midY = isH ? gap.y1 : (gap.y1 + gap.y2) / 2
        const isParentChild = gap.type === 'parent-child'
        const lineColor = isParentChild ? COLORS.parentChildLine : COLORS.gapLine
        const textColor = isParentChild ? COLORS.parentChildText : COLORS.gapText
        
        return (
          <div key={`gap-${i}`}>
            {/* 虚线 */}
            <div
              style={{
                position: 'fixed',
                top: isH ? gap.y1 : Math.min(gap.y1, gap.y2),
                left: isH ? Math.min(gap.x1, gap.x2) : gap.x1,
                width: isH ? Math.abs(gap.x2 - gap.x1) : 0,
                height: isH ? 0 : Math.abs(gap.y2 - gap.y1),
                borderTop: isH ? `1px dashed ${lineColor}` : 'none',
                borderLeft: !isH ? `1px dashed ${lineColor}` : 'none',
                pointerEvents: 'none',
                zIndex: 2147483641,
              }}
            />
            
            {/* 端点 */}
            {isH ? (
              <>
                <div style={{ position: 'fixed', top: gap.y1 - 2, left: gap.x1, width: 1, height: 5, backgroundColor: lineColor, pointerEvents: 'none', zIndex: 2147483641 }} />
                <div style={{ position: 'fixed', top: gap.y2 - 2, left: gap.x2, width: 1, height: 5, backgroundColor: lineColor, pointerEvents: 'none', zIndex: 2147483641 }} />
              </>
            ) : (
              <>
                <div style={{ position: 'fixed', top: gap.y1, left: gap.x1 - 2, width: 5, height: 1, backgroundColor: lineColor, pointerEvents: 'none', zIndex: 2147483641 }} />
                <div style={{ position: 'fixed', top: gap.y2, left: gap.x2 - 2, width: 5, height: 1, backgroundColor: lineColor, pointerEvents: 'none', zIndex: 2147483641 }} />
              </>
            )}
            
            {/* 数值 - 无阴影 */}
            <span
              style={{
                position: 'fixed',
                top: midY - 5,
                left: midX - 8,
                color: textColor,
                fontSize: '9px',
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 600,
                pointerEvents: 'none',
                zIndex: 2147483642,
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '0 2px',
                borderRadius: '1px',
              }}
            >
              {gap.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
