"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Shortcuts() {
  const t = useTranslations("shortcuts");

  const shortcuts = [
    { key: "V", action: "inspector" },
    { key: "I", action: "colorPicker" },
    { key: "F", action: "search" },
    { key: "S", action: "sidePanel" },
    { key: "A", action: "inspectAll" },
    { key: "↑", action: "selectParent" },
    { key: "↓", action: "selectChild" },
    { key: "P", action: "pause" },
    { key: "Esc", action: "close" },
  ];

  return (
    <section id="shortcuts" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.action}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <span className="text-sm font-medium">{t(shortcut.action)}</span>
                <kbd className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded border border-border bg-muted px-2 font-mono text-sm font-semibold text-foreground">
                  {shortcut.key}
                </kbd>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
