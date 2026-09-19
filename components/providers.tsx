"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";
import { t as translate } from "@/lib/i18n";

interface I18nCtx {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
}
interface ThemeCtx {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const I18nContext = createContext<I18nCtx>(null as never);
const ThemeContext = createContext<ThemeCtx>(null as never);

export const useI18n = () => useContext(I18nContext);
export const useTheme = () => useContext(ThemeContext);

export function Providers({
  locale,
  theme,
  children,
}: {
  locale: Locale;
  theme: "dark" | "light";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [curTheme, setCurTheme] = useState(theme);

  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = l;
      router.refresh();
    },
    [router]
  );

  const toggleTheme = useCallback(() => {
    setCurTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: curTheme, toggleTheme }}>
      <I18nContext.Provider value={{ locale, t: (k) => translate(locale, k), setLocale }}>
        {children}
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}
