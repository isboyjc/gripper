"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Github } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Logo } from "./logo";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold">Gripper</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("features")}
            </a>
            <a
              href="#shortcuts"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("shortcuts")}
            </a>
            <a
              href="#installation"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("installation")}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/isboyjc/gripper"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
