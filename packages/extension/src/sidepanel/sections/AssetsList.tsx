import { useState, useMemo } from 'react'
import { Download, Copy, Check, X, Image, FileCode, FileText, File, Filter } from 'lucide-react'
import JSZip from 'jszip'
import { CollapsibleSection } from '../components'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import type { AssetInfo } from '@/types'
import type { I18nMessages } from '@/i18n'

interface AssetsListProps {
  title?: string
  assets?: AssetInfo[]
  expanded: boolean
  onToggle: () => void
  t?: I18nMessages['sidepanel']
}

type AssetType = 'all' | 'image' | 'svg'

/**
 * 获取图片格式
 */
function getImageFormat(url: string): string {
  if (url.startsWith('data:image/svg')) return 'SVG'
  if (url.startsWith('data:image/png')) return 'PNG'
  if (url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg')) return 'JPG'
  if (url.startsWith('data:image/gif')) return 'GIF'
  if (url.startsWith('data:image/webp')) return 'WEBP'
  
  const ext = url.split('?')[0].split('.').pop()?.toUpperCase()
  if (ext && ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP', 'SVG', 'ICO', 'BMP', 'AVIF'].includes(ext)) {
    return ext === 'JPEG' ? 'JPG' : ext
  }
  return 'IMAGE'
}

/**
 * 获取资源图标
 */
function AssetIcon({ type, format }: { type: string; format?: string }) {
  if (type === 'svg' || format === 'SVG') return <FileCode size={20} className="text-info" />
  if (type === 'image') return <Image size={20} className="text-emerald-500" />
  if (type === 'font') return <FileText size={20} className="text-amber-500" />
  return <File size={20} className="text-muted-foreground" />
}

/**
 * 预览弹窗
 */
function PreviewModal({ asset, onClose }: { asset: AssetInfo; onClose: () => void }) {
  const { copied, copy } = useCopyToClipboard()
  const format = getImageFormat(asset.url)

  const getCopyContent = () => {
    if (asset.content) return asset.content // SVG 代码
    if (asset.url.startsWith('data:')) return asset.url // base64
    // 相对路径转完整 URL
    if (!asset.url.startsWith('http')) {
      try {
        return new URL(asset.url, window.location.href).href
      } catch {
        return asset.url
      }
    }
    return asset.url
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div 
        className="relative bg-background rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded bg-muted hover:bg-accent transition-colors z-10"
        >
          <X size={16} />
        </button>
        
        {/* 图片预览 - 居中，模糊背景填充 */}
        <div 
          className="relative overflow-hidden"
          style={{ width: '400px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* 模糊背景 */}
          <div 
            className="absolute inset-0 blur-xl opacity-30"
            style={{ backgroundImage: `url(${asset.url})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: 'scale(1.1)' }}
          />
          {/* 主图 - SVG 更大显示 */}
          <img 
            src={asset.url} 
            alt="" 
            style={{ 
              position: 'relative', 
              maxWidth: format === 'SVG' ? '70%' : '95%', 
              maxHeight: format === 'SVG' ? '70%' : '95%', 
              objectFit: 'contain', 
              zIndex: 10 
            }}
          />
        </div>
        
        <div className="p-3 bg-muted border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {asset.size && (
                <span className="text-foreground font-mono">
                  {asset.size.width}×{asset.size.height}
                </span>
              )}
              <span className="text-muted-foreground">{format}</span>
              {asset.fileSize && (
                <span className="text-muted-foreground">
                  {(asset.fileSize / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
            <button
              onClick={() => copy(getCopyContent())}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="复制"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 单个资源项
 */
function AssetItem({ asset }: { asset: AssetInfo }) {
  const [showPreview, setShowPreview] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { copied, copy } = useCopyToClipboard()
  
  const format = getImageFormat(asset.url)

  const getCopyContent = () => {
    if (asset.content) return asset.content
    if (asset.url.startsWith('data:')) return asset.url
    if (!asset.url.startsWith('http')) {
      try {
        return new URL(asset.url, window.location.href).href
      } catch {
        return asset.url
      }
    }
    return asset.url
  }

  const handleDownload = async () => {
    try {
      let downloadUrl = asset.url
      
      // 相对路径转完整 URL
      if (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('data:')) {
        downloadUrl = new URL(asset.url, window.location.href).href
      }
      
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // 生成文件名
      let filename = 'asset'
      if (!asset.url.startsWith('data:')) {
        filename = asset.url.split('/').pop()?.split('?')[0] || 'asset'
      }
      if (!filename.includes('.')) {
        filename += `.${format.toLowerCase()}`
      }
      
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 p-2',
          'bg-muted rounded-lg',
          'border border-border/50',
          'hover:border-border transition-colors',
          'group'
        )}
      >
        {/* 预览缩略图 */}
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 ring-info transition-all relative"
        >
          {/* 模糊背景 */}
          {!imgError && asset.url && format !== 'SVG' && (
            <div 
              className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
              style={{ backgroundImage: `url(${asset.url})` }}
            />
          )}
          
          {!imgError && asset.url ? (
            <img 
              src={asset.url} 
              alt="" 
              className={cn(
                "relative z-10 object-contain",
                format === 'SVG' ? "w-6 h-6" : "w-full h-full p-0.5"
              )}
              style={format === 'SVG' ? { filter: 'var(--svg-filter, none)' } : undefined}
              onError={() => setImgError(true)}
            />
          ) : (
            <AssetIcon type={asset.type} format={format} />
          )}
        </button>

        {/* 资源信息 */}
        <div className="flex-1 min-w-0">
          {asset.size && (
            <span className="text-sm text-foreground font-mono">
              {asset.size.width}×{asset.size.height}
            </span>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase font-medium">{format}</span>
            {asset.fileSize && (
              <span>{(asset.fileSize / 1024).toFixed(1)} KB</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 复制 */}
          <button
            type="button"
            onClick={() => copy(getCopyContent())}
            className={cn(
              'p-1.5 rounded',
              'text-muted-foreground',
              'hover:bg-accent hover:text-foreground',
              'transition-colors'
            )}
            title={asset.content ? '复制 SVG 代码' : asset.url.startsWith('data:') ? '复制 Base64' : '复制 URL'}
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
          
          {/* 下载 */}
          <button
            type="button"
            onClick={handleDownload}
            className={cn(
              'p-1.5 rounded',
              'text-muted-foreground',
              'hover:bg-accent hover:text-foreground',
              'transition-colors'
            )}
            title="下载"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {showPreview && (
        <PreviewModal asset={asset} onClose={() => setShowPreview(false)} />
      )}
    </>
  )
}

/**
 * 筛选器组件
 */
function AssetFilter({ 
  filter, 
  onChange, 
  counts, 
  t 
}: { 
  filter: AssetType
  onChange: (type: AssetType) => void
  counts: { all: number; image: number; svg: number }
  t?: I18nMessages['sidepanel']
}) {
  const options: { value: AssetType; label: string }[] = [
    { value: 'all', label: `${t?.filterAll || 'All'} (${counts.all})` },
    { value: 'image', label: `${t?.filterImage || 'Image'} (${counts.image})` },
    { value: 'svg', label: `SVG (${counts.svg})` },
  ]

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Filter size={12} className="text-muted-foreground" />
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'text-xs px-2 py-0.5 rounded',
            'transition-colors',
            filter === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/**
 * 资源列表组件
 */
export function AssetsList({ title = 'Assets', assets, expanded, onToggle, t }: AssetsListProps) {
  // 所有 hooks 必须在条件返回之前
  const [showAll, setShowAll] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [filter, setFilter] = useState<AssetType>('all')
  
  const safeAssets = assets || []
  
  // 统计各类型数量
  const counts = useMemo(() => ({
    all: safeAssets.length,
    image: safeAssets.filter(a => a.type === 'image').length,
    svg: safeAssets.filter(a => a.type === 'svg').length,
  }), [safeAssets])
  
  // 根据筛选过滤资源
  const filteredAssets = useMemo(() => {
    if (filter === 'all') return safeAssets
    return safeAssets.filter(a => a.type === filter)
  }, [safeAssets, filter])
  
  if (safeAssets.length === 0) return null

  const VISIBLE_COUNT = 3
  const hasMore = filteredAssets.length > VISIBLE_COUNT
  const visibleItems = showAll ? filteredAssets : filteredAssets.slice(0, VISIBLE_COUNT)

  const handleDownloadAll = async () => {
    if (isDownloading || filteredAssets.length === 0) return
    setIsDownloading(true)
    
    try {
      const zip = new JSZip()
      const folder = zip.folder('assets')
      
      // 下载筛选后的资源
      for (let i = 0; i < filteredAssets.length; i++) {
        const asset = filteredAssets[i]
        try {
          let downloadUrl = asset.url
          if (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('data:')) {
            downloadUrl = new URL(asset.url, window.location.href).href
          }
          
          const response = await fetch(downloadUrl)
          const blob = await response.blob()
          
          let filename = `asset-${i + 1}`
          if (!asset.url.startsWith('data:')) {
            filename = asset.url.split('/').pop()?.split('?')[0] || filename
          }
          const format = getImageFormat(asset.url).toLowerCase()
          if (!filename.includes('.')) {
            filename += `.${format}`
          }
          
          folder?.file(filename, blob)
        } catch (error) {
          console.error(`Failed to add ${asset.url} to zip:`, error)
        }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gripper-assets-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download all failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <CollapsibleSection
      title={`${safeAssets.length} ${title}`}
      expanded={expanded}
      onToggle={onToggle}
      action={
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDownloadAll() }}
          disabled={isDownloading || filteredAssets.length === 0}
          className={cn(
            'text-xs px-2 py-1 rounded',
            'bg-muted border border-border',
            'text-muted-foreground',
            'hover:text-foreground hover:border-foreground/20',
            'transition-colors',
            (isDownloading || filteredAssets.length === 0) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isDownloading ? '...' : (t?.downloadAll || 'Download All')}
        </button>
      }
    >
      <div className="p-3 space-y-3">
        {/* 筛选器 */}
        <AssetFilter filter={filter} onChange={setFilter} counts={counts} t={t} />
        
        {/* 资源列表 */}
        <div className="space-y-2">
          {filteredAssets.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t?.noAssetsInFilter || 'No assets in this category'}</p>
          ) : (
            <>
              {visibleItems.map((asset, index) => (
                <AssetItem key={index} asset={asset} />
              ))}
              
              {hasMore && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  {t?.showAll || 'Show all'} ({filteredAssets.length - VISIBLE_COUNT} {t?.more || 'more'})
                </button>
              )}
              
              {hasMore && showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  {t?.collapse || 'Collapse'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </CollapsibleSection>
  )
}
