"use client";

import { useEffect, useState } from "react";
import { detectBrowser } from "@/lib/utils";

type BrowserType = 'chrome' | 'edge' | 'firefox' | 'other';

/**
 * 自定义 Hook：检测用户当前使用的浏览器
 */
export function useBrowser(): BrowserType {
  const [browser, setBrowser] = useState<BrowserType>('other');

  useEffect(() => {
    // 只在客户端执行
    setBrowser(detectBrowser());
  }, []);

  return browser;
}
