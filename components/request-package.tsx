"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import type { Locale, SocialPackage } from "@/lib/types";
import { L, fmtPrice, cx } from "@/lib/utils";
import { useI18n } from "./providers";
import { Field } from "./fields";
import { Reveal, SectionHead, ArrowIcon, CheckIcon, PlatformGlyph } from "./ui";

const PLATFORMS = [
  ["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"],
  ["linkedin", "LinkedIn"], ["youtube", "YouTube"], ["x", "X"],
];

export default function PackageRequestClient({
  packages,
  selectedId,
  locale,
}: {
  packages: SocialPackage[];
  selectedId: string | null;
  locale: Locale;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [changing, setChanging] = useState(!selectedId);
  const pkg = useMemo(() => packages.find((p) => p.id === selectedId) || null, [packages, selectedId]);
  const [form, setForm] = useState({ fullName: "", email: "", whatsapp: "", company: "", description: "", additional: "", goals: "", brandInfo: "" });
  const [plats, setPlats] = useState<string[]>(pkg?.platforms || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const togglePlat = (p: string) => setPlats((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = t("f.errRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("f.errEmail");
    if (form.whatsapp.trim().length < 6) e.whatsapp = t("f.errRequired");
    if (!pkg) e.pkg = t("f.errRequired");
    if (form.description.trim().length < 10) e.description = t("f.errLen");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !pkg) return;
    setState("sending");
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "social_media",
        ...form,
        platforms: plats,
        selectedId: pkg.id,
        selectedName: pkg.name,
        selectedPrice: `${fmtPrice(pkg.price, pkg.currency)} ${L(pkg.billingPeriod, "en")}`,
      }),
    });
    if (res.ok) setState("done");
    else setState("idle");
  };

  if (state === "done")
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-24">
        <Reveal className="card max-w-md p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-sky" />
          <h1 className="mt-5 font-display text-2xl font-bold">{t("req.successT")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("req.successB")}</p>
          <Link href="/social-media" className="btn-ghost mt-7">{t("nav.socialMedia")}</Link>
        </Reveal>
      </div>
    );

  return (
    <div className="relative overflow-hidden pb-16 pt-36">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="glow-orb -top-24 end-1/4 h-80 w-80 bg-violet/20" />
      <div className="container-x relative">
        <SectionHead badge={t("nav.socialMedia")} title={t("smreq.title")} sub={t("smreq.sub")} />
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT: selected package */}
          <Reveal>
            <div className="card h-full p-8">
              <div className="flex items-center justify-between">
                <p className="label !mb-0">{t("smreq.selected")}</p>
                <button
                  type="button"
                  onClick={() => setChanging((c) => !c)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> {t("smreq.change")}
                </button>
              </div>

              {changing && (
                <div className="mt-4 grid gap-2">
                  {packages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { router.replace(`/request/social-media?package=${p.slug}`); setChanging(false); }}
                      className={cx(
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-start text-sm transition",
                        p.id === pkg?.id ? "border-indigo/60 bg-surface2" : "border-line/20 hover:border-indigo/40"
                      )}
                    >
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-muted" dir="ltr">{fmtPrice(p.price, p.currency)}</span>
                    </button>
                  ))}
                </div>
              )}

              {pkg ? (
                <div className="mt-5">
                  <h2 className="font-display text-3xl font-extrabold">{pkg.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{L(pkg.description, locale)}</p>
                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="font-display text-3xl font-bold" dir="ltr">{fmtPrice(pkg.price, pkg.currency)}</span>
                    <span className="pb-1 text-sm text-muted">{L(pkg.billingPeriod, locale)}</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {[...pkg.features].sort((a, b) => a.order - b.order).map((f) => (
                      <li key={f.id} className="flex items-start gap-2.5 text-sm">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky" /> {L(f.text, locale)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface2/60 p-3 text-center">
                    {[[pkg.postsPerMonth, t("sm.posts")], [pkg.reelsPerMonth, t("sm.reels")], [pkg.storiesPerMonth, t("sm.stories")]].map(([n, l]) => (
                      <div key={String(l)}>
                        <p className="font-display text-lg font-bold text-sky">{n}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{l}</p>
                      </div>
                    ))}
                  </div>
                  <p className="label mt-6">{t("sm.platforms")}</p>
                  <div className="flex gap-3 text-muted">
                    {pkg.platforms.map((p) => <PlatformGlyph key={p} id={p} className="h-5 w-5" />)}
                  </div>
                </div>
              ) : (
                !changing && <p className="mt-4 text-sm text-muted">{t("smreq.change")}</p>
              )}
            </div>
          </Reveal>

          {/* RIGHT: form */}
          <Reveal delay={0.1}>
            <form onSubmit={submit} className="card space-y-5 p-8" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t("f.name")} required error={errors.fullName}>
                  <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
                </Field>
                <Field label={t("f.email")} required error={errors.email}>
                  <input className="input" type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                </Field>
                <Field label={t("f.whatsapp")} required error={errors.whatsapp}>
                  <input className="input" dir="ltr" placeholder="+212 6…" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                </Field>
                <Field label={t("f.company")}>
                  <input className="input" value={form.company} onChange={(e) => set("company", e.target.value)} />
                </Field>
              </div>
              <Field label={t("smreq.selected")} required error={errors.pkg}>
                <input className="input cursor-not-allowed opacity-80" readOnly value={pkg ? `${pkg.name} — ${fmtPrice(pkg.price, pkg.currency)}` : "—"} aria-readonly />
              </Field>
              <Field label={t("f.desc")} required error={errors.description}>
                <textarea className="input min-h-[110px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label={t("f.additional")}>
                <textarea className="input min-h-[70px]" value={form.additional} onChange={(e) => set("additional", e.target.value)} />
              </Field>
              <fieldset>
                <legend className="label">{t("smreq.platforms")}</legend>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(([id, name]) => (
                    <label
                      key={id}
                      className={cx(
                        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition",
                        plats.includes(id) ? "border-transparent bg-brand text-white" : "border-line/25 bg-surface2/60 text-muted"
                      )}
                    >
                      <input type="checkbox" className="sr-only" checked={plats.includes(id)} onChange={() => togglePlat(id)} />
                      <PlatformGlyph id={id} className="h-3.5 w-3.5" /> {name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label={t("smreq.goals")}>
                <textarea className="input min-h-[70px]" value={form.goals} onChange={(e) => set("goals", e.target.value)} />
              </Field>
              <Field label={t("smreq.brand")}>
                <textarea className="input min-h-[70px]" value={form.brandInfo} onChange={(e) => set("brandInfo", e.target.value)} />
              </Field>
              <button className="btn-brand w-full" disabled={state === "sending" || !pkg}>
                {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowIcon />}
                {state === "sending" ? t("f.sending") : t("f.submit")}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
