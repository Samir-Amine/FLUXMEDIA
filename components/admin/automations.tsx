"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X, Eye, EyeOff } from "lucide-react";
import type { Automation, Category, ML, NavItem, SiteSettings } from "@/lib/types";
import { slugify, L, cx, uid } from "@/lib/utils";
import { api, PageHeader, Panel, MLInput, Input, Select, Toggle, SaveBar, DeleteButton, Table, OrderButtons, Badge, Modal } from "./kit";
import { useToast } from "./toast";
import { ICONS, Icon } from "@/components/ui";

const empty = (): ML => ({ en: "", fr: "", ar: "" });

/* ── Automations list ─────────────────────────────────── */
export function AutomationsList({ initial, categories }: { initial: Automation[]; categories: Category[] }) {
  const [list, setList] = useState([...initial].sort((a, b) => a.order - b.order));
  const router = useRouter();
  const toast = useToast();
  const move = async (i: number, d: -1 | 1) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; setList(n); await api("automations", "PATCH", { order: n.map((x) => x.id) }); router.refresh(); };
  const toggle = async (a: Automation) => { await api("automations", "PUT", { id: a.id, active: !a.active }); setList((l) => l.map((x) => (x.id === a.id ? { ...x, active: !x.active } : x))); toast("Updated."); router.refresh(); };
  return (
    <>
      <PageHeader title="Automations" sub="Automation systems shown on /automations and available in the request form." actions={<Link href="/admin/automations/new" className="btn-brand !py-2.5"><Plus className="h-4 w-4" /> New automation</Link>} />
      <Table head={["Order", "Automation", "Category", "Integrations", "Status", ""]} empty={list.length === 0}>
        {list.map((a, i) => (
          <tr key={a.id} className="hover:bg-surface2/30">
            <td className="px-4 py-3"><OrderButtons first={i === 0} last={i === list.length - 1} onUp={() => move(i, -1)} onDown={() => move(i, 1)} /></td>
            <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-surface2 text-sky"><Icon name={a.icon} className="h-4 w-4" /></span><div><p className="font-semibold">{a.title.en}</p><p className="text-xs text-muted">/{a.slug}</p></div></div></td>
            <td className="px-4 py-3 text-muted">{L(categories.find((c) => c.slug === a.category)?.name, "en") || a.category}</td>
            <td className="px-4 py-3 text-xs text-muted">{a.integrations.join(", ")}</td>
            <td className="px-4 py-3"><Badge v={a.active ? "active" : "archived"} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/admin/automations/${a.id}`} className="rounded-lg p-2 hover:bg-surface2" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Link>
                <button onClick={() => toggle(a)} className="rounded-lg p-2 hover:bg-surface2">{a.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                <DeleteButton label="" what={a.title.en} onConfirm={async () => { await api("automations", "DELETE", undefined, `?id=${a.id}`); setList((l) => l.filter((x) => x.id !== a.id)); router.refresh(); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

/* ── Automation editor ────────────────────────────────── */
function MLList({ label, items, onChange }: { label: string; items: ML[]; onChange: (v: ML[]) => void }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1"><MLInput label={`${i + 1}`} value={it} onChange={(v) => onChange(items.map((x, k) => (k === i ? v : x)))} /></div>
            <button onClick={() => onChange(items.filter((_, k) => k !== i))} className="mb-1 rounded-lg p-2 text-[#ff8f8f] hover:bg-[#ff8f8f]/10"><X className="h-4 w-4" /></button>
          </div>
        ))}
        <button onClick={() => onChange([...items, empty()])} className="btn-ghost !py-1.5 !text-xs"><Plus className="h-3 w-3" /> Add</button>
      </div>
    </div>
  );
}

export function AutomationEditor({ initial, categories }: { initial: Automation | null; categories: Category[] }) {
  const [a, setA] = useState<Omit<Automation, "id"> & { id?: string }>(initial || { slug: "", title: empty(), short: empty(), description: empty(), category: categories[0]?.slug || "", icon: "sparkles", benefits: [], workflow: [], integrations: [], order: 99, active: true });
  const [saving, setSaving] = useState(false);
  const [integ, setInteg] = useState(a.integrations.join(", "));
  const router = useRouter();
  const toast = useToast();
  const set = <K extends keyof Automation>(k: K, v: Automation[K]) => setA((s) => ({ ...s, [k]: v }));
  const save = async () => {
    if (!a.title.en.trim()) return toast("English title is required.", "err");
    setSaving(true);
    try {
      const payload = { ...a, slug: a.slug || slugify(a.title.en), integrations: integ.split(",").map((s) => s.trim()).filter(Boolean) };
      if (a.id) await api("automations", "PUT", payload);
      else { const c = await api("automations", "POST", payload); router.replace(`/admin/automations/${c.id}`); }
      toast("Automation saved."); router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setSaving(false);
  };
  return (
    <>
      <PageHeader title={a.id ? `Edit: ${a.title.en}` : "New automation"} actions={a.id ? <a href={`/automations/${a.slug}`} target="_blank" className="btn-ghost !py-2.5">View page</a> : null} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Panel title="Content">
            <div className="grid gap-4">
              <MLInput label="Title" required value={a.title} onChange={(v) => setA((s) => ({ ...s, title: v, slug: s.id ? s.slug : slugify(v.en) }))} />
              <MLInput label="Short description (card)" value={a.short} onChange={(v) => set("short", v)} />
              <MLInput label="Full description" textarea value={a.description} onChange={(v) => set("description", v)} />
            </div>
          </Panel>
          <Panel title="Details">
            <div className="grid gap-6">
              <MLList label="Benefits" items={a.benefits} onChange={(v) => set("benefits", v)} />
              <MLList label="Workflow steps (in order)" items={a.workflow} onChange={(v) => set("workflow", v)} />
              <Input label="Integrations (comma separated)" value={integ} onChange={setInteg} dir="ltr" />
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Settings">
            <div className="grid gap-4">
              <Input label="Slug" value={a.slug} onChange={(v) => set("slug", slugify(v))} dir="ltr" />
              <Select label="Category" value={a.category} onChange={(v) => set("category", v)} options={categories.map((c) => ({ value: c.slug, label: c.name.en }))} />
              <Select label="Icon" value={a.icon} onChange={(v) => set("icon", v)} options={Object.keys(ICONS).map((k) => ({ value: k, label: k }))} />
              <Input label="Order" type="number" value={a.order} onChange={(v) => set("order", Number(v))} />
              <Toggle label="Active (visible)" checked={a.active} onChange={(v) => set("active", v)} />
            </div>
          </Panel>
        </div>
      </div>
      <SaveBar saving={saving} onSave={save} onCancel={() => router.push("/admin/automations")} />
    </>
  );
}

/* ── Categories ───────────────────────────────────────── */
export function CategoriesAdmin({ initial }: { initial: Category[] }) {
  const [list, setList] = useState([...initial].sort((a, b) => a.order - b.order));
  const [edit, setEdit] = useState<Category | null>(null);
  const router = useRouter();
  const toast = useToast();
  const move = async (i: number, d: -1 | 1) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; setList(n); await api("categories", "PATCH", { order: n.map((x) => x.id) }); router.refresh(); };
  const save = async () => {
    if (!edit) return;
    const payload = { ...edit, slug: edit.slug || slugify(edit.name.en) };
    if (edit.id) { await api("categories", "PUT", payload); setList((l) => l.map((x) => (x.id === edit.id ? payload : x))); }
    else { const c = await api("categories", "POST", payload); setList((l) => [...l, c]); }
    toast("Category saved."); setEdit(null); router.refresh();
  };
  return (
    <>
      <PageHeader title="Categories" sub="Automation categories used as filters on /automations." actions={<button className="btn-brand !py-2.5" onClick={() => setEdit({ id: "", slug: "", name: empty(), order: list.length + 1, active: true })}><Plus className="h-4 w-4" /> Add category</button>} />
      <Table head={["Order", "Name", "Slug", "Status", ""]}>
        {list.map((c, i) => (
          <tr key={c.id}>
            <td className="px-4 py-3"><OrderButtons first={i === 0} last={i === list.length - 1} onUp={() => move(i, -1)} onDown={() => move(i, 1)} /></td>
            <td className="px-4 py-3 font-semibold">{c.name.en} <span className="text-xs font-normal text-muted">· {c.name.fr} · {c.name.ar}</span></td>
            <td className="px-4 py-3 text-xs text-muted">{c.slug}</td>
            <td className="px-4 py-3"><Badge v={c.active ? "active" : "archived"} /></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1"><button className="btn-ghost !py-1.5 !text-xs" onClick={() => setEdit(c)}>Edit</button><DeleteButton label="" what={c.name.en} onConfirm={async () => { await api("categories", "DELETE", undefined, `?id=${c.id}`); setList((l) => l.filter((x) => x.id !== c.id)); router.refresh(); }} /></div></td>
          </tr>
        ))}
      </Table>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit category" : "New category"}>
        {edit && (
          <div className="grid gap-4">
            <MLInput label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v, slug: edit.id ? edit.slug : slugify(v.en) })} />
            <Input label="Slug" value={edit.slug} onChange={(v) => setEdit({ ...edit, slug: slugify(v) })} dir="ltr" />
            <Toggle label="Active" checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} />
            <div className="flex justify-end gap-2"><button className="btn-ghost !py-2.5" onClick={() => setEdit(null)}>Cancel</button><button className="btn-brand !py-2.5" onClick={save}>Save</button></div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ── Navigation ───────────────────────────────────────── */
export function NavigationAdmin({ initial }: { initial: NavItem[] }) {
  const [list, setList] = useState([...initial].sort((a, b) => a.order - b.order));
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const move = (i: number, d: -1 | 1) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; setList(n.map((x, k) => ({ ...x, order: k + 1 }))); };
  const save = async () => {
    setSaving(true);
    try {
      const existing: NavItem[] = await api("navigation", "GET");
      for (const e of existing) if (!list.find((x) => x.id === e.id)) await api("navigation", "DELETE", undefined, `?id=${e.id}`);
      for (let i = 0; i < list.length; i++) { const n = list[i];
        const payload = { ...n, order: i + 1 };
        if (existing.find((x) => x.id === n.id)) await api("navigation", "PUT", payload);
        else { const c = await api("navigation", "POST", payload); n.id = c.id; }
      }
      toast("Navigation saved."); router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setSaving(false);
  };
  return (
    <>
      <PageHeader title="Navigation" sub="Navbar and footer navigation items." />
      <div className="space-y-3">
        {list.map((n, i) => (
          <div key={n.id} className={cx("card grid gap-3 p-4 sm:grid-cols-[auto_1fr_200px_auto_auto] sm:items-end", !n.active && "opacity-60")}>
            <OrderButtons first={i === 0} last={i === list.length - 1} onUp={() => move(i, -1)} onDown={() => move(i, 1)} />
            <MLInput label="Label" value={n.label} onChange={(v) => setList((l) => l.map((x) => (x.id === n.id ? { ...x, label: v } : x)))} />
            <Input label="URL" value={n.href} onChange={(v) => setList((l) => l.map((x) => (x.id === n.id ? { ...x, href: v } : x)))} dir="ltr" />
            <Toggle label="On" checked={n.active} onChange={(v) => setList((l) => l.map((x) => (x.id === n.id ? { ...x, active: v } : x)))} />
            <button onClick={() => setList((l) => l.filter((x) => x.id !== n.id))} className="rounded-lg p-2 text-[#ff8f8f] hover:bg-[#ff8f8f]/10" aria-label="Remove"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <button onClick={() => setList((l) => [...l, { id: "new-" + uid(), label: empty(), href: "/", order: l.length + 1, active: true }])} className="btn-ghost mt-4 !py-2 !text-xs"><Plus className="h-3.5 w-3.5" /> Add item</button>
      <SaveBar saving={saving} onSave={save} />
    </>
  );
}

/* ── Settings ─────────────────────────────────────────── */
export function SettingsAdmin({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const save = async () => { setSaving(true); try { await api("settings", "PUT", s); toast("Settings saved."); router.refresh(); } catch (e) { toast((e as Error).message, "err"); } setSaving(false); };
  return (
    <>
      <PageHeader title="Settings" sub="Global site information used across the website." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Brand">
          <div className="grid gap-4">
            <Input label="Site name" value={s.siteName} onChange={(v) => setS({ ...s, siteName: v })} />
            <MLInput label="Tagline" value={s.tagline} onChange={(v) => setS({ ...s, tagline: v })} />
            <MLInput label="Footer note" value={s.footerNote} onChange={(v) => setS({ ...s, footerNote: v })} />
          </div>
        </Panel>
        <Panel title="Contact">
          <div className="grid gap-4">
            <Input label="Contact email" value={s.contactEmail} onChange={(v) => setS({ ...s, contactEmail: v })} dir="ltr" />
            <Input label="WhatsApp number" value={s.whatsapp} onChange={(v) => setS({ ...s, whatsapp: v })} dir="ltr" />
            <MLInput label="Address / location" value={s.address} onChange={(v) => setS({ ...s, address: v })} />
          </div>
        </Panel>
        <Panel title="Logo & environment">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FLUXMEDIA logo" className="h-16 w-16 rounded-2xl" />
            <p className="text-sm text-muted">The FLUXMEDIA logo is the supplied brand asset at <code className="text-sky">/public/logo.png</code>. Replace the file to update it everywhere (navbar, footer, admin, favicon).</p>
          </div>
          <p className="mt-4 text-xs text-muted">Admin password and Supabase credentials are configured through environment variables — see <code>.env.example</code>.</p>
        </Panel>
      </div>
      <SaveBar saving={saving} onSave={save} />
    </>
  );
}
