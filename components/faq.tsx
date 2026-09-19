"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Faq } from "@/lib/types";
import { L, cx } from "@/lib/utils";
import { useI18n } from "./providers";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const { locale } = useI18n();
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line/10 rounded-3xl border border-line/15 bg-surface/70">
      {faqs.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id}>
            <button
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-${f.id}`}
            >
              <span className="font-semibold">{L(f.question, locale)}</span>
              <Plus className={cx("h-5 w-5 shrink-0 text-sky transition", isOpen && "rotate-45")} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-${f.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-sm leading-relaxed text-muted">{L(f.answer, locale)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
