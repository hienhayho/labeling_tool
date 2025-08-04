"use client";

import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

const languages = {
  vi: {
    name: "Tiếng Việt",
    flag: "🇻🇳",
  },
  en: {
    name: "English",
    flag: "🇺🇸",
  },
  ja: {
    name: "日本語",
    flag: "🇯🇵",
  },
  zh: {
    name: "中文",
    flag: "🇨🇳",
  },
  fr: {
    name: "Français",
    flag: "🇫🇷",
  },
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    const pathSegments = pathname.split("/");

    // Check if the first segment is a locale
    if (locales.includes(pathSegments[1] as Locale)) {
      pathSegments[1] = newLocale;
    } else {
      // If no locale in path, add it
      pathSegments.splice(1, 0, newLocale);
    }

    const newPath = pathSegments.join("/") || "/";
    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[200px] border-gray-200 dark:border-gray-700">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>
          {languages[locale as Locale].flag} {languages[locale as Locale].name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((lng) => (
          <SelectItem key={lng} value={lng}>
            <span className="flex items-center gap-2">
              {languages[lng].flag} {languages[lng].name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
