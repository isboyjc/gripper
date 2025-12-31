"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const currentLocale = params.locale as string;

  const toggleLanguage = () => {
    const newLocale = currentLocale === "en" ? "zh" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span>{currentLocale === "en" ? "中文" : "English"}</span>
    </button>
  );
}
