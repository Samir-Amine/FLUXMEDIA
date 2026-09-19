"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import type { ML } from "@/lib/types";
import { cx } from "@/lib/utils";
import { useToast } from "./toast";

/* ── API helper ─────────────────────────────────────────── */
export async function api(collection: string, method: string, body?: unknown, query = "") {
  const res = await fetch(`/api/admin/${collection}${query}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

/* ── Page header ────────────────────────────────────────── */
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("card p-5 sm:p-6", className)}>
      {title && <h2 className="mb-4 font-display text-base font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function DemoBadge() {
  return <span className="rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c4a7ff]">Demo data</span>;
}

/* ── Multilingual text input ────────────────────────────── */
const LANGS: (keyof ML)[] = ["en", "fr", "ar"];
export function MLInput({
  label, value, onChange, textarea = false, required,
}: { label: string; value: ML; onChange: (v: ML) => void; textarea?: boolean; required?: boolean }) {
  const [lang, setLang] = useState<keyof ML>("en");
  const Cmp = textarea ? "textarea" : "input";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label !mb-0">{label}{required && <span className="ms-0.5 text-sky">*</span>}</span>
        <div className="flex rounded-full bg-surface2 p-0.5">
          {LANGS.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setLang(l)}
              className={cx("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", lang === l ? "bg-brand text-white" : "text-muted")}
            >
              {l}{value?.[l] ? "" : " ·"}
            </button>
          ))}
        </div>
      </div>
      <Cmp
        className={cx("input", textarea && "min-h-[80px]")}
        dir={lang === "ar" ? "rtl" : "ltr"}
        value={value?.[lang] ?? ""}
        onChange={(e) => onChange({ ...(value || { en: "", fr: "", ar: "" }), [lang]: e.target.value })}
      />
    </div>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder, dir }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; dir?: "ltr" | "rtl" }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={value} placeholder={placeholder} dir={dir} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line/15 bg-surface2/40 px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx("relative h-6 w-11 rounded-full transition", checked ? "bg-brand" : "bg-surface2 border border-line/25")}
      >
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "start-[22px]" : "start-0.5")} />
      </button>
    </label>
  );
}

/* ── Save button ────────────────────────────────────────── */
export function SaveBar({ onSave, onCancel, saving, label = "Save changes" }: { onSave: () => void; onCancel?: () => void; saving: boolean; label?: string }) {
  return (
    <div className="sticky bottom-4 z-20 mt-6 flex justify-end gap-2 rounded-2xl border border-line/15 bg-surface/90 p-3 backdrop-blur-xl">
      {onCancel && <button type="button" className="btn-ghost !py-2.5" onClick={onCancel}>Cancel</button>}
      <button type="button" className="btn-brand !py-2.5" onClick={onSave} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </button>
    </div>
  );
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className={cx("relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line/20 bg-surface p-6 shadow-card sm:rounded-3xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
          >
            <h2 className="mb-5 font-display text-lg font-bold">{title}</h2>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Delete with confirmation ───────────────────────────── */
export function DeleteButton({ onConfirm, label = "Delete", what = "this item" }: { onConfirm: () => Promise<void> | void; label?: string; what?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#ff8f8f] hover:bg-[#ff8f8f]/10" aria-label={label}>
        <Trash2 className="h-3.5 w-3.5" /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm deletion">
        <p className="text-sm text-muted">Are you sure you want to delete {what}? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost !py-2.5" onClick={() => setOpen(false)}>Cancel</button>
          <button
            className="btn !py-2.5 bg-[#ff5c5c] text-white hover:brightness-110"
            disabled={busy}
            onClick={async () => { setBusy(true); try { await onConfirm(); toast("Deleted."); } catch { toast("Delete failed", "err"); } setBusy(false); setOpen(false); }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Delete
          </button>
        </div>
      </Modal>
    </>
  );
}

/* ── Table ──────────────────────────────────────────────── */
export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line/15">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-surface2/60 text-start text-[11px] uppercase tracking-wider text-muted">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 text-start font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line/10">{children}</tbody>
      </table>
      {empty && <p className="p-8 text-center text-sm text-muted">Nothing here yet.</p>}
    </div>
  );
}

export const STATUS_TONE: Record<string, string> = {
  new: "bg-blue/15 text-sky", reviewing: "bg-indigo/15 text-[#9fb4ff]", contacted: "bg-violet/15 text-[#c4a7ff]",
  in_progress: "bg-sky/15 text-sky", completed: "bg-emerald-500/15 text-emerald-300", archived: "bg-surface2 text-muted",
  read: "bg-indigo/15 text-[#9fb4ff]",
  draft: "bg-surface2 text-muted", review: "bg-violet/15 text-[#c4a7ff]", approved: "bg-indigo/15 text-[#9fb4ff]", scheduled: "bg-blue/15 text-sky", published: "bg-emerald-500/15 text-emerald-300",
  lead: "bg-blue/15 text-sky", sales: "bg-violet/15 text-[#c4a7ff]", support: "bg-indigo/15 text-[#9fb4ff]", question: "bg-surface2 text-ink", spam: "bg-surface2 text-muted",
  active: "bg-emerald-500/15 text-emerald-300", paused: "bg-surface2 text-muted",
};
export function Badge({ v }: { v: string }) {
  return <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", STATUS_TONE[v] || "bg-surface2 text-muted")}>{v.replace("_", " ")}</span>;
}

/* ── Reorder arrows ─────────────────────────────────────── */
export function OrderButtons({ onUp, onDown, first, last }: { onUp: () => void; onDown: () => void; first: boolean; last: boolean }) {
  return (
    <span className="inline-flex overflow-hidden rounded-lg border border-line/20">
      <button type="button" className="px-2 py-1 text-xs hover:bg-surface2 disabled:opacity-30" disabled={first} onClick={onUp} aria-label="Move up">↑</button>
      <button type="button" className="border-s border-line/20 px-2 py-1 text-xs hover:bg-surface2 disabled:opacity-30" disabled={last} onClick={onDown} aria-label="Move down">↓</button>
    </span>
  );
}
