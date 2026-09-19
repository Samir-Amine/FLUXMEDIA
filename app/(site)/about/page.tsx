import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Cpu, Megaphone } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { Reveal, SectionHead, ArrowIcon, CheckIcon } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "FLUXMEDIA combines AI automation and social media management to build practical systems that help businesses operate efficiently and communicate consistently.",
  openGraph: { title: "About FLUXMEDIA" },
};

export default function AboutPage() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const tr = (k: string) => t(locale, k);
  const autoEx = Array.from({ length: 8 }, (_, i) => tr(`spec.autoEx.${i + 1}`));
  const smEx = Array.from({ length: 9 }, (_, i) => tr(`sh.c${i + 1}`));

  return (
    <div className="relative overflow-hidden">
      <section className="relative pb-16 pt-36">
        <div className="bg-grid absolute inset-0" />
        <div className="glow-orb -top-24 start-[20%] h-96 w-96 bg-indigo/25" />
        <div className="container-x relative mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="tag">{tr("about.badge")}</span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              {tr("about.title")}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">{tr("about.sub")}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="container-x">
          <Reveal>
            <div className="card relative overflow-hidden p-10 sm:p-14">
              <div className="glow-orb -end-20 -top-20 h-64 w-64 bg-violet/20" />
              <p className="relative max-w-3xl text-lg leading-relaxed text-ink/90 sm:text-xl">{tr("about.m1")}</p>
              <p className="relative mt-6 font-display text-xl font-bold grad-text">{tr("about.m2")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <SectionHead title={tr("about.whatT")} sub={tr("about.whatSub")} />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              { icon: Cpu, title: tr("spec.autoTitle"), desc: tr("about.autoD"), ex: autoEx, href: "/automations", cta: tr("spec.autoCta"), tone: "from-blue to-indigo" },
              { icon: Megaphone, title: tr("spec.smTitle"), desc: tr("about.smD"), ex: smEx, href: "/social-media", cta: tr("spec.smCta"), tone: "from-indigo to-violet" },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.1}>
                <div className="card h-full p-8 sm:p-10">
                  <span className={`inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.tone} text-white shadow-glow-sm`}>
                    <c.icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-6 font-display text-2xl font-bold">{c.title}</h2>
                  <p className="mt-3 text-muted">{c.desc}</p>
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {c.ex.map((e) => (
                      <li key={e} className="flex items-center gap-2 text-sm"><CheckIcon /> {e}</li>
                    ))}
                  </ul>
                  <Link href={c.href} className="btn-ghost mt-8 !px-5 !py-2.5">{c.cta}<ArrowIcon /></Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-x">
          <SectionHead title={tr("about.apprT")} sub={tr("about.apprSub")} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="card h-full p-6 text-center transition hover:border-indigo/50">
                  <span className="grad-text font-display text-2xl font-black">0{i}</span>
                  <h3 className="mt-3 font-display text-lg font-bold">{tr(`about.pr${i}t`)}</h3>
                  <p className="mt-2 text-sm text-muted">{tr(`about.pr${i}d`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-indigo/30 bg-surface p-12 text-center">
              <div className="glow-orb -top-20 start-1/3 h-64 w-64 bg-indigo/30" />
              <h2 className="section-title relative">{tr("final.t")}</h2>
              <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/request" className="btn-brand">{tr("final.c1")}<ArrowIcon /></Link>
                <Link href="/contact" className="btn-ghost">{tr("contact.title")}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
