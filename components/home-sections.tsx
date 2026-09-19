"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Cpu, Megaphone, Heart, MessageSquare, Share2, Bookmark,
  CalendarDays, BarChart3, Send, Zap, Workflow, Repeat, Users2, Handshake,
} from "lucide-react";
import { useI18n } from "./providers";
import { Reveal, SectionHead, ArrowIcon, PlatformGlyph, CheckIcon } from "./ui";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ── Animated connector with travelling pulse ─────────────── */
function Pulse({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <span className={`relative ${horizontal ? "h-px w-8 shrink-0" : "h-7 w-px shrink-0"} overflow-visible bg-gradient-to-b from-blue/60 to-violet/60 ${horizontal ? "!bg-gradient-to-r" : ""}`}>
      <motion.span
        className="absolute h-1.5 w-1.5 rounded-full bg-sky shadow-glow-sm"
        style={horizontal ? { top: -3 } : { left: -3 }}
        animate={horizontal ? { left: ["0%", "100%"], opacity: [0, 1, 0] } : { top: ["0%", "100%"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}

function Node({ label, tone = "blue" }: { label: string; tone?: "blue" | "violet" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
        tone === "blue"
          ? "border-blue/30 bg-blue/10 text-sky"
          : "border-violet/30 bg-violet/10 text-[#c4a7ff]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone === "blue" ? "bg-sky" : "bg-violet"} animate-pulseDot`} />
      {label}
    </span>
  );
}

export function Flow({ nodes, tone = "blue" }: { nodes: string[]; tone?: "blue" | "violet" }) {
  return (
    <div className="flex flex-col items-center gap-0">
      {nodes.map((n, i) => (
        <div key={n + i} className="flex flex-col items-center">
          {i > 0 && <Pulse />}
          <Node label={n} tone={i >= nodes.length - 2 ? "violet" : tone} />
        </div>
      ))}
    </div>
  );
}

/* ── 1. Hero ──────────────────────────────────────────────── */
export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pb-20 pt-36">
      <div className="bg-grid absolute inset-0" />
      <div className="glow-orb -top-32 start-[10%] h-[420px] w-[420px] bg-indigo/25" />
      <div className="glow-orb top-40 end-[5%] h-[380px] w-[380px] bg-violet/20" />
      <div className="container-x relative grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <span className="tag">
            <Zap className="h-3.5 w-3.5" />
            {t("hero.badge")}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {t("hero.t1")}
            <br />
            <span className="grad-text">{t("hero.t2")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{t("hero.sub")}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/request" className="btn-brand">
              {t("hero.cta1")}
              <ArrowIcon />
            </Link>
            <Link href="/automations" className="btn-ghost">
              {t("hero.cta2")}
            </Link>
          </div>
        </Reveal>

        {/* Hero visual composition */}
        <Reveal delay={0.15} className="relative hidden lg:block">
          <div className="relative mx-auto h-[500px] w-[460px]">
            <div className="absolute inset-0 rounded-[32px] bg-brand-soft blur-2xl" />
            {/* automation card */}
            <motion.div
              className="glass absolute start-0 top-2 w-[230px] rounded-2xl p-4 shadow-card"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-muted">
                <Workflow className="h-4 w-4 text-sky" /> WhatsApp → CRM
              </div>
              <div className="mt-3 space-y-2">
                {["Lead captured", "AI qualified", "CRM updated"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 rounded-lg bg-surface2/80 px-3 py-2 text-[11px] font-medium text-ink/90">
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 2 ? "bg-violet" : "bg-sky"} animate-pulseDot`} />
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
            {/* social post card */}
            <motion.div
              className="glass absolute end-0 top-14 w-[210px] rounded-2xl p-4 shadow-card"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-[10px] font-black text-white">FM</span>
                <div>
                  <p className="text-xs font-bold">FLUXMEDIA</p>
                  <p className="text-[10px] text-muted">@fluxmedia</p>
                </div>
                <PlatformGlyph id="instagram" className="ms-auto h-4 w-4 text-muted" />
              </div>
              <div className="mt-3 h-20 rounded-xl bg-gradient-to-br from-blue/40 via-indigo/40 to-violet/40" />
              <div className="mt-3 flex items-center gap-4 text-muted">
                <span className="flex items-center gap-1 text-[11px]"><Heart className="h-3.5 w-3.5 text-sky" /> 482</span>
                <span className="flex items-center gap-1 text-[11px]"><MessageSquare className="h-3.5 w-3.5" /> 36</span>
                <span className="flex items-center gap-1 text-[11px]"><Share2 className="h-3.5 w-3.5" /> 18</span>
                <Bookmark className="ms-auto h-3.5 w-3.5" />
              </div>
            </motion.div>
            {/* analytics card */}
            <motion.div
              className="glass absolute bottom-4 start-6 w-[250px] rounded-2xl p-4 shadow-card"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
            >
              <div className="flex items-center justify-between text-xs font-bold text-muted">
                <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-violet" /> Reach</span>
                <span className="text-sky">+38%</span>
              </div>
              <div className="mt-3 flex h-16 items-end gap-1.5">
                {[34, 48, 40, 62, 55, 74, 88].map((h, i) => (
                  <motion.span
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-indigo to-sky"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 * i }}
                  />
                ))}
              </div>
            </motion.div>
            {/* message bubble */}
            <motion.div
              className="glass absolute bottom-[104px] end-0 flex items-center gap-2 rounded-2xl rounded-ee-sm px-4 py-2.5 text-[11px] font-semibold shadow-card"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <Send className="h-3.5 w-3.5 text-sky rtl-flip" /> New lead → CRM
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 2. Specialties ───────────────────────────────────────── */
export function Specialties() {
  const { t } = useI18n();
  const autoEx = range(8).map((i) => t(`spec.autoEx.${i + 1}`));
  const smEx = range(8).map((i) => t(`spec.smEx.${i + 1}`));
  return (
    <section className="relative py-24">
      <div className="container-x">
        <SectionHead badge="FLUXMEDIA" title={t("spec.title")} sub={t("spec.sub")} />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {[
            { icon: Cpu, title: t("spec.autoTitle"), desc: t("spec.autoDesc"), ex: autoEx, cta: t("spec.autoCta"), href: "/automations", tone: "from-blue to-indigo" },
            { icon: Megaphone, title: t("spec.smTitle"), desc: t("spec.smDesc"), ex: smEx, cta: t("spec.smCta"), href: "/social-media", tone: "from-indigo to-violet" },
          ].map((c, idx) => (
            <Reveal key={c.title} delay={idx * 0.12}>
              <div className="group card relative h-full overflow-hidden p-8 transition duration-300 hover:border-indigo/50 hover:shadow-glow sm:p-10">
                <div className={`absolute -top-24 end-0 h-48 w-48 rounded-full bg-gradient-to-br ${c.tone} opacity-15 blur-3xl transition group-hover:opacity-30`} />
                <span className={`inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.tone} text-white shadow-glow-sm`}>
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{c.desc}</p>
                <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {c.ex.map((e) => (
                    <li key={e} className="flex items-center gap-2 text-sm text-ink/85">
                      <CheckIcon /> {e}
                    </li>
                  ))}
                </ul>
                <Link href={c.href} className="btn-ghost mt-8 !px-5 !py-2.5 group-hover:border-indigo/60">
                  {c.cta}
                  <ArrowIcon />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-12">
          <div className="glass mx-auto flex w-fit flex-wrap items-center justify-center gap-3 rounded-full px-8 py-4">
            {[t("spec.flow1"), t("spec.flow2"), t("spec.flow3")].map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <Pulse horizontal />}
                <span className={`font-display text-sm font-extrabold uppercase tracking-[0.2em] ${i === 0 ? "text-sky" : i === 1 ? "text-indigo" : "text-[#c4a7ff]"}`}>
                  {s}
                </span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 3. How we help ───────────────────────────────────────── */
export function HowWeHelp() {
  const { t } = useI18n();
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHead title={t("help.title")} sub={t("help.sub")} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {range(5).map((i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="card group h-full p-6 transition hover:border-indigo/50 hover:bg-surface2/80">
                <span className="grad-text font-display text-3xl font-black">0{i + 1}</span>
                <h3 className="mt-4 font-display text-lg font-bold">{t(`help.s${i + 1}t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`help.s${i + 1}d`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 4. Automation visual section ─────────────────────────── */
export function AutomationHome() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden py-24">
      <div className="glow-orb top-1/3 start-0 h-96 w-96 bg-blue/15" />
      <div className="container-x">
        <SectionHead title={t("ah.title")} sub={t("ah.sub")} />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {[
            { title: t("ah.f1"), nodes: range(5).map((i) => t(`ah.f1.n${i + 1}`)) },
            { title: t("ah.f2"), nodes: range(5).map((i) => t(`ah.f2.n${i + 1}`)) },
          ].map((f, idx) => (
            <Reveal key={idx} delay={idx * 0.12}>
              <div className="card relative overflow-hidden p-8">
                <div className="bg-grid absolute inset-0 opacity-60" />
                <h3 className="relative text-center font-display text-lg font-bold text-muted">{f.title}</h3>
                <div className="relative mt-6 flex justify-center">
                  <Flow nodes={f.nodes} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/automations" className="btn-brand">
            {t("ah.cta")}
            <ArrowIcon />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 5. Social media visual section ───────────────────────── */
export function SocialHome() {
  const { t } = useI18n();
  const chips = range(10).map((i) => t(`sh.c${i + 1}`));
  return (
    <section className="relative overflow-hidden py-24">
      <div className="glow-orb top-10 end-0 h-96 w-96 bg-violet/15" />
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <h2 className="section-title">{t("sh.title")}</h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{t("sh.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {chips.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-full border border-line/25 bg-surface2/70 px-4 py-2 text-xs font-semibold text-ink/85"
              >
                {c}
              </motion.span>
            ))}
          </div>
          <Link href="/social-media" className="btn-brand mt-9">
            {t("sh.cta")}
            <ArrowIcon />
          </Link>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-brand-soft blur-2xl" />
            {/* calendar */}
            <div className="glass relative rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between text-xs font-bold text-muted">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky" /> {t("sh.cal")}</span>
                <span>Sept 2026</span>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {range(28).map((d) => {
                  const has = [2, 5, 8, 9, 12, 15, 16, 19, 22, 23, 26].includes(d);
                  const reel = [5, 12, 19, 26].includes(d);
                  return (
                    <span
                      key={d}
                      className={`grid h-9 place-items-center rounded-lg text-[10px] font-semibold ${
                        has
                          ? reel
                            ? "bg-gradient-to-br from-indigo to-violet text-white"
                            : "bg-blue/20 text-sky"
                          : "bg-surface2/60 text-muted/60"
                      }`}
                    >
                      {d + 1}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* post mock */}
              <div className="glass rounded-2xl p-4 shadow-card">
                <p className="text-xs font-bold text-muted">{t("sh.posts")}</p>
                <div className="mt-3 space-y-2">
                  {["Reel — product story", "Post — offer launch", "Story — behind scenes"].map((p, i) => (
                    <div key={p} className="flex items-center gap-2 rounded-lg bg-surface2/80 px-3 py-2 text-[11px] font-medium">
                      <span className={`h-6 w-6 shrink-0 rounded-md bg-gradient-to-br ${i === 0 ? "from-indigo to-violet" : i === 1 ? "from-blue to-indigo" : "from-violet to-deep"}`} />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {/* analytics */}
                <div className="glass rounded-2xl p-4 shadow-card">
                  <p className="text-xs font-bold text-muted">{t("sh.analytics")}</p>
                  <div className="mt-2 flex items-end gap-1">
                    {[40, 55, 45, 70, 60, 85].map((h, i) => (
                      <span key={i} className="flex-1 rounded-t bg-gradient-to-t from-violet to-sky" style={{ height: h * 0.5 }} />
                    ))}
                  </div>
                </div>
                {/* messages */}
                <div className="glass rounded-2xl p-4 shadow-card">
                  <p className="text-xs font-bold text-muted">{t("sh.messages")}</p>
                  <div className="mt-2 space-y-1.5">
                    <p className="w-fit max-w-full rounded-xl rounded-ss-sm bg-surface2 px-3 py-1.5 text-[11px]">Price for coaching?</p>
                    <p className="ms-auto w-fit rounded-xl rounded-ee-sm bg-brand px-3 py-1.5 text-[11px] text-white">Sending details now ✓</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 6. Combined value ────────────────────────────────────── */
export function Combined() {
  const { t } = useI18n();
  const nodes = range(8).map((i) => t(`comb.n${i + 1}`));
  return (
    <section className="relative overflow-hidden py-24">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">
            {t("comb.t1")}
            <br />
            <span className="grad-text">{t("comb.t2")}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{t("comb.sub")}</p>
        </Reveal>
        <Reveal className="mt-14">
          <div className="glass mx-auto w-fit rounded-3xl px-8 py-10 sm:px-14">
            <div className="flex flex-col items-center">
              {nodes.map((n, i) => {
                const social = i < 4;
                return (
                  <div key={n} className="flex flex-col items-center">
                    {i > 0 && <Pulse />}
                    <span
                      className={`inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl border px-5 py-2.5 font-display text-sm font-bold ${
                        i === 7
                          ? "border-transparent bg-brand text-white shadow-glow-sm"
                          : social
                            ? "border-blue/30 bg-blue/10 text-sky"
                            : "border-violet/30 bg-violet/10 text-[#c4a7ff]"
                      }`}
                    >
                      {n}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 7. Process ───────────────────────────────────────────── */
export function Process() {
  const { t } = useI18n();
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHead title={t("proc.title")} sub={t("proc.sub")} />
        <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="absolute inset-x-10 top-7 hidden h-px bg-gradient-to-r from-blue/50 via-indigo/50 to-violet/50 lg:block" />
          {range(5).map((i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl border border-line/25 bg-surface font-display text-sm font-black text-sky shadow-glow-sm">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{t(`proc.p${i + 1}t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`proc.p${i + 1}d`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Trust ─────────────────────────────────────────────── */
export function Trust() {
  const { t } = useI18n();
  const icons = [Workflow, Repeat, Users2, Megaphone, Handshake];
  return (
    <section className="py-24">
      <div className="container-x">
        <div className="card relative overflow-hidden p-10 sm:p-14">
          <div className="absolute -top-32 start-1/3 h-72 w-72 rounded-full bg-indigo/15 blur-3xl" />
          <SectionHead title={t("trust.title")} sub={t("trust.sub")} />
          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {range(5).map((i) => {
              const Ic = icons[i];
              return (
                <Reveal key={i} delay={i * 0.07}>
                  <div className="text-center lg:text-start">
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-surface2 text-sky lg:mx-0">
                      <Ic className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-bold">{t(`trust.i${i + 1}t`)}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{t(`trust.i${i + 1}d`)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 9. Final CTA ─────────────────────────────────────────── */
export function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="pb-10 pt-4">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] border border-indigo/30 bg-surface p-12 text-center sm:p-20">
            <div className="bg-grid absolute inset-0" />
            <div className="glow-orb -top-20 start-1/4 h-72 w-72 bg-indigo/30" />
            <div className="glow-orb -bottom-24 end-1/4 h-72 w-72 bg-violet/25" />
            <h2 className="section-title relative">{t("final.t")}</h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {t("final.sub")}
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/request" className="btn-brand">
                {t("final.c1")}
                <ArrowIcon />
              </Link>
              <Link href="/automations" className="btn-ghost">
                {t("final.c2")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
