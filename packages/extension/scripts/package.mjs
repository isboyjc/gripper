/**
 * 打包浏览器扩展脚本
 * 将构建好的 dist 目录打包成发布用的 zip 文件
 * 运行: node scripts/package.mjs
 */

import JSZip from 'jszip'
import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const outputDir = join(rootDir, 'releases')

// 浏览器配置
const browsers = [
  { name: 'chrome', distDir: 'dist', zipName: 'gripper-chrome.zip' },
  { name: 'firefox', distDir: 'dist-firefox', zipName: 'gripper-firefox.zip' },
  { name: 'edge', distDir: 'dist-edge', zipName: 'gripper-edge.zip' },
]

/**
 * 递归读取目录下的所有文件
 */
async function getAllFiles(dir, baseDir = dir) {
  const files = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath, baseDir)
      files.push(...subFiles)
    } else {
      files.push({
        path: fullPath,
        relativePath: relative(baseDir, fullPath),
      })
    }
  }

  return files
}

/**
 * 为指定浏览器创建 zip 包
 */
async function packageBrowser(browser) {
  const distPath = join(rootDir, browser.distDir)

  // 检查 dist 目录是否存在
  if (!existsSync(distPath)) {
    console.error(`❌ ${browser.name} dist directory not found: ${distPath}`)
    console.error(`   Please run "pnpm build:${browser.name}" first`)
    return false
  }

  console.log(`📦 Packaging ${browser.name}...`)

  const zip = new JSZip()

  // 获取所有文件
  const files = await getAllFiles(distPath)

  // 添加文件到 zip（不包含父目录）
  for (const file of files) {
    const content = await readFile(file.path)
    // 使用相对路径，确保解压后没有额外的目录层级
    zip.file(file.relativePath, content)
  }

  // 生成 zip
  const zipContent = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  })

  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true })
  }

  // 写入 zip 文件
  const zipPath = join(outputDir, browser.zipName)
  await writeFile(zipPath, zipContent)

  // 获取文件大小
  const stats = await stat(zipPath)
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

  console.log(`✅ ${browser.name} packaged: ${browser.zipName} (${sizeMB} MB)`)
  return true
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting packaging process...\n')

  let successCount = 0
  let failCount = 0

  for (const browser of browsers) {
    const success = await packageBrowser(browser)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    console.log('') // 空行分隔
  }

  console.log('━'.repeat(50))
  console.log(`✅ Successfully packaged: ${successCount}`)
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`)
  }
  console.log(`📁 Output directory: ${relative(rootDir, outputDir)}`)
  console.log('━'.repeat(50))

  if (failCount > 0) {
    console.log('\n💡 Tip: Run "pnpm build" to build all versions first')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
