import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "zh"];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
