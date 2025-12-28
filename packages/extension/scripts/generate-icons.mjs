/**
 * 生成 PNG 图标脚本
 * 运行: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')

// 图标尺寸
const sizes = [16, 32, 48, 128]

// 图标 path 数据
const iconPath = 'M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025'

// 创建 SVG 内容 - 无背景，只有图标
function createSvg(size, iconColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <path fill="${iconColor}" d="${iconPath}"/>
</svg>`
}

async function generateIcon(size, suffix, iconColor) {
  const svg = createSvg(size, iconColor)
  const filename = suffix ? `icon-${size}-${suffix}.png` : `icon-${size}.png`
  const filepath = join(iconsDir, filename)
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(filepath)
  
  console.log(`✓ Generated ${filename}`)
}

async function main() {
  console.log('Generating PNG icons...\n')
  
  for (const size of sizes) {
    // 默认图标 - 白色（用于浏览器工具栏深色背景）
    await generateIcon(size, '', '#ffffff')
    
    // 激活图标 - 绿色
    await generateIcon(size, 'active', '#22c55e')
  }
  
  console.log('\n✓ All icons generated!')
}

main().catch(console.error)
