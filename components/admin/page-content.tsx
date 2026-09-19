"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { Faq, ML, SocialPageContent, ServiceCard } from "@/lib/types";
import { uid, cx } from "@/lib/utils";
import { api, PageHeader, Panel, MLInput, Select, SaveBar, OrderButtons, Toggle, DeleteButton } from "./kit";
import { useToast } from "./toast";
import { ICONS, PlatformGlyph } from "@/components/ui";

const empty = (): ML => ({ en: "", fr: "", ar: "" });
const PLATFORMS = ["instagram", "facebook", "linkedin", "tiktok", "youtube", "x"];
const TABS = ["Hero", "Services", "Platforms", "Packages", "Process", "FAQ", "Final CTA"];

export function PageContentEditor({ initial, faqs: initialFaqs }: { initial: SocialPageContent; faqs: Faq[] }) {
  const [c, setC] = useState(initial);
  const [faqs, setFaqs] = useState([...initialFaqs].sort((a, b) => a.order - b.order));
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const set = <K extends keyof SocialPageContent>(k: K, v: SocialPageContent[K]) => setC((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api("socialPage", "PUT", c);
      // sync FAQs: upsert all, delete removed
      const existing: Faq[] = await api("faqs", "GET");
      for (const f of existing) if (!faqs.find((x) => x.id === f.id)) await api("faqs", "DELETE", undefined, `?id=${f.id}`);
      for (let i = 0; i < faqs.length; i++) { const f = faqs[i];
        const payload = { ...f, order: i + 1 };
        if (existing.find((x) => x.id === f.id)) await api("faqs", "PUT", payload);
        else { const created = await api("faqs", "POST", payload); f.id = created.id; }
      }
      toast("Page content saved. Public page updated.");
      router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setSaving(false);
  };

  const services = [...c.services].sort((a, b) => a.order - b.order);
  const setServices = (s: ServiceCard[]) => set("services", s.map((x, i) => ({ ...x, order: i + 1 })));
  const moveSvc = (i: number, d: -1 | 1) => { const n = [...services]; [n[i], n[i + d]] = [n[i + d], n[i]]; setServices(n); };
  const moveStep = (i: number, d: -1 | 1) => { const n = [...c.processSteps]; [n[i], n[i + d]] = [n[i + d], n[i]]; set("processSteps", n); };
  const moveFaq = (i: number, d: -1 | 1) => { const n = [...faqs]; [n[i], n[i + d]] = [n[i + d], n[i]]; setFaqs(n); };

  return (
    <>
      <PageHeader title="Social Media — Page Content" sub="Every field below renders on the public /social-media page in EN, FR and AR." actions={<a href="/social-media" target="_blank" className="btn-ghost !py-2.5">View page</a>} />
      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-line/15 bg-surface/60 p-1" role="tablist">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cx("rounded-xl px-4 py-2 text-sm font-semibold transition", tab === i ? "bg-brand text-white shadow-glow-sm" : "text-muted hover:text-ink")}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <Panel title="Hero">
          <div className="grid gap-4">
            <MLInput label="Hero badge" value={c.heroBadge} onChange={(v) => set("heroBadge", v)} />
            <MLInput label="Hero title" value={c.heroTitle} onChange={(v) => set("heroTitle", v)} />
            <MLInput label="Hero description" textarea value={c.heroDescription} onChange={(v) => set("heroDescription", v)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <MLInput label="Primary CTA" value={c.primaryCta} onChange={(v) => set("primaryCta", v)} />
              <MLInput label="Secondary CTA" value={c.secondaryCta} onChange={(v) => set("secondaryCta", v)} />
            </div>
          </div>
        </Panel>
      )}

      {tab === 1 && (
        <div className="space-y-6">
          <Panel title="Services section">
            <div className="grid gap-4">
              <MLInput label="Title" value={c.servicesTitle} onChange={(v) => set("servicesTitle", v)} />
              <MLInput label="Description" value={c.servicesDescription} onChange={(v) => set("servicesDescription", v)} />
            </div>
          </Panel>
          <Panel title="Service cards">
            <div className="space-y-4">
              {services.map((s, i) => (
                <div key={s.id} className="rounded-2xl border border-line/15 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <OrderButtons first={i === 0} last={i === services.length - 1} onUp={() => moveSvc(i, -1)} onDown={() => moveSvc(i, 1)} />
                    <button onClick={() => setServices(services.filter((x) => x.id !== s.id))} className="text-xs font-semibold text-[#ff8f8f]">Remove</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                    <Select label="Icon" value={s.icon} onChange={(v) => setServices(services.map((x) => (x.id === s.id ? { ...x, icon: v } : x)))} options={Object.keys(ICONS).map((k) => ({ value: k, label: k }))} />
                    <MLInput label="Title" value={s.title} onChange={(v) => setServices(services.map((x) => (x.id === s.id ? { ...x, title: v } : x)))} />
                  </div>
                  <div className="mt-3"><MLInput label="Description" textarea value={s.description} onChange={(v) => setServices(services.map((x) => (x.id === s.id ? { ...x, description: v } : x)))} /></div>
                  <p className="label mt-4">Key deliverables</p>
                  <div className="space-y-2">
                    {s.deliverables.map((d, j) => (
                      <div key={j} className="flex items-end gap-2">
                        <div className="flex-1"><MLInput label={`Deliverable ${j + 1}`} value={d} onChange={(v) => setServices(services.map((x) => (x.id === s.id ? { ...x, deliverables: x.deliverables.map((y, k) => (k === j ? v : y)) } : x)))} /></div>
                        <button onClick={() => setServices(services.map((x) => (x.id === s.id ? { ...x, deliverables: x.deliverables.filter((_, k) => k !== j) } : x)))} className="mb-1 rounded-lg p-2 text-[#ff8f8f] hover:bg-[#ff8f8f]/10"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => setServices(services.map((x) => (x.id === s.id ? { ...x, deliverables: [...x.deliverables, empty()] } : x)))} className="btn-ghost !py-1.5 !text-xs"><Plus className="h-3 w-3" /> Add deliverable</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setServices([...services, { id: uid(), icon: "sparkles", title: empty(), description: empty(), deliverables: [], order: services.length + 1 }])} className="btn-ghost mt-4 !py-2 !text-xs"><Plus className="h-3.5 w-3.5" /> Add service card</button>
          </Panel>
        </div>
      )}

      {tab === 2 && (
        <Panel title="Platforms section">
          <div className="grid gap-4">
            <MLInput label="Title" value={c.platformsTitle} onChange={(v) => set("platformsTitle", v)} />
            <MLInput label="Description" value={c.platformsDescription} onChange={(v) => set("platformsDescription", v)} />
            <div>
              <p className="label">Displayed platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((id) => {
                  const on = c.platforms.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => set("platforms", on ? c.platforms.filter((x) => x !== id) : [...c.platforms, id])} className={cx("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize", on ? "border-transparent bg-brand text-white" : "border-line/25 text-muted")}>
                      <PlatformGlyph id={id} className="h-3.5 w-3.5" /> {id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {tab === 3 && (
        <Panel title="Packages section">
          <div className="grid gap-4">
            <MLInput label="Title" value={c.packagesTitle} onChange={(v) => set("packagesTitle", v)} />
            <MLInput label="Description" textarea value={c.packagesDescription} onChange={(v) => set("packagesDescription", v)} />
            <p className="text-xs text-muted">Package cards themselves are managed under <b>Social Media → Packages</b>.</p>
          </div>
        </Panel>
      )}

      {tab === 4 && (
        <div className="space-y-6">
          <Panel title="Process section">
            <div className="grid gap-4">
              <MLInput label="Title" value={c.processTitle} onChange={(v) => set("processTitle", v)} />
              <MLInput label="Description" value={c.processDescription} onChange={(v) => set("processDescription", v)} />
            </div>
          </Panel>
          <Panel title="Steps">
            <div className="space-y-3">
              {c.processSteps.map((s, i) => (
                <div key={s.id} className="rounded-2xl border border-line/15 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-3"><span className="grad-text font-display font-black">0{i + 1}</span><OrderButtons first={i === 0} last={i === c.processSteps.length - 1} onUp={() => moveStep(i, -1)} onDown={() => moveStep(i, 1)} /></span>
                    <button onClick={() => set("processSteps", c.processSteps.filter((x) => x.id !== s.id))} className="text-xs font-semibold text-[#ff8f8f]">Remove</button>
                  </div>
                  <div className="grid gap-3">
                    <MLInput label="Title" value={s.title} onChange={(v) => set("processSteps", c.processSteps.map((x) => (x.id === s.id ? { ...x, title: v } : x)))} />
                    <MLInput label="Description" value={s.description} onChange={(v) => set("processSteps", c.processSteps.map((x) => (x.id === s.id ? { ...x, description: v } : x)))} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => set("processSteps", [...c.processSteps, { id: uid(), title: empty(), description: empty() }])} className="btn-ghost mt-4 !py-2 !text-xs"><Plus className="h-3.5 w-3.5" /> Add step</button>
          </Panel>
        </div>
      )}

      {tab === 5 && (
        <Panel title="FAQ">
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={f.id} className="rounded-2xl border border-line/15 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <OrderButtons first={i === 0} last={i === faqs.length - 1} onUp={() => moveFaq(i, -1)} onDown={() => moveFaq(i, 1)} />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={f.visible} onChange={(e) => setFaqs(faqs.map((x) => (x.id === f.id ? { ...x, visible: e.target.checked } : x)))} /> Visible</label>
                    <button onClick={() => setFaqs(faqs.filter((x) => x.id !== f.id))} className="text-xs font-semibold text-[#ff8f8f]">Remove</button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <MLInput label="Question" value={f.question} onChange={(v) => setFaqs(faqs.map((x) => (x.id === f.id ? { ...x, question: v } : x)))} />
                  <MLInput label="Answer" textarea value={f.answer} onChange={(v) => setFaqs(faqs.map((x) => (x.id === f.id ? { ...x, answer: v } : x)))} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setFaqs([...faqs, { id: "new-" + uid(), question: empty(), answer: empty(), order: faqs.length + 1, visible: true }])} className="btn-ghost mt-4 !py-2 !text-xs"><Plus className="h-3.5 w-3.5" /> Add question</button>
        </Panel>
      )}

      {tab === 6 && (
        <Panel title="Final CTA">
          <div className="grid gap-4">
            <MLInput label="Title" value={c.finalCtaTitle} onChange={(v) => set("finalCtaTitle", v)} />
            <MLInput label="Description" textarea value={c.finalCtaDescription} onChange={(v) => set("finalCtaDescription", v)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <MLInput label="Primary button" value={c.finalCtaPrimary} onChange={(v) => set("finalCtaPrimary", v)} />
              <MLInput label="Secondary button" value={c.finalCtaSecondary} onChange={(v) => set("finalCtaSecondary", v)} />
            </div>
          </div>
        </Panel>
      )}

      <SaveBar saving={saving} onSave={save} />
    </>
  );
}

/* ── Social Links admin ────────────────────────────────── */
import type { SocialLink } from "@/lib/types";
import { Input, Modal } from "./kit";
const LINK_PLATFORMS = ["instagram", "facebook", "whatsapp", "linkedin", "x", "tiktok", "youtube", "website"];

export function SocialLinksAdmin({ initial }: { initial: SocialLink[] }) {
  const [list, setList] = useState([...initial].sort((a, b) => a.order - b.order));
  const [edit, setEdit] = useState<SocialLink | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const move = async (i: number, d: -1 | 1) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; setList(n); await api("socialLinks", "PATCH", { order: n.map((x) => x.id) }); router.refresh(); };
  const toggle = async (l: SocialLink) => { await api("socialLinks", "PUT", { id: l.id, active: !l.active }); setList((s) => s.map((x) => (x.id === l.id ? { ...x, active: !x.active } : x))); router.refresh(); };
  const save = async () => {
    if (!edit) return;
    setSaving(true);
    try {
      if (edit.id) { await api("socialLinks", "PUT", edit); setList((s) => s.map((x) => (x.id === edit.id ? edit : x))); }
      else { const c = await api("socialLinks", "POST", edit); setList((s) => [...s, c]); }
      toast("Link saved. Social page updated."); setEdit(null); router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Social Links" sub="Powers the public /social page and the footer." actions={<button className="btn-brand !py-2.5" onClick={() => setEdit({ id: "", platform: "instagram", name: "", username: "", description: empty(), url: "", active: true, order: list.length + 1 })}><Plus className="h-4 w-4" /> Add platform</button>} />
      <div className="grid gap-3">
        {list.map((l, i) => (
          <div key={l.id} className={cx("card flex flex-wrap items-center gap-4 p-4", !l.active && "opacity-60")}>
            <OrderButtons first={i === 0} last={i === list.length - 1} onUp={() => move(i, -1)} onDown={() => move(i, 1)} />
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue to-violet text-white"><PlatformGlyph id={l.platform} className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{l.name} <span className="text-xs text-muted">{l.username}</span></p>
              <p className="truncate text-xs text-muted">{l.url}</p>
            </div>
            <Toggle label="" checked={l.active} onChange={() => toggle(l)} />
            <button className="btn-ghost !py-2 !text-xs" onClick={() => setEdit(l)}>Edit</button>
            <DeleteButton label="" what={l.name} onConfirm={async () => { await api("socialLinks", "DELETE", undefined, `?id=${l.id}`); setList((s) => s.filter((x) => x.id !== l.id)); router.refresh(); }} />
          </div>
        ))}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit link" : "Add platform"}>
        {edit && (
          <div className="grid gap-4">
            <Select label="Platform / icon" value={edit.platform} onChange={(v) => setEdit({ ...edit, platform: v })} options={LINK_PLATFORMS.map((p) => ({ value: p, label: p }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Display name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
              <Input label="Username / handle" value={edit.username} onChange={(v) => setEdit({ ...edit, username: v })} dir="ltr" />
            </div>
            <Input label="URL" value={edit.url} onChange={(v) => setEdit({ ...edit, url: v })} dir="ltr" placeholder="https://" />
            <MLInput label="Short description" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} />
            <Toggle label="Enabled" checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} />
            <div className="flex justify-end gap-2">
              <button className="btn-ghost !py-2.5" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn-brand !py-2.5" disabled={saving} onClick={save}>Save</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
