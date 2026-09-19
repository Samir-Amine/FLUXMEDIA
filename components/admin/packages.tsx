"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Eye, EyeOff, Plus, Pencil, X } from "lucide-react";
import type { ML, SocialPackage, PackageFeature } from "@/lib/types";
import { fmtPrice, slugify, uid, cx } from "@/lib/utils";
import { api, PageHeader, Panel, MLInput, Input, Select, Toggle, SaveBar, DeleteButton, Table, OrderButtons, Badge } from "./kit";
import { useToast } from "./toast";
import { PlatformGlyph } from "@/components/ui";

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"];
const empty = (): ML => ({ en: "", fr: "", ar: "" });

/* ── List ──────────────────────────────────────────────── */
export function PackagesList({ initial }: { initial: SocialPackage[] }) {
  const [list, setList] = useState([...initial].sort((a, b) => a.order - b.order));
  const toast = useToast();
  const router = useRouter();

  const move = async (i: number, dir: -1 | 1) => {
    const next = [...list];
    const j = i + dir;
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    await api("packages", "PATCH", { order: next.map((p) => p.id) });
    toast("Order saved.");
    router.refresh();
  };
  const toggle = async (p: SocialPackage) => {
    await api("packages", "PUT", { id: p.id, visible: !p.visible });
    setList((l) => l.map((x) => (x.id === p.id ? { ...x, visible: !x.visible } : x)));
    toast(p.visible ? "Package hidden." : "Package visible.");
    router.refresh();
  };
  const duplicate = async (p: SocialPackage) => {
    const { id: _id, ...rest } = p;
    const copy = { ...rest, name: `${p.name} Copy`, slug: `${p.slug}-copy-${uid().slice(0, 4)}`, popular: false, visible: false, features: p.features.map((f) => ({ ...f, id: uid() })) };
    const created = await api("packages", "POST", copy);
    setList((l) => [...l, created]);
    toast("Package duplicated.");
    router.refresh();
  };
  const remove = async (id: string) => {
    await api("packages", "DELETE", undefined, `?id=${id}`);
    setList((l) => l.filter((x) => x.id !== id));
    router.refresh();
  };

  return (
    <>
      <PageHeader
        title="Social Media Packages"
        sub="Everything here drives the public /social-media page and the package request page."
        actions={<Link href="/admin/social/packages/new" className="btn-brand !py-2.5"><Plus className="h-4 w-4" /> New package</Link>}
      />
      <Table head={["Order", "Package", "Price", "Content", "Platforms", "Status", "Actions"]} empty={list.length === 0}>
        {list.map((p, i) => (
          <tr key={p.id} className="hover:bg-surface2/30">
            <td className="px-4 py-3"><OrderButtons first={i === 0} last={i === list.length - 1} onUp={() => move(i, -1)} onDown={() => move(i, 1)} /></td>
            <td className="px-4 py-3">
              <p className="font-semibold">{p.name} {p.popular && <span className="ms-1 rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">Popular</span>}</p>
              <p className="text-xs text-muted">/{p.slug}</p>
            </td>
            <td className="px-4 py-3 font-semibold">{fmtPrice(p.price, p.currency)} <span className="text-xs font-normal text-muted">{p.billingPeriod.en}</span></td>
            <td className="px-4 py-3 text-xs text-muted">{p.postsPerMonth}P · {p.reelsPerMonth}R · {p.storiesPerMonth}S</td>
            <td className="px-4 py-3"><span className="flex gap-1.5 text-muted">{p.platforms.map((x) => <PlatformGlyph key={x} id={x} className="h-3.5 w-3.5" />)}</span></td>
            <td className="px-4 py-3"><Badge v={p.visible ? "active" : "archived"} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <Link href={`/admin/social/packages/${p.id}`} className="rounded-lg p-2 hover:bg-surface2" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Link>
                <button onClick={() => duplicate(p)} className="rounded-lg p-2 hover:bg-surface2" aria-label="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => toggle(p)} className="rounded-lg p-2 hover:bg-surface2" aria-label="Toggle visibility">{p.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                <DeleteButton what={`the "${p.name}" package`} label="" onConfirm={() => remove(p.id)} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

/* ── Editor ────────────────────────────────────────────── */
const blank = (): Omit<SocialPackage, "id"> => ({
  slug: "", name: "", description: empty(), price: 0, currency: "USD",
  billingPeriod: { en: "per month", fr: "par mois", ar: "شهريًا" }, badge: empty(),
  popular: false, visible: true, order: 99, features: [], postsPerMonth: 0, reelsPerMonth: 0, storiesPerMonth: 0, platforms: ["instagram"],
});

export function PackageEditor({ initial }: { initial: SocialPackage | null }) {
  const [p, setP] = useState<Omit<SocialPackage, "id"> & { id?: string }>(initial || blank());
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const set = <K extends keyof SocialPackage>(k: K, v: SocialPackage[K]) => setP((s) => ({ ...s, [k]: v }));

  const features = [...p.features].sort((a, b) => a.order - b.order);
  const setFeatures = (f: PackageFeature[]) => set("features", f.map((x, i) => ({ ...x, order: i + 1 })));
  const addFeature = () => setFeatures([...features, { id: uid(), text: empty(), order: features.length + 1 }]);
  const moveFeature = (i: number, d: -1 | 1) => { const n = [...features]; [n[i], n[i + d]] = [n[i + d], n[i]]; setFeatures(n); };

  const save = async () => {
    if (!p.name.trim()) return toast("Package name is required.", "err");
    setSaving(true);
    try {
      const payload = { ...p, slug: p.slug || slugify(p.name), price: Number(p.price) || 0, postsPerMonth: Number(p.postsPerMonth) || 0, reelsPerMonth: Number(p.reelsPerMonth) || 0, storiesPerMonth: Number(p.storiesPerMonth) || 0 };
      if (p.id) await api("packages", "PUT", payload);
      else { const c = await api("packages", "POST", payload); router.replace(`/admin/social/packages/${c.id}`); }
      toast("Package saved. Public page updated.");
      router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setSaving(false);
  };

  return (
    <>
      <PageHeader
        title={p.id ? `Edit: ${p.name}` : "New package"}
        sub="Changes are live on /social-media and /request/social-media after save."
        actions={p.id ? <a href={`/request/social-media?package=${p.slug}`} target="_blank" className="btn-ghost !py-2.5">Preview request page</a> : null}
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Panel title="Package">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Package name" value={p.name} onChange={(v) => setP((s) => ({ ...s, name: v, slug: s.id ? s.slug : slugify(v) }))} />
              <Input label="Slug (URL)" value={p.slug} onChange={(v) => set("slug", slugify(v))} dir="ltr" />
            </div>
            <div className="mt-4"><MLInput label="Description" textarea value={p.description} onChange={(v) => set("description", v)} /></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input label="Price" type="number" value={p.price} onChange={(v) => set("price", Number(v))} />
              <Select label="Currency" value={p.currency} onChange={(v) => set("currency", v)} options={["USD", "EUR", "MAD"].map((c) => ({ value: c, label: c }))} />
              <div><MLInput label="Billing period" value={p.billingPeriod} onChange={(v) => set("billingPeriod", v)} /></div>
            </div>
            <div className="mt-4"><MLInput label="Badge (optional)" value={p.badge} onChange={(v) => set("badge", v)} /></div>
          </Panel>

          <Panel title="Features">
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={f.id} className="flex items-start gap-2 rounded-xl border border-line/15 p-3">
                  <OrderButtons first={i === 0} last={i === features.length - 1} onUp={() => moveFeature(i, -1)} onDown={() => moveFeature(i, 1)} />
                  <div className="flex-1"><MLInput label={`Feature ${i + 1}`} value={f.text} onChange={(v) => setFeatures(features.map((x) => (x.id === f.id ? { ...x, text: v } : x)))} /></div>
                  <button onClick={() => setFeatures(features.filter((x) => x.id !== f.id))} className="mt-6 rounded-lg p-2 text-[#ff8f8f] hover:bg-[#ff8f8f]/10" aria-label="Remove feature"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={addFeature} className="btn-ghost mt-4 !py-2 !text-xs"><Plus className="h-3.5 w-3.5" /> Add feature</button>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Status">
            <div className="space-y-2">
              <Toggle label="Visible on website" checked={p.visible} onChange={(v) => set("visible", v)} />
              <Toggle label="Mark as popular" checked={p.popular} onChange={(v) => set("popular", v)} />
            </div>
            <div className="mt-4"><Input label="Order" type="number" value={p.order} onChange={(v) => set("order", Number(v))} /></div>
          </Panel>
          <Panel title="Content quantities">
            <div className="grid gap-3">
              <Input label="Posts per month" type="number" value={p.postsPerMonth} onChange={(v) => set("postsPerMonth", Number(v))} />
              <Input label="Reels per month" type="number" value={p.reelsPerMonth} onChange={(v) => set("reelsPerMonth", Number(v))} />
              <Input label="Stories per month" type="number" value={p.storiesPerMonth} onChange={(v) => set("storiesPerMonth", Number(v))} />
            </div>
          </Panel>
          <Panel title="Platforms">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((id) => {
                const on = p.platforms.includes(id);
                return (
                  <button key={id} type="button" onClick={() => set("platforms", on ? p.platforms.filter((x) => x !== id) : [...p.platforms, id])} className={cx("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition", on ? "border-transparent bg-brand text-white" : "border-line/25 text-muted")}>
                    <PlatformGlyph id={id} className="h-3.5 w-3.5" /> {id}
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
      <SaveBar saving={saving} onSave={save} onCancel={() => router.push("/admin/social/packages")} />
    </>
  );
}
