import { CollapsibleSection } from '../components'
import { cn } from '@/lib/utils'
import type { BoxModelInfo } from '@/types'

interface BoxModelProps {
  info?: BoxModelInfo
}

/**
 * 盒模型可视化组件
 */
export function BoxModel({ info }: BoxModelProps) {
  if (!info) return null

  const { margin, border, padding, content } = info

  const formatValue = (value: number) => (value === 0 ? '-' : value)

  return (
    <CollapsibleSection id="box-model" title="Box Model">
      <div className="p-4">
        <div className="box-model-visualizer text-xs">
          {/* Margin 层 */}
          <div
            className={cn(
              'relative p-4 text-center',
              'bg-box-margin/10 border border-dashed border-box-margin/30'
            )}
          >
            <span className="absolute top-1 left-2 text-muted-foreground italic">
              Margin
            </span>
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-box-margin">
              {formatValue(margin.top)}
            </span>
            <span className="absolute top-1/2 left-2 -translate-y-1/2 text-box-margin">
              {formatValue(margin.left)}
            </span>
            <span className="absolute top-1/2 right-2 -translate-y-1/2 text-box-margin">
              {formatValue(margin.right)}
            </span>

            {/* Border 层 */}
            <div
              className={cn(
                'relative p-4 text-center',
                'bg-box-border/10 border border-box-border/30'
              )}
            >
              <span className="absolute top-1 left-2 text-muted-foreground italic">
                Border
              </span>
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-box-border">
                {formatValue(border.top)}
              </span>
              <span className="absolute top-1/2 left-2 -translate-y-1/2 text-box-border">
                {formatValue(border.left)}
              </span>
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-box-border">
                {formatValue(border.right)}
              </span>

              {/* Padding 层 */}
              <div
                className={cn(
                  'relative p-4 text-center',
                  'bg-box-padding/10 border border-dashed border-box-padding/30'
                )}
              >
                <span className="absolute top-1 left-2 text-muted-foreground italic">
                  Padding
                </span>
                <span className="absolute top-4 left-1/2 -translate-x-1/2 text-box-padding">
                  {formatValue(padding.top)}
                </span>
                <span className="absolute top-1/2 left-2 -translate-y-1/2 text-box-padding">
                  {formatValue(padding.left)}
                </span>
                <span className="absolute top-1/2 right-2 -translate-y-1/2 text-box-padding">
                  {formatValue(padding.right)}
                </span>

                {/* Content 层 */}
                <div
                  className={cn(
                    'relative py-6 px-8 text-center',
                    'bg-box-content/20 border border-box-content/50'
                  )}
                >
                  <span className="text-foreground font-mono text-sm">
                    {content.width} × {content.height}
                  </span>
                </div>

                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-box-padding">
                  {formatValue(padding.bottom)}
                </span>
              </div>

              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-box-border">
                {formatValue(border.bottom)}
              </span>
            </div>

            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-box-margin">
              {formatValue(margin.bottom)}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
