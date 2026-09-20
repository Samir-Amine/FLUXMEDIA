"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useI18n, useTheme } from "./providers";
import { Logo, ArrowIcon } from "./ui";
import { LOCALES, LOCALE_LABEL } from "@/lib/i18n";
import { cx } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={cx(
        "inline-flex items-center rounded-full border border-line/20 bg-surface2/70 p-0.5",
        compact && "w-full justify-center"
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cx(
            "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition",
            locale === l
              ? "bg-brand text-white shadow-glow-sm"
              : "text-muted hover:text-ink"
          )}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  return (
    <button
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
      className="grid h-9 w-9 place-items-center rounded-full border border-line/20 bg-surface2/70 text-muted transition hover:text-ink hover:border-indigo/50"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Navbar({ items }: { items: { href: string; label: string }[] }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-line/15 bg-bg/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="FLUXMEDIA home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                pathname === it.href
                  ? "bg-surface2 text-ink"
                  : "text-muted hover:bg-surface2/60 hover:text-ink"
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href="/request" className="btn-brand !px-5 !py-2.5">
            {t("nav.start")}
            <ArrowIcon />
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-surface2/70 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label={t("nav.menu")}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-x flex h-16 items-center justify-between">
              <Logo />
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-line/20 bg-surface2/70"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="container-x mt-6 flex flex-col gap-1" aria-label="Mobile">
              {items.map((it, i) => (
                <motion.div
                  key={it.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={it.href}
                    className={cx(
                      "block rounded-2xl px-5 py-4 font-display text-xl font-bold",
                      pathname === it.href ? "bg-surface2 text-ink" : "text-muted"
                    )}
                  >
                    {it.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="container-x mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <Link href="/request" className="btn-brand w-full">
                {t("nav.start")}
                <ArrowIcon />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
