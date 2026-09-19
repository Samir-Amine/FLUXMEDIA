"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useI18n } from "./providers";
import { Field } from "./fields";

export default function ContactForm() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", company: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = t("f.errRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = t("f.errEmail");
    if (form.message.trim().length < 10) er.message = t("f.errLen");
    setErrors(er);
    if (Object.keys(er).length) return;
    setState("sending");
    const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "contact", ...form }) });
    setState(res.ok ? "done" : "idle");
  };

  if (state === "done")
    return (
      <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-sky" />
        <h2 className="mt-5 font-display text-2xl font-bold">{t("contact.successT")}</h2>
        <p className="mt-3 text-sm text-muted">{t("contact.successB")}</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="card space-y-5 p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("f.name")} required error={errors.name}>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
        </Field>
        <Field label={t("f.email")} required error={errors.email}>
          <input className="input" type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
        </Field>
        <Field label={t("f.whatsapp")}>
          <input className="input" dir="ltr" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label={t("f.company")}>
          <input className="input" value={form.company} onChange={(e) => set("company", e.target.value)} />
        </Field>
      </div>
      <Field label={t("f.message")} required error={errors.message}>
        <textarea className="input min-h-[140px]" value={form.message} onChange={(e) => set("message", e.target.value)} />
      </Field>
      <button className="btn-brand w-full" disabled={state === "sending"}>
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl-flip" />}
        {state === "sending" ? t("f.sending") : t("contact.send")}
      </button>
    </form>
  );
}
