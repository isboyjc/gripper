import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { CollapsibleSection } from '../components'
import { cn } from '@/lib/utils'
import type { I18nMessages } from '@/i18n'

interface DocumentNode {
  tagName: string
  id?: string
  className?: string
  isSelected?: boolean
}

interface DocumentTreeProps {
  title?: string
  selector: string
  ancestors?: DocumentNode[]
  children?: DocumentNode[]
  expanded: boolean
  onToggle: () => void
  onSelectParent?: () => void
  onSelectChild?: () => void
  canSelectParent?: boolean
  canSelectChild?: boolean
  t?: I18nMessages['toolbar']
}

/**
 * 生成节点显示文本
 */
function formatNode(node: DocumentNode): string {
  let text = node.tagName.toLowerCase()
  if (node.id) text += `#${node.id}`
  if (node.className) {
    const classes = node.className.split(' ').filter(Boolean).slice(0, 3)
    if (classes.length > 0) text += `.${classes.join('.')}`
  }
  return text
}

/**
 * 单个节点项
 */
function NodeItem({ 
  node, 
  depth = 0, 
  isSelected = false,
  onClick 
}: { 
  node: DocumentNode
  depth?: number
  isSelected?: boolean
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 py-1 px-2 rounded text-xs font-mono',
        'transition-colors cursor-pointer',
        isSelected ? 'bg-info/20 text-info' : 'hover:bg-muted text-muted-foreground',
        onClick && 'cursor-pointer'
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={onClick}
    >
      {depth > 0 && (
        <span className="text-muted-foreground/50 mr-1">
          {Array(depth).fill('│').join('')}
        </span>
      )}
      <ChevronRight size={12} className="text-muted-foreground/50" />
      <span className={cn(
        'truncate',
        isSelected && 'font-medium'
      )}>
        {formatNode(node)}
      </span>
    </div>
  )
}

/**
 * 文档树组件 - 展示选中元素的DOM层级
 */
export function DocumentTree({
  title = 'Document',
  selector,
  ancestors = [],
  children = [],
  expanded,
  onToggle,
  onSelectParent,
  onSelectChild,
  canSelectParent = false,
  canSelectChild = false,
  t,
}: DocumentTreeProps) {
  // 解析当前选择器
  const parts = selector.split(/(?=[.#])/)
  const currentNode: DocumentNode = {
    tagName: parts[0] || 'div',
    className: parts.slice(1).filter(p => p.startsWith('.')).map(p => p.slice(1)).join(' '),
    id: parts.find(p => p.startsWith('#'))?.slice(1),
    isSelected: true,
  }

  return (
    <CollapsibleSection 
      title={title} 
      expanded={expanded} 
      onToggle={onToggle}
      action={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelectParent?.() }}
            disabled={!canSelectParent}
            className={cn(
              'p-1 rounded transition-colors',
              canSelectParent 
                ? 'hover:bg-accent text-muted-foreground hover:text-foreground' 
                : 'text-muted-foreground/30 cursor-not-allowed'
            )}
            title={t?.selectParent || 'Select Parent'}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelectChild?.() }}
            disabled={!canSelectChild}
            className={cn(
              'p-1 rounded transition-colors',
              canSelectChild
                ? 'hover:bg-accent text-muted-foreground hover:text-foreground'
                : 'text-muted-foreground/30 cursor-not-allowed'
            )}
            title={t?.selectChild || 'Select Child'}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      }
    >
      <div className="py-2">
        {/* 祖先节点 */}
        {ancestors.map((node, index) => (
          <NodeItem 
            key={`ancestor-${index}`}
            node={node}
            depth={index}
            onClick={onSelectParent}
          />
        ))}
        
        {/* 当前选中节点 */}
        <NodeItem 
          node={currentNode}
          depth={ancestors.length}
          isSelected
        />
        
        {/* 子节点 */}
        {children.slice(0, 1).map((node, index) => (
          <NodeItem 
            key={`child-${index}`}
            node={node}
            depth={ancestors.length + 1}
            onClick={onSelectChild}
          />
        ))}
      </div>
    </CollapsibleSection>
  )
}
