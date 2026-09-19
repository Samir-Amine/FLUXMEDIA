"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Automation, Category } from "@/lib/types";
import { L, cx } from "@/lib/utils";
import { useI18n } from "./providers";
import { Icon, Reveal, ArrowIcon } from "./ui";

export default function AutomationsBrowser({
  automations,
  categories,
}: {
  automations: Automation[];
  categories: Category[];
}) {
  const { locale, t } = useI18n();
  const [cat, setCat] = useState<string>("all");
  const list = automations.filter((a) => cat === "all" || a.category === cat);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label={t("aut.title")}>
        <button
          role="tab"
          aria-selected={cat === "all"}
          onClick={() => setCat("all")}
          className={cx(
            "rounded-full border px-4 py-2 text-xs font-bold transition",
            cat === "all"
              ? "border-transparent bg-brand text-white shadow-glow-sm"
              : "border-line/25 bg-surface2/60 text-muted hover:text-ink"
          )}
        >
          {t("aut.all")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={cat === c.slug}
            onClick={() => setCat(c.slug)}
            className={cx(
              "rounded-full border px-4 py-2 text-xs font-bold transition",
              cat === c.slug
                ? "border-transparent bg-brand text-white shadow-glow-sm"
                : "border-line/25 bg-surface2/60 text-muted hover:text-ink"
            )}
          >
            {L(c.name, locale)}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((a) => (
            <motion.div
              layout
              key={a.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href={`/automations/${a.slug}`}
                className="group card flex h-full flex-col p-7 transition hover:border-indigo/50 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue to-indigo text-white shadow-glow-sm">
                    <Icon name={a.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-surface2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {L(categories.find((c) => c.slug === a.category)?.name, locale) || a.category}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{L(a.title, locale)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{L(a.short, locale)}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky">
                  {t("aut.request")}
                  <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <p className="mt-16 text-center text-muted">{t("aut.empty")}</p>
      )}
    </div>
  );
}
