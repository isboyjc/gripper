import { Download, Image, FileCode, Video, Music } from 'lucide-react'
import { CollapsibleSection } from '../components'
import { cn } from '@/lib/utils'
import type { AssetInfo } from '@/types'
import type { I18nMessages } from '@/i18n'

interface AssetsListProps {
  assets?: AssetInfo[]
  t?: I18nMessages['sidepanel']
}

/**
 * 资源图标
 */
function AssetIcon({ type }: { type: AssetInfo['type'] }) {
  switch (type) {
    case 'svg':
      return <FileCode size={20} className="text-info" />
    case 'video':
      return <Video size={20} className="text-purple-500" />
    case 'audio':
      return <Music size={20} className="text-orange-500" />
    case 'image':
    default:
      return <Image size={20} className="text-muted-foreground" />
  }
}

/**
 * 单个资源项
 */
function AssetItem({ asset, t }: { asset: AssetInfo; t?: I18nMessages['sidepanel'] }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(asset.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = asset.url.split('/').pop() || `asset.${asset.type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2',
        'bg-background rounded-md',
        'border border-border/50',
        'hover:border-border transition-colors'
      )}
    >
      {/* 图标/缩略图 */}
      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
        {asset.type === 'image' && asset.url ? (
          <img
            src={asset.url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : asset.type === 'video' ? (
          <div className="flex items-center justify-center w-full h-full bg-purple-500/10">
            <Video size={20} className="text-purple-500" />
          </div>
        ) : asset.type === 'audio' ? (
          <div className="flex items-center justify-center w-full h-full bg-orange-500/10">
            <Music size={20} className="text-orange-500" />
          </div>
        ) : (
          <AssetIcon type={asset.type} />
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {asset.size && (
            <span className="text-xs text-foreground font-mono">
              {asset.size.width}×{asset.size.height}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground uppercase">
          {asset.type.toUpperCase()}
        </span>
      </div>

      {/* 下载按钮 */}
      <button
        type="button"
        onClick={handleDownload}
        className={cn(
          'p-1.5 rounded',
          'text-muted-foreground',
          'hover:bg-accent hover:text-foreground',
          'transition-colors'
        )}
        title={t?.download || 'Download'}
      >
        <Download size={14} />
      </button>
    </div>
  )
}

/**
 * 资源列表组件
 */
export function AssetsList({ assets, t }: AssetsListProps) {
  if (!assets || assets.length === 0) return null

  const handleDownloadAll = () => {
    // TODO: 实现批量下载
    console.log('Download all assets')
  }

  return (
    <CollapsibleSection
      id="assets"
      title={`${assets.length} Assets`}
      action={
        <button
          type="button"
          onClick={handleDownloadAll}
          className={cn(
            'text-xs px-2 py-1 rounded',
            'bg-background border border-border',
            'text-muted-foreground',
            'hover:text-foreground hover:border-border',
            'transition-colors'
          )}
        >
          Download All
        </button>
      }
    >
      <div className="p-3 space-y-2">
        {assets.map((asset, index) => (
          <AssetItem key={index} asset={asset} t={t} />
        ))}
      </div>
    </CollapsibleSection>
  )
}
