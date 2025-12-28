import { CollapsibleSection } from '../components'
import type { BoxModelInfo } from '@/types'

interface BoxModelProps {
  title?: string
  info?: BoxModelInfo
  expanded: boolean
  onToggle: () => void
}

/**
 * 盒模型可视化组件 - 亮暗模式都清晰
 */
export function BoxModel({ title = 'Box Model', info, expanded, onToggle }: BoxModelProps) {
  if (!info) return null

  const { margin, border, padding, content } = info
  const formatValue = (value: number) => (value === 0 ? '-' : Math.round(value))

  return (
    <CollapsibleSection title={title} expanded={expanded} onToggle={onToggle}>
      <div className="p-3">
        <div className="relative font-mono text-[10px] font-semibold">
          {/* Margin 层 - 橙色 */}
          <div 
            className="relative border-2 border-dashed p-2"
            style={{
              borderColor: '#f97316',
              color: '#ea580c',
              backgroundColor: 'rgba(251, 146, 60, 0.15)',
            }}
          >
            <span 
              className="absolute top-0.5 left-1.5 italic text-[9px] font-normal"
              style={{ color: '#f97316' }}
            >
              Margin
            </span>
            
            {/* Top margin */}
            <div className="text-center h-5 flex items-center justify-center">
              {formatValue(margin.top)}
            </div>
            
            {/* Border 层 - 黄色 */}
            <div 
              className="relative border-2 p-2 mx-4"
              style={{
                borderColor: '#eab308',
                color: '#ca8a04',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
              }}
            >
              <span 
                className="absolute top-0.5 left-1.5 italic text-[9px] font-normal"
                style={{ color: '#eab308' }}
              >
                Border
              </span>
              
              {/* Top border */}
              <div className="text-center h-5 flex items-center justify-center">
                {formatValue(border.top)}
              </div>
              
              {/* Padding 层 - 绿色 */}
              <div 
                className="relative border-2 border-dashed p-2 mx-4"
                style={{
                  borderColor: '#22c55e',
                  color: '#16a34a',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                }}
              >
                <span 
                  className="absolute top-0.5 left-1.5 italic text-[9px] font-normal"
                  style={{ color: '#22c55e' }}
                >
                  Padding
                </span>
                
                {/* Top padding */}
                <div className="text-center h-5 flex items-center justify-center">
                  {formatValue(padding.top)}
                </div>
                
                {/* Content 层 - 蓝色 */}
                <div className="flex items-center justify-center mx-4">
                  {/* Left padding */}
                  <span className="w-6 text-center flex-shrink-0">
                    {formatValue(padding.left)}
                  </span>
                  
                  {/* Content box */}
                  <div 
                    className="flex-1 border-2 border-dashed py-3 px-2 text-center min-w-[80px]"
                    style={{
                      borderColor: '#3b82f6',
                      color: '#2563eb',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <span className="text-[11px]">
                      {content.width} × {content.height}
                    </span>
                  </div>
                  
                  {/* Right padding */}
                  <span className="w-6 text-center flex-shrink-0">
                    {formatValue(padding.right)}
                  </span>
                </div>
                
                {/* Bottom padding */}
                <div className="text-center h-5 flex items-center justify-center">
                  {formatValue(padding.bottom)}
                </div>
              </div>
              
              {/* Bottom border */}
              <div className="text-center h-5 flex items-center justify-center">
                {formatValue(border.bottom)}
              </div>
              
              {/* Left/Right border labels */}
              <span className="absolute top-1/2 left-0.5 -translate-y-1/2 w-4 text-center">
                {formatValue(border.left)}
              </span>
              <span className="absolute top-1/2 right-0.5 -translate-y-1/2 w-4 text-center">
                {formatValue(border.right)}
              </span>
            </div>
            
            {/* Bottom margin */}
            <div className="text-center h-5 flex items-center justify-center">
              {formatValue(margin.bottom)}
            </div>
            
            {/* Left/Right margin labels */}
            <span className="absolute top-1/2 left-0.5 -translate-y-1/2 w-4 text-center">
              {formatValue(margin.left)}
            </span>
            <span className="absolute top-1/2 right-0.5 -translate-y-1/2 w-4 text-center">
              {formatValue(margin.right)}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
