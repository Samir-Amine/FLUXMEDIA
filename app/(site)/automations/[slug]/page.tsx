import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft, Plug } from "lucide-react";
import { getDb, sortBy } from "@/lib/db";
import { t } from "@/lib/i18n";
import { L } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import { Icon, Reveal, ArrowIcon, CheckIcon } from "@/components/ui";
import { Flow } from "@/components/home-sections";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const db = getDb();
  const a = db.automations.find((x) => x.slug === params.slug);
  if (!a) return { title: "Automation" };
  return {
    title: `${a.title.en} — AI Automation`,
    description: a.short.en,
    openGraph: { title: `${a.title.en} | FLUXMEDIA`, description: a.short.en },
  };
}

export default function AutomationDetail({ params }: { params: { slug: string } }) {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = getDb();
  const a = db.automations.find((x) => x.slug === params.slug && x.active);
  if (!a) notFound();
  const cat = db.categories.find((c) => c.slug === a.category);
  const related = sortBy(db.automations.filter((x) => x.active && x.id !== a.id), (x) => x.order).slice(0, 3);

  return (
    <div className="relative overflow-hidden pb-16 pt-36">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="glow-orb -top-20 end-1/4 h-80 w-80 bg-violet/15" />
      <div className="container-x relative">
        <Reveal>
          <Link href="/automations" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-sky">
            <ArrowLeft className="h-4 w-4 rtl-flip" />
            {t(locale, "aut.back")}
          </Link>
        </Reveal>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue to-violet text-white shadow-glow-sm">
                <Icon name={a.icon} className="h-7 w-7" />
              </span>
              <span className="tag">{cat ? L(cat.name, locale) : a.category}</span>
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {L(a.title, locale)}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{L(a.description, locale)}</p>

            <h2 className="mt-10 font-display text-lg font-bold">{t(locale, "aut.benefits")}</h2>
            <ul className="mt-4 space-y-3">
              {a.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-ink/90 sm:text-base">
                  <CheckIcon /> {L(b, locale)}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 flex items-center gap-2 font-display text-lg font-bold">
              <Plug className="h-4 w-4 text-sky" /> {t(locale, "aut.integrations")}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {a.integrations.map((i) => (
                <span key={i} className="rounded-full border border-line/25 bg-surface2/70 px-4 py-1.5 text-xs font-semibold text-ink/85">
                  {i}
                </span>
              ))}
            </div>

            <Link href={`/request?automation=${a.slug}`} className="btn-brand mt-10">
              {t(locale, "aut.request")}
              <ArrowIcon />
            </Link>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card relative overflow-hidden p-8">
              <div className="bg-grid absolute inset-0 opacity-60" />
              <h2 className="relative text-center text-sm font-bold uppercase tracking-widest text-muted">
                {t(locale, "aut.workflow")}
              </h2>
              <div className="relative mt-6 flex justify-center">
                <Flow nodes={a.workflow.map((w) => L(w, locale))} />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-xl font-bold">{t(locale, "aut.title")}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/automations/${r.slug}`} className="group card p-6 transition hover:border-indigo/50">
                <Icon name={r.icon} className="h-6 w-6 text-sky" />
                <h3 className="mt-3 font-display text-base font-bold">{L(r.title, locale)}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted">{L(r.short, locale)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
