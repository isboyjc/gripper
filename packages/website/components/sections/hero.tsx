"use client";

import { useTranslations } from "next-intl";
import { Github, Chrome, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

export function Hero() {
  const t = useTranslations("hero");

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

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Chrome className="h-5 w-5" />
              {t("downloadChrome")}
              <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs">
                {t("comingSoon")}
              </span>
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Firefox & Edge {t("comingSoon")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
