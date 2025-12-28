import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('初始状态 copied 应该为 false', () => {
    const { result } = renderHook(() => useCopyToClipboard())

    expect(result.current.copied).toBe(false)
  })

  it('复制成功后 copied 应该为 true', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('test text')
    })

    expect(result.current.copied).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
  })

  it('复制成功后应该自动重置状态', async () => {
    const { result } = renderHook(() => useCopyToClipboard(1000))

    await act(async () => {
      await result.current.copy('test text')
    })

    expect(result.current.copied).toBe(true)

    // 等待自动重置
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.copied).toBe(false)
  })

  it('reset 应该重置状态', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('test text')
    })

    expect(result.current.copied).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.copied).toBe(false)
  })

  it('copy 应该返回成功状态', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    let success: boolean = false
    await act(async () => {
      success = await result.current.copy('test text')
    })

    expect(success).toBe(true)
  })
})
