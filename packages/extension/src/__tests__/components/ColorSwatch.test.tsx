import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ColorSwatch } from '@/content/ui/SidePanel/components/ColorSwatch'

describe('ColorSwatch', () => {
  it('应该渲染颜色色块', () => {
    const { container } = render(<ColorSwatch color="#ff0000" />)

    const swatch = container.firstChild
    expect(swatch).toBeInTheDocument()
  })

  it('应该应用正确的尺寸', () => {
    const { container } = render(<ColorSwatch color="#ff0000" size={24} />)

    const swatch = container.firstChild as HTMLElement
    expect(swatch.style.width).toBe('24px')
    expect(swatch.style.height).toBe('24px')
  })

  it('应该使用默认尺寸', () => {
    const { container } = render(<ColorSwatch color="#ff0000" />)

    const swatch = container.firstChild as HTMLElement
    expect(swatch.style.width).toBe('16px')
    expect(swatch.style.height).toBe('16px')
  })

  it('应该应用自定义类名', () => {
    const { container } = render(
      <ColorSwatch color="#ff0000" className="custom-class" />
    )

    const swatch = container.firstChild
    expect(swatch).toHaveClass('custom-class')
  })
})
