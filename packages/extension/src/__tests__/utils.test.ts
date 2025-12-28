import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, debounce, throttle, generateId, formatPx, parsePx } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('应该合并类名', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('应该处理条件类名', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
    })

    it('应该处理对象形式的类名', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo')
    })

    it('应该合并 Tailwind 类名冲突', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('应该处理数组形式的类名', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该延迟执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在多次调用时只执行最后一次', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该传递参数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1', 'arg2')
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该立即执行第一次调用', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在节流期间忽略后续调用', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在节流期结束后允许新调用', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      vi.advanceTimersByTime(100)
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
    })

    it('应该生成非空字符串', () => {
      const id = generateId()

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('formatPx', () => {
    it('应该格式化像素值', () => {
      expect(formatPx(100)).toBe('100px')
      expect(formatPx(0)).toBe('0px')
      expect(formatPx(3.5)).toBe('3.5px')
    })
  })

  describe('parsePx', () => {
    it('应该解析像素值', () => {
      expect(parsePx('100px')).toBe(100)
      expect(parsePx('0px')).toBe(0)
      expect(parsePx('3.5px')).toBe(3.5)
    })

    it('应该处理无效值', () => {
      expect(parsePx('auto')).toBe(0)
      expect(parsePx('')).toBe(0)
    })
  })
})
