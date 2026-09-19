import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDb, sortBy } from "@/lib/db";
import { t } from "@/lib/i18n";
import { L } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import { Reveal, SectionHead, Icon, ArrowIcon, PlatformGlyph, CheckIcon } from "@/components/ui";
import { PackageCard } from "@/components/package-card";
import { FaqList } from "@/components/faq";

export const dynamic = "force-dynamic";

const PLATFORM_NAME: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn",
  tiktok: "TikTok", youtube: "YouTube", x: "X / Twitter",
};

export function generateMetadata(): Metadata {
  const c = getDb().socialPage;
  return {
    title: "Social Media Management",
    description: c.heroDescription.en,
    openGraph: { title: `${c.heroTitle.en} | FLUXMEDIA`, description: c.heroDescription.en },
  };
}

export default function SocialMediaPage() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = getDb();
  const c = db.socialPage;
  const packages = sortBy(db.packages.filter((p) => p.visible), (p) => p.order);
  const faqs = sortBy(db.faqs.filter((f) => f.visible), (f) => f.order);
  const services = sortBy(c.services, (s) => s.order);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pb-16 pt-36">
        <div className="bg-grid absolute inset-0" />
        <div className="glow-orb -top-24 start-[15%] h-96 w-96 bg-violet/25" />
        <div className="glow-orb top-20 end-[10%] h-80 w-80 bg-blue/20" />
        <div className="container-x relative mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="tag">{L(c.heroBadge, locale)}</span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {L(c.heroTitle, locale)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {L(c.heroDescription, locale)}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a href="#packages" className="btn-brand">
                {L(c.primaryCta, locale)}
                <ArrowIcon />
              </a>
              <Link href="/contact" className="btn-ghost">{L(c.secondaryCta, locale)}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container-x">
          <SectionHead title={L(c.servicesTitle, locale)} sub={L(c.servicesDescription, locale)} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <div className="card group h-full p-6 transition hover:border-indigo/50 hover:shadow-glow">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo to-violet text-white shadow-glow-sm">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold">{L(s.title, locale)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{L(s.description, locale)}</p>
                  <ul className="mt-4 space-y-1.5">
                    {s.deliverables.map((d, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-ink/80">
                        <CheckIcon className="h-3.5 w-3.5 text-sky" /> {L(d, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20">
        <div className="container-x">
          <SectionHead title={L(c.platformsTitle, locale)} sub={L(c.platformsDescription, locale)} />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {c.platforms.map((p, i) => (
              <Reveal key={p} delay={i * 0.05}>
                <div className="card group flex flex-col items-center gap-3 p-6 transition hover:border-indigo/50 hover:bg-surface2/80">
                  <PlatformGlyph id={p} className="h-8 w-8 text-muted transition group-hover:text-sky" />
                  <span className="text-sm font-semibold">{PLATFORM_NAME[p] || p}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted/70">
            {locale === "fr"
              ? "Gestion via les outils officiels de chaque plateforme. Aucune connexion API automatique n'est revendiquée."
              : locale === "ar"
                ? "تتم الإدارة عبر الأدوات الرسمية لكل منصة. لا ندّعي وجود ربط برمجي تلقائي."
                : "Managed through each platform's official business tools. No automatic API integration is claimed."}
          </p>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="relative scroll-mt-24 py-20">
        <div className="glow-orb top-1/3 start-1/2 h-96 w-96 -translate-x-1/2 bg-indigo/15" />
        <div className="container-x relative">
          <SectionHead title={L(c.packagesTitle, locale)} sub={L(c.packagesDescription, locale)} />
          {packages.length ? (
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {packages.map((p, i) => (
                <PackageCard key={p.id} pkg={p} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-muted">—</p>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="container-x">
          <SectionHead title={L(c.processTitle, locale)} sub={L(c.processDescription, locale)} />
          <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="absolute inset-x-10 top-7 hidden h-px bg-gradient-to-r from-blue/50 via-indigo/50 to-violet/50 lg:block" />
            {c.processSteps.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.07}>
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl border border-line/25 bg-surface font-display text-sm font-black text-sky shadow-glow-sm">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{L(s.title, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{L(s.description, locale)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-20">
          <div className="container-x">
            <SectionHead title={t(locale, "sm.faq")} />
            <div className="mt-12">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-10">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-indigo/30 bg-surface p-12 text-center sm:p-16">
              <div className="glow-orb -top-20 start-1/4 h-64 w-64 bg-violet/30" />
              <div className="glow-orb -bottom-20 end-1/4 h-64 w-64 bg-blue/25" />
              <h2 className="section-title relative">{L(c.finalCtaTitle, locale)}</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-muted">{L(c.finalCtaDescription, locale)}</p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                <a href="#packages" className="btn-brand">{L(c.finalCtaPrimary, locale)}<ArrowIcon /></a>
                <Link href="/contact" className="btn-ghost">{L(c.finalCtaSecondary, locale)}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
