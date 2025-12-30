import { useState, useMemo, useEffect } from 'react'
import { Download, Copy, Check, X, Image, FileCode, FileText, File, Filter, Video, Music, MapPin } from 'lucide-react'
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

type AssetType = 'all' | 'image' | 'svg' | 'video' | 'audio'

/**
 * 获取资源格式
 */
function getAssetFormat(url: string, type?: string): string {
  // 视频格式
  if (type === 'video') {
    if (url.startsWith('data:video/mp4')) return 'MP4'
    if (url.startsWith('data:video/webm')) return 'WEBM'
    if (url.startsWith('data:video/ogg')) return 'OGG'

    const ext = url.split('?')[0].split('.').pop()?.toUpperCase()
    if (ext && ['MP4', 'WEBM', 'OGG', 'MOV', 'AVI', 'MKV', 'M4V'].includes(ext)) {
      return ext
    }
    return 'VIDEO'
  }

  // 音频格式
  if (type === 'audio') {
    if (url.startsWith('data:audio/mp3') || url.startsWith('data:audio/mpeg')) return 'MP3'
    if (url.startsWith('data:audio/wav')) return 'WAV'
    if (url.startsWith('data:audio/ogg')) return 'OGG'
    if (url.startsWith('data:audio/aac')) return 'AAC'
    if (url.startsWith('data:audio/flac')) return 'FLAC'

    const ext = url.split('?')[0].split('.').pop()?.toUpperCase()
    if (ext && ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'WMA', 'AIFF'].includes(ext)) {
      return ext
    }
    return 'AUDIO'
  }

  // 图片/SVG格式
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
  if (type === 'video') return <Video size={20} className="text-purple-500" />
  if (type === 'audio') return <Music size={20} className="text-orange-500" />
  if (type === 'image') return <Image size={20} className="text-emerald-500" />
  if (type === 'font') return <FileText size={20} className="text-amber-500" />
  return <File size={20} className="text-muted-foreground" />
}

/**
 * 预览弹窗
 */
function PreviewModal({
  asset,
  onClose,
  t
}: {
  asset: AssetInfo
  onClose: () => void
  t?: I18nMessages['sidepanel']
}) {
  const { copied, copy } = useCopyToClipboard()
  const format = getAssetFormat(asset.url, asset.type)
  const isVideo = asset.type === 'video'
  const isAudio = asset.type === 'audio'

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

        {/* 预览区域 - 居中，模糊背景填充 */}
        <div
          className="relative overflow-hidden"
          style={{ width: '400px', height: isAudio ? '120px' : '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isVideo ? (
            /* 视频预览 */
            <video
              src={asset.url}
              controls
              style={{
                position: 'relative',
                maxWidth: '95%',
                maxHeight: '95%',
                objectFit: 'contain',
                zIndex: 10
              }}
            />
          ) : isAudio ? (
            /* 音频预览 */
            <div className="flex flex-col items-center gap-3 p-4 w-full">
              <Music size={32} className="text-orange-500" />
              <audio
                src={asset.url}
                controls
                className="w-full"
              />
            </div>
          ) : (
            <>
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
            </>
          )}
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
              title={t?.copy || 'Copy'}
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
function AssetItem({
  asset,
  onSelect,
  isSelected,
  t
}: {
  asset: AssetInfo
  onSelect: () => void
  isSelected: boolean
  t?: I18nMessages['sidepanel']
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { copied, copy } = useCopyToClipboard()

  const format = getAssetFormat(asset.url, asset.type)
  const isVideo = asset.type === 'video'
  const isAudio = asset.type === 'audio'
  const canLocate = !!asset.selector

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

  const handleLocate = () => {
    if (!asset.selector) return

    // 发送消息到content script，让其滚动到元素并高亮
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id && asset.selector) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'LOCATE_ELEMENT',
          selector: asset.selector
        }).catch(() => {
          // Content script not loaded or tab is on restricted page
        })
      }
    })
  }

  return (
    <>
      <div
        onClick={onSelect}
        className={cn(
          'flex items-center gap-3 p-2',
          'bg-muted rounded-lg',
          'transition-colors cursor-pointer',
          isSelected
            ? 'border-2'
            : 'border border-border/50 hover:border-border'
        )}
        style={isSelected ? { borderColor: 'hsl(var(--foreground))', borderWidth: '2px', borderStyle: 'solid' } : undefined}
      >
        {/* 预览缩略图 - 点击预览 */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowPreview(true) }}
          className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 ring-primary transition-all relative"
        >
          {isVideo ? (
            /* 视频缩略图 - 显示图标 */
            <div className="flex items-center justify-center w-full h-full bg-purple-500/10">
              <Video size={24} className="text-purple-500" />
            </div>
          ) : isAudio ? (
            /* 音频缩略图 - 显示图标 */
            <div className="flex items-center justify-center w-full h-full bg-orange-500/10">
              <Music size={24} className="text-orange-500" />
            </div>
          ) : (
            <>
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
            </>
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
        <div className="flex items-center gap-1">
          {/* 定位按钮 - 仅当元素可定位时显示 */}
          {canLocate && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleLocate() }}
              className={cn(
                'p-1.5 rounded',
                'text-muted-foreground',
                'hover:bg-accent hover:text-foreground',
                'transition-colors'
              )}
              title={t?.locateInPage || 'Locate in Page'}
            >
              <MapPin size={14} />
            </button>
          )}

          {/* 复制 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); copy(getCopyContent()) }}
            className={cn(
              'p-1.5 rounded',
              'text-muted-foreground',
              'hover:bg-accent hover:text-foreground',
              'transition-colors'
            )}
            title={asset.content ? (t?.copy || 'Copy') + ' SVG' : asset.url.startsWith('data:') ? (t?.copy || 'Copy') + ' Base64' : (t?.copy || 'Copy') + ' URL'}
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>

          {/* 下载 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDownload() }}
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
      </div>

      {showPreview && (
        <PreviewModal asset={asset} onClose={() => setShowPreview(false)} t={t} />
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
  counts: { all: number; image: number; svg: number; video: number; audio: number }
  t?: I18nMessages['sidepanel']
}) {
  // 只显示数量大于0的选项
  const allOptions: { value: AssetType; label: string; count: number }[] = [
    { value: 'all', label: `${t?.filterAll || 'All'} (${counts.all})`, count: counts.all },
    { value: 'image', label: `${t?.filterImage || 'Image'} (${counts.image})`, count: counts.image },
    { value: 'svg', label: `SVG (${counts.svg})`, count: counts.svg },
    { value: 'video', label: `${t?.filterVideo || 'Video'} (${counts.video})`, count: counts.video },
    { value: 'audio', label: `${t?.filterAudio || 'Audio'} (${counts.audio})`, count: counts.audio },
  ]

  // 过滤掉数量为0的选项（all 除外）
  const options = allOptions.filter(opt => opt.value === 'all' || opt.count > 0)

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
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const { copied, copy } = useCopyToClipboard()

  const safeAssets = assets || []

  // 统计各类型数量
  const counts = useMemo(() => ({
    all: safeAssets.length,
    image: safeAssets.filter(a => a.type === 'image').length,
    svg: safeAssets.filter(a => a.type === 'svg').length,
    video: safeAssets.filter(a => a.type === 'video').length,
    audio: safeAssets.filter(a => a.type === 'audio').length,
  }), [safeAssets])

  // 根据筛选过滤资源
  const filteredAssets = useMemo(() => {
    if (filter === 'all') return safeAssets
    return safeAssets.filter(a => a.type === filter)
  }, [safeAssets, filter])

  // 当筛选改变时，清空选中状态
  useEffect(() => {
    setSelectedIndices(new Set())
  }, [filter])

  if (safeAssets.length === 0) return null

  const VISIBLE_COUNT = 3
  const hasMore = filteredAssets.length > VISIBLE_COUNT
  const visibleItems = showAll ? filteredAssets : filteredAssets.slice(0, VISIBLE_COUNT)

  const hasSelection = selectedIndices.size > 0
  const isAllSelected = selectedIndices.size === filteredAssets.length && filteredAssets.length > 0

  // 切换单个资源的选中状态
  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedIndices(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(filteredAssets.map((_, i) => i)))
    }
  }

  // 下载选中的资源或全部
  const handleDownload = async () => {
    if (isDownloading || filteredAssets.length === 0) return
    setIsDownloading(true)

    try {
      const assetsToDownload = hasSelection
        ? Array.from(selectedIndices).map(i => filteredAssets[i])
        : filteredAssets

      const zip = new JSZip()
      const folder = zip.folder('assets')

      for (let i = 0; i < assetsToDownload.length; i++) {
        const asset = assetsToDownload[i]
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
          const format = getAssetFormat(asset.url, asset.type).toLowerCase()
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
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // 复制选中的资源URL
  const handleCopy = () => {
    const selectedAssets = Array.from(selectedIndices).map(i => filteredAssets[i])
    const urls = selectedAssets.map(asset => {
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
    })
    copy(urls.join('\n'))
  }

  // 动态按钮文本
  const getDownloadButtonText = () => {
    if (isDownloading) return '...'
    if (hasSelection) {
      return `${t?.download || 'Download'} (${selectedIndices.size})`
    }
    return t?.downloadAll || 'Download All'
  }

  const getCopyButtonText = () => {
    if (copied) return t?.copied || 'Copied'
    return `${t?.copy || 'Copy'} (${selectedIndices.size})`
  }

  return (
    <CollapsibleSection
      title={`${safeAssets.length} ${title}`}
      expanded={expanded}
      onToggle={onToggle}
      action={
        <div className="flex items-center gap-1">
          {/* 复制选中 - 仅多选时显示 */}
          {hasSelection && selectedIndices.size > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCopy() }}
              className={cn(
                'text-xs px-2 py-1 rounded',
                'bg-muted border border-border',
                'text-muted-foreground',
                'hover:text-foreground hover:border-foreground/20',
                'transition-colors'
              )}
            >
              {getCopyButtonText()}
            </button>
          )}

          {/* 下载按钮 - 根据选中状态动态显示 */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDownload() }}
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
            {getDownloadButtonText()}
          </button>
        </div>
      }
    >
      <div className="p-3 space-y-3">
        {/* 筛选器和全选按钮 */}
        <div className="flex items-center justify-between gap-2">
          <AssetFilter filter={filter} onChange={setFilter} counts={counts} t={t} />

          {/* 全选/取消全选按钮 - 仅在有选中时显示 */}
          {hasSelection && filteredAssets.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className={cn(
                'text-xs px-2 py-0.5 rounded',
                'transition-colors',
                'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {isAllSelected ? (t?.deselectAll || 'Deselect All') : (t?.selectAll || 'Select All')}
            </button>
          )}
        </div>

        {/* 资源列表 */}
        <div className="space-y-2">
          {filteredAssets.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t?.noAssetsInFilter || 'No assets in this category'}</p>
          ) : (
            <>
              {visibleItems.map((asset, index) => (
                <AssetItem
                  key={index}
                  asset={asset}
                  onSelect={() => toggleSelect(index)}
                  isSelected={selectedIndices.has(index)}
                  t={t}
                />
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
