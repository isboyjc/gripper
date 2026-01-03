"use client";

import { useTranslations } from "next-intl";
import { Github } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { EdgeIcon } from "@/components/icons/EdgeIcon";
import { ChromeIcon } from "@/components/icons/ChromeIcon";
import { FirefoxIcon } from "@/components/icons/FirefoxIcon";
import { useBrowser } from "@/hooks/useBrowser";

type BrowserButton = {
  id: 'chrome' | 'edge' | 'firefox';
  href: string;
  label: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
};

export function Hero() {
  const t = useTranslations("hero");
  const browser = useBrowser();

  // 定义所有浏览器按钮
  const browserButtons: BrowserButton[] = [
    {
      id: 'chrome',
      href: 'https://chrome.google.com/webstore',
      label: t("downloadChrome"),
      icon: <ChromeIcon size={20} className="h-5 w-5" />,
      comingSoon: true,
    },
    {
      id: 'edge',
      href: 'https://microsoftedge.microsoft.com/addons/detail/gripper-devtools-for-de/pannoklocjjbimmifjanjchpbfonbkhn',
      label: t("downloadEdge"),
      icon: <EdgeIcon size={20} className="h-5 w-5" />,
    },
    {
      id: 'firefox',
      href: '#',
      label: t("downloadFirefox"),
      icon: <FirefoxIcon size={20} className="h-5 w-5" />,
      comingSoon: true,
    },
  ];

  // 根据当前浏览器排序：匹配的浏览器放在第一位，默认 Chrome 在第一位
  const sortedButtons = [...browserButtons].sort((a, b) => {
    const currentBrowser = browser === 'other' ? 'chrome' : browser;
    
    // 当前浏览器排在第一位
    if (a.id === currentBrowser) return -1;
    if (b.id === currentBrowser) return 1;
    
    // 其他按钮保持原顺序：Chrome -> Edge -> Firefox
    const order: Record<string, number> = { chrome: 0, edge: 1, firefox: 2 };
    return (order[a.id] || 999) - (order[b.id] || 999);
  });

  // 分离主要按钮（第一排）和其他按钮（第二排）
  const primaryButton = sortedButtons[0];
  const otherButtons = sortedButtons.slice(1);

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-8 inline-flex items-center justify-center">
            <Logo size={64} />
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            {t("title")}
          </h1>

          <p className="mb-2 text-2xl font-semibold sm:text-3xl">
            {t("subtitle")}
          </p>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
            {t("description")}
          </p>

          {/* 第一排：主要浏览器按钮（当前浏览器） */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={primaryButton.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryButton.icon}
              {primaryButton.label}
              {primaryButton.comingSoon && (
                <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs">
                  {t("comingSoon")}
                </span>
              )}
            </a>

            <a
              href="https://github.com/isboyjc/gripper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <Github className="h-5 w-5" />
              {t("viewOnGitHub")}
            </a>
          </div>

          {/* 第二排：其他浏览器按钮（一个一行，无边框） */}
          {otherButtons.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2">
              {otherButtons.map((button) => (
                <a
                  key={button.id}
                  href={button.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {button.icon}
                  {button.label}
                  {button.comingSoon && (
                    <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t("comingSoon")}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
