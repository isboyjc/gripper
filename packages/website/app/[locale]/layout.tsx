import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gripper.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  const title = isZh
    ? "Gripper - 为设计师打造的开发工具"
    : "Gripper - DevTools for Designers";
  const description = isZh
    ? "一款为开发者和设计师设计的强大浏览器扩展。轻松检查元素、拾取颜色、分析排版、截取屏幕截图和导出资源。"
    : "A powerful browser extension designed for developers and designers. Inspect elements, pick colors, analyze typography, capture screenshots, and export assets with ease.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | Gripper`,
    },
    description,
    keywords: isZh
      ? [
          "浏览器扩展",
          "开发工具",
          "设计师工具",
          "元素检查器",
          "颜色拾取器",
          "截图工具",
          "Chrome扩展",
          "Firefox扩展",
        ]
      : [
          "browser extension",
          "devtools",
          "designer tools",
          "element inspector",
          "color picker",
          "screenshot tool",
          "chrome extension",
          "firefox extension",
        ],
    authors: [{ name: "isboyjc", url: "https://github.com/isboyjc" }],
    creator: "isboyjc",
    publisher: "isboyjc",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/icon.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico",
      apple: { url: "/icons/icon.png", sizes: "512x512", type: "image/png" },
    },
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: `${baseUrl}/${locale}`,
      siteName: "Gripper",
      title,
      description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@isboyjc",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
