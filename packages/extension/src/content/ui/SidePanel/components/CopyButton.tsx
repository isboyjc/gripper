import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface CopyButtonProps {
  /** 要复制的文本 */
  text: string
  /** 自定义类名 */
  className?: string
  /** 图标大小 */
  size?: number
}

/**
 * 复制按钮组件
 */
export function CopyButton({ text, className, size = 14 }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={cn(
        'p-1 rounded',
        'text-muted-foreground',
        'hover:bg-accent hover:text-foreground',
        'transition-colors',
        className
      )}
      title={copied ? '已复制' : '复制'}
    >
      {copied ? (
        <Check size={size} className="text-success" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  )
}
