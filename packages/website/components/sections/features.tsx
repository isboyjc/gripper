"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Pointer,
  Pipette,
  Camera,
  Type,
  Grid3x3,
  Download,
  Search,
  PanelRight,
  Keyboard,
  Moon,
  Languages,
  Layers,
} from "lucide-react";

const featureIcons = {
  inspector: Pointer, // 与扩展插件中的 inspector 工具一致
  colorPicker: Pipette, // 与扩展插件中的 eyedropper 工具一致
  screenshot: Camera, // 与扩展插件中的 screenshot 工具一致
  typography: Type, // 侧边栏中的 TypographyList 功能
  boxModel: Grid3x3, // 与扩展插件中的 layout-visualizer 工具一致
  assetExport: Download, // 与扩展插件中的 AssetsList 下载功能一致
  elementSearch: Search, // 与扩展插件中的 search 工具一致
  sidePanel: PanelRight, // 与扩展插件中的 sidepanel 工具一致
  shortcuts: Keyboard, // 键盘快捷键功能
  darkMode: Moon, // 暗色模式功能
  i18n: Languages, // 国际化功能
  perTab: Layers, // 每标签页独立状态功能
};

export function Features() {
  const t = useTranslations("features");

  const features = [
    "inspector",
    "colorPicker",
    "screenshot",
    "typography",
    "boxModel",
    "assetExport",
    "elementSearch",
    "sidePanel",
    "shortcuts",
    "darkMode",
    "i18n",
    "perTab",
  ];

  return (
    <section id="features" className="py-20">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = featureIcons[feature as keyof typeof featureIcons];
            return (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t(`${feature}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`${feature}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
