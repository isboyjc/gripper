import { useEffect, useState, useCallback, useRef } from 'react'

interface EyedropperProps {
  isActive: boolean
  onColorPick: (color: string) => void
  onClose: () => void
}

const MAGNIFIER_SIZE = 160
const GRID_SIZE = 21  // 更多格子，更高放大倍率
const PIXEL_SIZE = MAGNIFIER_SIZE / GRID_SIZE  // 约 7.6px 每格

/**
 * 吸管取色组件 - 基于截图的精确取色
 */
export function Eyedropper({ isActive, onColorPick, onClose }: EyedropperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [color, setColor] = useState('#000000')
  const [pixelColors, setPixelColors] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill('#FFFFFF'))
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageDataRef = useRef<ImageData | null>(null)

  // 捕获整个页面截图
  const captureScreen = useCallback(async () => {
    try {
      const response = await new Promise<{ success: boolean; data?: string }>((resolve) => {
        chrome.runtime.sendMessage({ type: 'CAPTURE_FOR_EYEDROPPER' }, resolve)
      })
      
      if (response?.success && response.data) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.src = response.data!
        })
        
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
          canvasRef.current = canvas
        }
      }
    } catch (error) {
      console.error('[Eyedropper] Failed to capture screen:', error)
    }
  }, [])

  // 从 ImageData 获取像素颜色
  const getPixelFromImageData = useCallback((x: number, y: number): string => {
    if (!imageDataRef.current) return '#FFFFFF'
    
    const dpr = window.devicePixelRatio || 1
    const px = Math.round(x * dpr)
    const py = Math.round(y * dpr)
    const { width, height, data } = imageDataRef.current
    
    if (px < 0 || py < 0 || px >= width || py >= height) return '#FFFFFF'
    
    const i = (py * width + px) * 4
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
  }, [])

  // 更新像素网格
  const updatePixelGrid = useCallback((centerX: number, centerY: number) => {
    if (!imageDataRef.current) return
    
    const colors: string[] = []
    const halfGrid = Math.floor(GRID_SIZE / 2)
    
    for (let y = -halfGrid; y <= halfGrid; y++) {
      for (let x = -halfGrid; x <= halfGrid; x++) {
        const px = centerX + x
        const py = centerY + y
        colors.push(getPixelFromImageData(px, py))
      }
    }
    
    setPixelColors(colors)
    setColor(getPixelFromImageData(centerX, centerY))
  }, [getPixelFromImageData])

  // 初始化时捕获截图
  useEffect(() => {
    if (isActive) {
      captureScreen()
    }
    return () => {
      imageDataRef.current = null
      canvasRef.current = null
    }
  }, [isActive, captureScreen])

  // 鼠标移动事件
  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      updatePixelGrid(e.clientX, e.clientY)
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const pickedColor = getPixelFromImageData(e.clientX, e.clientY)
      navigator.clipboard.writeText(pickedColor).catch(() => {})
      onColorPick(pickedColor)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown, true)
    document.body.style.cursor = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.cursor = ''
    }
  }, [isActive, onColorPick, onClose, updatePixelGrid, getPixelFromImageData])

  if (!isActive) return null

  // 放大镜位置
  let magX = position.x + 24
  let magY = position.y + 24
  if (magX + MAGNIFIER_SIZE > window.innerWidth - 10) magX = position.x - MAGNIFIER_SIZE - 24
  if (magY + MAGNIFIER_SIZE + 50 > window.innerHeight - 10) magY = position.y - MAGNIFIER_SIZE - 74

  const centerIndex = Math.floor(GRID_SIZE * GRID_SIZE / 2)

  return (
    <>
      {/* 放大镜 */}
      <div
        style={{
          position: 'fixed',
          left: magX,
          top: magY,
          width: MAGNIFIER_SIZE,
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '2px solid #333',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 2147483647,
        }}
      >
        {/* 像素网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: MAGNIFIER_SIZE, height: MAGNIFIER_SIZE }}>
          {pixelColors.map((c, i) => {
            const isCenter = i === centerIndex
            return (
              <div
                key={i}
                style={{
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: c,
                  border: isCenter ? '2px solid #fff' : '0.5px solid rgba(0,0,0,0.1)',
                  boxSizing: 'border-box',
                  boxShadow: isCenter ? '0 0 0 1px #000' : 'none',
                }}
              />
            )
          })}
        </div>

        {/* 颜色信息 */}
        <div style={{ 
          padding: '10px 12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          backgroundColor: '#0d0d0d',
          borderTop: '1px solid #333',
        }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            backgroundColor: color, 
            border: '2px solid rgba(255,255,255,0.3)', 
            borderRadius: '4px',
            flexShrink: 0,
          }} />
          <span style={{ 
            color: '#fff', 
            fontSize: '14px', 
            fontFamily: 'ui-monospace, monospace', 
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}>{color}</span>
        </div>
      </div>

      {/* 十字准星 */}
      <div style={{ 
        position: 'fixed', 
        left: position.x - 15, 
        top: position.y - 15, 
        width: '30px', 
        height: '30px', 
        pointerEvents: 'none', 
        zIndex: 2147483647,
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: '#fff', boxShadow: '0 0 4px rgba(0,0,0,0.8)', transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, width: '2px', height: '100%', backgroundColor: '#fff', boxShadow: '0 0 4px rgba(0,0,0,0.8)', transform: 'translateX(-50%)' }} />
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          border: '2px solid #fff', 
          backgroundColor: color,
          boxShadow: '0 0 4px rgba(0,0,0,0.8)',
        }} />
      </div>
    </>
  )
}
