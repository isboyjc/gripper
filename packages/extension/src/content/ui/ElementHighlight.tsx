import { useEffect, useState, useMemo } from 'react'

interface ElementHighlightProps {
  hoveredElement: Element | null
  selectedElement: Element | null
}

interface ElementRect {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

interface BoxModelInfo {
  margin: { top: number; right: number; bottom: number; left: number }
  padding: { top: number; right: number; bottom: number; left: number }
}

// 颜色常量
const COLORS = {
  selectBorder: '#ef4444',
  selectLabelBg: '#ef4444',
  hoverBorder: '#3b82f6',
  hoverBg: 'rgba(59, 130, 246, 0.12)',
  hoverLabelBg: '#3b82f6',
  guideLine: '#9ca3af',
  labelText: '#ffffff',
  marginBg: 'rgba(251, 191, 36, 0.25)',
  marginText: '#92400e',
  paddingBg: 'rgba(34, 197, 94, 0.25)',
  paddingText: '#166534',
  distanceBg: '#dc2626',
  distanceText: '#ffffff',
}

function getElementRect(element: Element): ElementRect {
  const rect = element.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  return {
    top: rect.top + scrollY,
    left: rect.left + scrollX,
    width: rect.width,
    height: rect.height,
    right: rect.right + scrollX,
    bottom: rect.bottom + scrollY,
  }
}

function getViewportRect(element: Element): ElementRect {
  const rect = element.getBoundingClientRect()
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom }
}

function getBoxModel(element: Element): BoxModelInfo {
  const computed = window.getComputedStyle(element)
  const parsePx = (value: string): number => parseFloat(value) || 0
  return {
    margin: { top: parsePx(computed.marginTop), right: parsePx(computed.marginRight), bottom: parsePx(computed.marginBottom), left: parsePx(computed.marginLeft) },
    padding: { top: parsePx(computed.paddingTop), right: parsePx(computed.paddingRight), bottom: parsePx(computed.paddingBottom), left: parsePx(computed.paddingLeft) },
  }
}

function getSelector(element: Element): string {
  const tag = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ''
  const classes = Array.from(element.classList).map(c => `.${c}`).join('')
  return `${tag}${id}${classes}`
}

function calculateDistanceLines(selectRect: ElementRect, hoverRect: ElementRect) {
  let horizontal = null
  let vertical = null
  const hoverCenterY = hoverRect.top + hoverRect.height / 2
  const hoverCenterX = hoverRect.left + hoverRect.width / 2

  if (hoverRect.right < selectRect.left) {
    const startX = hoverRect.right, startY = hoverCenterY, endX = selectRect.left
    const value = Math.round(endX - startX)
    if (value > 0) horizontal = { startX, startY, endX, endY: startY, value, labelX: startX + (endX - startX) / 2, labelY: startY }
  } else if (hoverRect.left > selectRect.right) {
    const startX = selectRect.right, startY = hoverCenterY, endX = hoverRect.left
    const value = Math.round(endX - startX)
    if (value > 0) horizontal = { startX, startY, endX, endY: startY, value, labelX: startX + (endX - startX) / 2, labelY: startY }
  }

  if (hoverRect.bottom < selectRect.top) {
    const startY = hoverRect.bottom, startX = hoverCenterX, endY = selectRect.top
    const value = Math.round(endY - startY)
    if (value > 0) vertical = { startX, startY, endX: startX, endY, value, labelX: startX, labelY: startY + (endY - startY) / 2 }
  } else if (hoverRect.top > selectRect.bottom) {
    const startY = selectRect.bottom, startX = hoverCenterX, endY = hoverRect.top
    const value = Math.round(endY - startY)
    if (value > 0) vertical = { startX, startY, endX: startX, endY, value, labelX: startX, labelY: startY + (endY - startY) / 2 }
  }
  return { horizontal, vertical }
}

export function ElementHighlight({ hoveredElement, selectedElement }: ElementHighlightProps) {
  const [hoverRect, setHoverRect] = useState<ElementRect | null>(null)
  const [selectRect, setSelectRect] = useState<ElementRect | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const selectBoxModel = useMemo(() => selectedElement ? getBoxModel(selectedElement) : null, [selectedElement])
  const hoverBoxModel = useMemo(() => {
    if (!hoveredElement || hoveredElement === selectedElement) return null
    return getBoxModel(hoveredElement)
  }, [hoveredElement, selectedElement])

  const distanceLines = useMemo(() => {
    if (!selectRect || !hoverRect) return null
    return calculateDistanceLines(selectRect, hoverRect)
  }, [selectRect, hoverRect])

  useEffect(() => {
    const updateViewport = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    if (!hoveredElement || hoveredElement === selectedElement) { setHoverRect(null); return }
    const updateRect = () => setHoverRect(getElementRect(hoveredElement))
    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => { window.removeEventListener('scroll', updateRect, true); window.removeEventListener('resize', updateRect) }
  }, [hoveredElement, selectedElement])

  useEffect(() => {
    if (!selectedElement) { setSelectRect(null); return }
    const updateRect = () => setSelectRect(getElementRect(selectedElement))
    updateRect()
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => { window.removeEventListener('scroll', updateRect, true); window.removeEventListener('resize', updateRect) }
  }, [selectedElement])

  const edgeDistances = useMemo(() => {
    if (!selectedElement) return null
    const viewRect = getViewportRect(selectedElement)
    return { top: Math.round(viewRect.top), right: Math.round(viewportSize.width - viewRect.right), bottom: Math.round(viewportSize.height - viewRect.bottom), left: Math.round(viewRect.left) }
  }, [selectedElement, viewportSize])

  return (
    <>
      {selectRect && selectedElement && (
        <>
          <GuideLines rect={selectRect} viewportSize={viewportSize} />
          {selectBoxModel && <MarginPaddingOverlay rect={selectRect} boxModel={selectBoxModel} />}
          <SelectHighlight rect={selectRect} element={selectedElement} edgeDistances={edgeDistances} />
        </>
      )}
      {hoverRect && hoveredElement && (
        <>
          <HoverHighlight rect={hoverRect} element={hoveredElement} boxModel={hoverBoxModel} />
          {selectRect && distanceLines && <DistanceLines distance={distanceLines} />}
        </>
      )}
    </>
  )
}

// 标签样式：无圆角，字体稍大
const labelBaseStyle: React.CSSProperties = {
  position: 'absolute',
  padding: '3px 6px',
  color: COLORS.labelText,
  fontSize: '11px',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  lineHeight: '1.4',
  wordBreak: 'break-all',
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  zIndex: 2147483645,
  pointerEvents: 'none',
  borderRadius: 0, // 无圆角
}

// 尺寸标签样式
const sizeBaseStyle: React.CSSProperties = {
  position: 'absolute',
  padding: '2px 5px',
  color: COLORS.labelText,
  fontSize: '10px',
  fontFamily: 'ui-monospace, monospace',
  whiteSpace: 'nowrap',
  lineHeight: '1.2',
  zIndex: 2147483645,
  pointerEvents: 'none',
  borderRadius: 0, // 无圆角
}

function HoverHighlight({ rect, element, boxModel }: { rect: ElementRect; element: Element; boxModel: BoxModelInfo | null }) {
  const selector = getSelector(element)

  return (
    <>
      {boxModel && <MarginPaddingOverlay rect={rect} boxModel={boxModel} isHover />}
      <div style={{
        position: 'absolute', top: rect.top, left: rect.left, width: rect.width, height: rect.height,
        pointerEvents: 'none', zIndex: 2147483640,
        border: `1px solid ${COLORS.hoverBorder}`, backgroundColor: COLORS.hoverBg, boxSizing: 'border-box',
      }} />
      {/* 元素名标签 - 贴合左上角边框 */}
      <div style={{ ...labelBaseStyle, top: rect.top, left: rect.left, maxWidth: Math.min(Math.max(rect.width, 180), 320), backgroundColor: COLORS.hoverLabelBg, transform: 'translateY(-100%)' }}>
        {selector}
      </div>
      {/* 尺寸标签 - 贴合右下角边框，蓝色背景 */}
      <div style={{ ...sizeBaseStyle, top: rect.bottom, left: rect.right, backgroundColor: COLORS.hoverLabelBg, transform: 'translate(-100%, 0)' }}>
        {Math.round(rect.width)} × {Math.round(rect.height)}
      </div>
    </>
  )
}

function SelectHighlight({ rect, element, edgeDistances }: { rect: ElementRect; element: Element; edgeDistances: { top: number; right: number; bottom: number; left: number } | null }) {
  const selector = getSelector(element)
  const stripePattern = `repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(239, 68, 68, 0.15) 2px, rgba(239, 68, 68, 0.15) 4px)`

  return (
    <>
      <div style={{
        position: 'absolute', top: rect.top, left: rect.left, width: rect.width, height: rect.height,
        pointerEvents: 'none', zIndex: 2147483644,
        border: `1px solid ${COLORS.selectBorder}`, backgroundImage: stripePattern, boxSizing: 'border-box',
      }} />
      {/* 元素名标签 - 贴合左上角边框 */}
      <div style={{ ...labelBaseStyle, top: rect.top, left: rect.left, maxWidth: Math.min(Math.max(rect.width, 180), 320), backgroundColor: COLORS.selectLabelBg, transform: 'translateY(-100%)' }}>
        {selector}
      </div>
      {/* 尺寸标签 - 贴合右下角边框，红色背景 */}
      <div style={{ ...sizeBaseStyle, top: rect.bottom, left: rect.right, backgroundColor: COLORS.selectLabelBg, transform: 'translate(-100%, 0)' }}>
        {Math.round(rect.width)} × {Math.round(rect.height)}
      </div>
      {edgeDistances && <EdgeDistanceLabels rect={rect} distances={edgeDistances} />}
    </>
  )
}

function GuideLines({ rect, viewportSize }: { rect: ElementRect; viewportSize: { width: number; height: number } }) {
  const scrollX = window.scrollX, scrollY = window.scrollY
  const pageWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, viewportSize.width)
  const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, viewportSize.height)
  const lineStyle: React.CSSProperties = { position: 'absolute', pointerEvents: 'none', zIndex: 2147483638 }
  const dashedH = { backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.guideLine} 0, ${COLORS.guideLine} 3px, transparent 3px, transparent 6px)` }
  const dashedV = { backgroundImage: `repeating-linear-gradient(180deg, ${COLORS.guideLine} 0, ${COLORS.guideLine} 3px, transparent 3px, transparent 6px)` }

  return (
    <>
      <div style={{ ...lineStyle, top: scrollY, left: rect.left, width: '1px', height: rect.top - scrollY, ...dashedV }} />
      <div style={{ ...lineStyle, top: scrollY, left: rect.right, width: '1px', height: rect.top - scrollY, ...dashedV }} />
      <div style={{ ...lineStyle, top: rect.bottom, left: rect.left, width: '1px', height: pageHeight - rect.bottom, ...dashedV }} />
      <div style={{ ...lineStyle, top: rect.bottom, left: rect.right, width: '1px', height: pageHeight - rect.bottom, ...dashedV }} />
      <div style={{ ...lineStyle, top: rect.top, left: scrollX, width: rect.left - scrollX, height: '1px', ...dashedH }} />
      <div style={{ ...lineStyle, top: rect.bottom, left: scrollX, width: rect.left - scrollX, height: '1px', ...dashedH }} />
      <div style={{ ...lineStyle, top: rect.top, left: rect.right, width: pageWidth - rect.right, height: '1px', ...dashedH }} />
      <div style={{ ...lineStyle, top: rect.bottom, left: rect.right, width: pageWidth - rect.right, height: '1px', ...dashedH }} />
    </>
  )
}

function MarginPaddingOverlay({ rect, boxModel, isHover = false }: { rect: ElementRect; boxModel: BoxModelInfo; isHover?: boolean }) {
  const { margin, padding } = boxModel
  const zBase = isHover ? 2147483639 : 2147483641

  return (
    <>
      {margin.top > 0 && <SpacingBlock top={rect.top - margin.top} left={rect.left} width={rect.width} height={margin.top} value={margin.top} type="margin" zIndex={zBase} />}
      {margin.bottom > 0 && <SpacingBlock top={rect.bottom} left={rect.left} width={rect.width} height={margin.bottom} value={margin.bottom} type="margin" zIndex={zBase} />}
      {margin.left > 0 && <SpacingBlock top={rect.top} left={rect.left - margin.left} width={margin.left} height={rect.height} value={margin.left} type="margin" zIndex={zBase} />}
      {margin.right > 0 && <SpacingBlock top={rect.top} left={rect.right} width={margin.right} height={rect.height} value={margin.right} type="margin" zIndex={zBase} />}
      {padding.top > 0 && <SpacingBlock top={rect.top} left={rect.left} width={rect.width} height={padding.top} value={padding.top} type="padding" zIndex={zBase + 1} />}
      {padding.bottom > 0 && <SpacingBlock top={rect.bottom - padding.bottom} left={rect.left} width={rect.width} height={padding.bottom} value={padding.bottom} type="padding" zIndex={zBase + 1} />}
      {padding.left > 0 && <SpacingBlock top={rect.top + padding.top} left={rect.left} width={padding.left} height={rect.height - padding.top - padding.bottom} value={padding.left} type="padding" zIndex={zBase + 1} />}
      {padding.right > 0 && <SpacingBlock top={rect.top + padding.top} left={rect.right - padding.right} width={padding.right} height={rect.height - padding.top - padding.bottom} value={padding.right} type="padding" zIndex={zBase + 1} />}
    </>
  )
}

function SpacingBlock({ top, left, width, height, value, type, zIndex }: { top: number; left: number; width: number; height: number; value: number; type: 'margin' | 'padding'; zIndex: number }) {
  const isMargin = type === 'margin'
  const showValue = (width >= 18 && height >= 12) || (width >= 12 && height >= 18)
  return (
    <div style={{ position: 'absolute', top, left, width, height, backgroundColor: isMargin ? COLORS.marginBg : COLORS.paddingBg, pointerEvents: 'none', zIndex, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {showValue && value > 0 && <span style={{ fontSize: '9px', fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: isMargin ? COLORS.marginText : COLORS.paddingText }}>{Math.round(value)}</span>}
    </div>
  )
}

function EdgeDistanceLabels({ rect, distances }: { rect: ElementRect; distances: { top: number; right: number; bottom: number; left: number } }) {
  const scrollX = window.scrollX, scrollY = window.scrollY
  const viewTop = rect.top - scrollY, viewLeft = rect.left - scrollX, viewRight = rect.right - scrollX
  const labelStyle: React.CSSProperties = { position: 'fixed', padding: '1px 4px', borderRadius: 0, backgroundColor: COLORS.distanceBg, color: COLORS.distanceText, fontSize: '10px', fontFamily: 'ui-monospace, monospace', fontWeight: 500, whiteSpace: 'nowrap', lineHeight: '1.2', zIndex: 2147483646, pointerEvents: 'none' }
  const lineStyle: React.CSSProperties = { position: 'fixed', backgroundColor: COLORS.distanceBg, pointerEvents: 'none', zIndex: 2147483646 }

  return (
    <>
      {distances.left > 10 && (
        <>
          <div style={{ ...lineStyle, top: viewTop + rect.height / 2, left: 0, width: viewLeft, height: '1px' }} />
          <div style={{ ...labelStyle, top: viewTop + rect.height / 2 - 9, left: viewLeft / 2 - 12 }}>{distances.left}</div>
        </>
      )}
      {distances.top > 10 && (
        <>
          <div style={{ ...lineStyle, top: 0, left: viewLeft + rect.width / 2, width: '1px', height: viewTop }} />
          <div style={{ ...labelStyle, top: viewTop / 2 - 9, left: viewLeft + rect.width / 2 - 12 }}>{distances.top}</div>
        </>
      )}
      {distances.right > 10 && (
        <>
          <div style={{ ...lineStyle, top: viewTop + rect.height / 2, left: viewRight, width: distances.right, height: '1px' }} />
          <div style={{ ...labelStyle, top: viewTop + rect.height / 2 - 9, right: distances.right / 2 - 12 }}>{distances.right}</div>
        </>
      )}
    </>
  )
}

function DistanceLines({ distance }: { distance: { horizontal: { startX: number; startY: number; endX: number; endY: number; value: number; labelX: number; labelY: number } | null; vertical: { startX: number; startY: number; endX: number; endY: number; value: number; labelX: number; labelY: number } | null } }) {
  const lineStyle: React.CSSProperties = { position: 'absolute', backgroundColor: COLORS.distanceBg, pointerEvents: 'none', zIndex: 2147483647 }
  const labelStyle: React.CSSProperties = { position: 'absolute', padding: '2px 5px', borderRadius: 0, backgroundColor: COLORS.distanceBg, color: COLORS.distanceText, fontSize: '10px', fontFamily: 'ui-monospace, monospace', fontWeight: 600, whiteSpace: 'nowrap', lineHeight: '1.3', zIndex: 2147483647, pointerEvents: 'none' }

  return (
    <>
      {distance.horizontal && distance.horizontal.value > 0 && (
        <>
          <div style={{ ...lineStyle, top: distance.horizontal.startY, left: distance.horizontal.startX, width: distance.horizontal.endX - distance.horizontal.startX, height: '1px' }} />
          <div style={{ ...lineStyle, top: distance.horizontal.startY - 4, left: distance.horizontal.startX, width: '1px', height: '9px' }} />
          <div style={{ ...lineStyle, top: distance.horizontal.endY - 4, left: distance.horizontal.endX, width: '1px', height: '9px' }} />
          <div style={{ ...labelStyle, top: distance.horizontal.labelY - 22, left: distance.horizontal.labelX - 15 }}>{distance.horizontal.value}</div>
        </>
      )}
      {distance.vertical && distance.vertical.value > 0 && (
        <>
          <div style={{ ...lineStyle, top: distance.vertical.startY, left: distance.vertical.startX, width: '1px', height: distance.vertical.endY - distance.vertical.startY }} />
          <div style={{ ...lineStyle, top: distance.vertical.startY, left: distance.vertical.startX - 4, width: '9px', height: '1px' }} />
          <div style={{ ...lineStyle, top: distance.vertical.endY, left: distance.vertical.endX - 4, width: '9px', height: '1px' }} />
          <div style={{ ...labelStyle, top: distance.vertical.labelY - 10, left: distance.vertical.labelX + 6 }}>{distance.vertical.value}</div>
        </>
      )}
    </>
  )
}
