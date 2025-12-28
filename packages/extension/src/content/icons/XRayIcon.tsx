interface IconProps {
  size?: number
  className?: string
}

/**
 * X-Ray 图标 - 用于透视模式
 */
export function XRayIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
    </svg>
  )
}
