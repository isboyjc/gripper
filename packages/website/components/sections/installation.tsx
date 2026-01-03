"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Store, Terminal } from "lucide-react";

export function Installation() {
  const t = useTranslations("installation");

  return (
    <section id="installation" className="py-20">
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

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border border-border bg-card p-8"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="mb-4 text-xl font-semibold">{t("fromStore")}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{t("chromeStore")}</p>
              <p>{t("firefoxStore")}</p>
              <p>
                <a
                  href="https://microsoftedge.microsoft.com/addons/detail/gripper-devtools-for-de/pannoklocjjbimmifjanjchpbfonbkhn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("edgeStore")}
                </a>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-lg border border-border bg-card p-8"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Terminal className="h-6 w-6" />
            </div>
            <h3 className="mb-4 text-xl font-semibold">{t("manual")}</h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-sm font-medium">{t("step1")}</p>
                <code className="block rounded bg-muted p-2 text-xs">
                  git clone https://github.com/isboyjc/gripper.git
                </code>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">{t("step2")}</p>
                <code className="block rounded bg-muted p-2 text-xs">
                  pnpm install
                </code>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">{t("step3")}</p>
                <code className="block rounded bg-muted p-2 text-xs">
                  pnpm build:chrome
                </code>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
