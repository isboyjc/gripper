"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  size?: number;
  /**
   * 如果为 true，强制使用白色图标（用于渐变背景）
   * 如果为 false 或未设置，根据主题自动切换（暗色模式用白色，亮色模式用黑色）
   */
  forceWhite?: boolean;
}

export function Logo({ className = "", size = 32, forceWhite = false }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 确定当前主题（考虑系统主题）
  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  // 如果强制白色或暗色模式，使用白色；否则使用黑色
  const iconColor = forceWhite || (mounted && isDark) ? "#FFFFFF" : "#000000";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-label="Gripper Logo"
    >
      {/* Icon from Material Symbols by Google */}
      <path
        fill={iconColor}
        d="M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025"
      />
    </svg>
  );
}
