"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "./providers";
import { Field } from "./fields";
import { Reveal, SectionHead, Icon, ArrowIcon } from "./ui";
import { Flow } from "./home-sections";

export interface AutoOption {
  id: string;
  slug: string;
  title: string;
  short: string;
  workflow: string[];
  integrations: string[];
  icon: string;
}

export default function AutomationRequestClient({
  options,
  selectedId,
}: {
  options: AutoOption[];
  selectedId: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [sel, setSel] = useState(selectedId || "");
  const [form, setForm] = useState({ fullName: "", email: "", whatsapp: "", company: "", description: "", additional: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const selected = useMemo(() => options.find((o) => o.id === sel), [options, sel]);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = t("f.errRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("f.errEmail");
    if (form.whatsapp.trim().length < 6) e.whatsapp = t("f.errRequired");
    if (!sel) e.system = t("f.errRequired");
    if (form.description.trim().length < 10) e.description = t("f.errLen");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

 const submit = async (ev: React.FormEvent) => {
  ev.preventDefault();

  if (!validate()) return;

  setState("sending");

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "automation",
        ...form,
        selectedId: sel,
        selectedName: selected?.title || "",
      }),
    });

    if (res.ok) {
      setState("done");
    } else {
      const data = await res.json().catch(() => null);

      console.error("Submit failed:", data);

      setState("idle");
      setErrors({
        description: data?.error || "Failed to submit request.",
      });
    }
  } catch (error) {
    console.error("Submit error:", error);

    setState("idle");
    setErrors({
      description: "Failed to submit request.",
    });
  }
};

  if (state === "done")
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-24">
        <Reveal className="card max-w-md p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-sky" />
          <h1 className="mt-5 font-display text-2xl font-bold">{t("req.successT")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("req.successB")}</p>
          <button className="btn-ghost mt-7" onClick={() => { setState("idle"); setForm({ fullName: "", email: "", whatsapp: "", company: "", description: "", additional: "" }); setSel(""); }}>
            {t("req.again")}
          </button>
        </Reveal>
      </div>
    );

  return (
    <div className="relative overflow-hidden pb-16 pt-36">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="glow-orb -top-24 start-1/4 h-80 w-80 bg-indigo/20" />
      <div className="container-x relative">
        <SectionHead badge={t("nav.automations")} title={t("req.title")} sub={t("req.sub")} />
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Selected system */}
          <Reveal>
            <div className="card h-full p-8">
              <p className="label">{t("req.selected")}</p>
              {selected ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue to-violet text-white shadow-glow-sm">
                      <Icon name={selected.icon} className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-xl font-bold">{selected.title}</h2>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{selected.short}</p>
                  <div className="mt-6 flex justify-center rounded-2xl bg-surface2/50 p-5">
                    <Flow nodes={selected.workflow} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selected.integrations.map((i) => (
                      <span key={i} className="rounded-full bg-surface2 px-3 py-1 text-[11px] font-semibold text-muted">{i}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">{t("req.sub")}</p>
              )}
            </div>
          </Reveal>

          {/* Form */}
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
                  <input className="input" dir="ltr" placeholder="+212 6…" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} autoComplete="tel" />
                </Field>
                <Field label={t("f.company")}>
                  <input className="input" value={form.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
                </Field>
              </div>
              <Field label={t("f.system")} required error={errors.system}>
                <select className="input" value={sel} onChange={(e) => { setSel(e.target.value); router.replace(`/request?automation=${options.find((o) => o.id === e.target.value)?.slug || ""}`, { scroll: false }); }}>
                  <option value="">—</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("f.desc")} required error={errors.description}>
                <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label={t("f.additional")}>
                <textarea className="input min-h-[80px]" value={form.additional} onChange={(e) => set("additional", e.target.value)} />
              </Field>
              <button className="btn-brand w-full" disabled={state === "sending"}>
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
