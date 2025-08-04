import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Import all message files explicitly
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import zhMessages from "@/messages/zh.json";
import frMessages from "@/messages/fr.json";

export const locales = ["vi", "en", "ja", "zh", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

const messages = {
  vi: viMessages,
  en: enMessages,
  ja: jaMessages,
  zh: zhMessages,
  fr: frMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: messages[locale as Locale],
  };
});
