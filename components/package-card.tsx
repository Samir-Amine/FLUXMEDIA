"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SocialPackage } from "@/lib/types";
import { L, fmtPrice, cx } from "@/lib/utils";
import { useI18n } from "./providers";
import { CheckIcon, ArrowIcon, PlatformGlyph } from "./ui";

export function PackageCard({ pkg, index = 0 }: { pkg: SocialPackage; index?: number }) {
  const { locale, t } = useI18n();
  const badge = L(pkg.badge, locale);
  const features = [...pkg.features].sort((a, b) => a.order - b.order);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className={cx(
        "relative flex h-full flex-col rounded-3xl border p-8 transition duration-300",
        pkg.popular
          ? "border-indigo/60 bg-surface shadow-glow"
          : "border-line/15 bg-surface/80 hover:border-indigo/40"
      )}
    >
      {(pkg.popular || badge) && (
        <span className="absolute -top-3 start-8 rounded-full bg-brand px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-glow-sm">
          {badge || t("sm.popular")}
        </span>
      )}
      <h3 className="font-display text-2xl font-bold">{pkg.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{L(pkg.description, locale)}</p>
      <div className="mt-6 flex items-end gap-1.5">
        <span className="font-display text-4xl font-extrabold tracking-tight" dir="ltr">
          {fmtPrice(pkg.price, pkg.currency)}
        </span>
        <span className="pb-1.5 text-sm text-muted">{L(pkg.billingPeriod, locale)}</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface2/60 p-3 text-center">
        {[
          [pkg.postsPerMonth, t("sm.posts")],
          [pkg.reelsPerMonth, t("sm.reels")],
          [pkg.storiesPerMonth, t("sm.stories")],
        ].map(([n, l]) => (
          <div key={String(l)}>
            <p className="font-display text-lg font-bold text-sky">{n}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{l}</p>
          </div>
        ))}
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f.id} className="flex items-start gap-2.5 text-sm text-ink/90">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
            {L(f.text, locale)}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-2 text-muted">
        {pkg.platforms.map((p) => (
          <PlatformGlyph key={p} id={p} className="h-4 w-4" />
        ))}
      </div>

      <Link
        href={`/request/social-media?package=${pkg.slug}`}
        className={cx("mt-7 w-full", pkg.popular ? "btn-brand" : "btn-ghost")}
      >
        {t("sm.start")}
        <ArrowIcon />
      </Link>
    </motion.div>
  );
}
