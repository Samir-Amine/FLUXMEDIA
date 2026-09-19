"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, Sparkles, Flag, ArrowUpRight, Archive, Users, CalendarCheck, FileStack, MessagesSquare, TrendingUp, Heart, Target } from "lucide-react";
import type { SocialPost, PostStatus, InboxMessage, SocialClient, SocialAccount, SocialPackage } from "@/lib/types";
import { cx, fmtDate } from "@/lib/utils";
import { api, PageHeader, Panel, Table, Badge, DeleteButton, Modal, Input, Select, Toggle, DemoBadge } from "./kit";
import { useToast } from "./toast";
import { PlatformGlyph } from "@/components/ui";

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"];
const POST_STATUSES: PostStatus[] = ["draft", "review", "approved", "scheduled", "published"];

/* ── Overview ─────────────────────────────────────────── */
export function SocialOverview({ clients, posts, inbox }: { clients: SocialClient[]; posts: SocialPost[]; inbox: InboxMessage[] }) {
  const stats = [
    { l: "Active clients", v: clients.filter((c) => c.status === "active").length, i: Users },
    { l: "Content scheduled", v: posts.filter((p) => p.status === "scheduled").length, i: CalendarCheck },
    { l: "Posts this month", v: posts.length, i: FileStack },
    { l: "Inbox messages", v: inbox.length, i: MessagesSquare },
    { l: "Followers (all)", v: "24.8k", i: TrendingUp },
    { l: "Engagement rate", v: "4.6%", i: Heart },
    { l: "Leads flagged", v: inbox.filter((m) => m.category === "lead").length, i: Target },
  ];
  return (
    <>
      <PageHeader title="Social Media — Overview" sub="Operational workspace for managed client accounts." actions={<DemoBadge />} />
      <p className="mb-5 rounded-xl border border-violet/30 bg-violet/10 px-4 py-3 text-xs text-[#c4a7ff]">
        Metrics on this dashboard (followers, engagement) are illustrative demo data for the workspace UI. They are not FLUXMEDIA performance claims and are not shown on the public website.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="card flex items-center gap-4 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface2 text-sky"><s.i className="h-5 w-5" /></span>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-muted">{s.l}</p><p className="font-display text-2xl font-bold">{s.v}</p></div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming content">
          <ul className="divide-y divide-line/10">
            {posts.filter((p) => p.status !== "published").sort((a, b) => a.scheduleDate.localeCompare(b.scheduleDate)).slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm"><PlatformGlyph id={p.platform} className="h-4 w-4 text-muted" /><span className="min-w-0 flex-1 truncate"><b>{p.client}</b> · {p.caption}</span><Badge v={p.status} /><span className="text-xs text-muted">{p.scheduleDate.slice(5)}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent inbox">
          <ul className="divide-y divide-line/10">
            {inbox.slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm"><PlatformGlyph id={m.platform} className="h-4 w-4 text-muted" /><span className="min-w-0 flex-1 truncate"><b>{m.author}</b> · {m.body}</span><Badge v={m.category} /></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/* ── Clients ──────────────────────────────────────────── */
export function ClientsAdmin({ initial, packages }: { initial: SocialClient[]; packages: SocialPackage[] }) {
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState<SocialClient | null>(null);
  const router = useRouter(); const toast = useToast();
  const save = async () => {
    if (!edit) return;
    if (edit.id) { await api("clients", "PUT", edit); setList((l) => l.map((x) => (x.id === edit.id ? edit : x))); }
    else { const c = await api("clients", "POST", edit); setList((l) => [...l, c]); }
    toast("Client saved."); setEdit(null); router.refresh();
  };
  return (
    <>
      <PageHeader title="Clients" sub="Businesses whose social media FLUXMEDIA manages." actions={<><DemoBadge /><button className="btn-brand !py-2.5" onClick={() => setEdit({ id: "", name: "", industry: "", platforms: ["instagram"], packageSlug: packages[0]?.slug || "", since: new Date().toISOString().slice(0, 7), status: "active" })}><Plus className="h-4 w-4" /> Add client</button></>} />
      <Table head={["Client", "Industry", "Package", "Platforms", "Since", "Status", ""]} empty={list.length === 0}>
        {list.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-semibold">{c.name}</td>
            <td className="px-4 py-3 text-muted">{c.industry}</td>
            <td className="px-4 py-3 capitalize">{packages.find((p) => p.slug === c.packageSlug)?.name || c.packageSlug}</td>
            <td className="px-4 py-3"><span className="flex gap-1.5 text-muted">{c.platforms.map((p) => <PlatformGlyph key={p} id={p} className="h-3.5 w-3.5" />)}</span></td>
            <td className="px-4 py-3 text-xs text-muted">{c.since}</td>
            <td className="px-4 py-3"><Badge v={c.status} /></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1"><button className="btn-ghost !py-1.5 !text-xs" onClick={() => setEdit(c)}>Edit</button><DeleteButton label="" what={c.name} onConfirm={async () => { await api("clients", "DELETE", undefined, `?id=${c.id}`); setList((l) => l.filter((x) => x.id !== c.id)); }} /></div></td>
          </tr>
        ))}
      </Table>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit client" : "Add client"}>
        {edit && (
          <div className="grid gap-4">
            <Input label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
            <Input label="Industry" value={edit.industry} onChange={(v) => setEdit({ ...edit, industry: v })} />
            <Select label="Package" value={edit.packageSlug} onChange={(v) => setEdit({ ...edit, packageSlug: v })} options={packages.map((p) => ({ value: p.slug, label: p.name }))} />
            <PlatformPicker value={edit.platforms} onChange={(v) => setEdit({ ...edit, platforms: v })} />
            <Input label="Since (YYYY-MM)" value={edit.since} onChange={(v) => setEdit({ ...edit, since: v })} dir="ltr" />
            <Toggle label="Active" checked={edit.status === "active"} onChange={(v) => setEdit({ ...edit, status: v ? "active" : "paused" })} />
            <div className="flex justify-end gap-2"><button className="btn-ghost !py-2.5" onClick={() => setEdit(null)}>Cancel</button><button className="btn-brand !py-2.5" onClick={save}>Save</button></div>
          </div>
        )}
      </Modal>
    </>
  );
}

function PlatformPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="label">Platforms</p>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((id) => { const on = value.includes(id); return <button key={id} type="button" onClick={() => onChange(on ? value.filter((x) => x !== id) : [...value, id])} className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize", on ? "border-transparent bg-brand text-white" : "border-line/25 text-muted")}><PlatformGlyph id={id} className="h-3.5 w-3.5" /> {id}</button>; })}
      </div>
    </div>
  );
}

/* ── Content + Post editor ────────────────────────────── */
function PostModal({ post, clients, onClose, onSaved }: { post: SocialPost | null; clients: SocialClient[]; onClose: () => void; onSaved: (p: SocialPost) => void }) {
  const [p, setP] = useState<SocialPost | null>(post);
  const toast = useToast();
  if (!p) return null;
  const save = async () => {
    if (p.id) { await api("posts", "PUT", p); onSaved(p); }
    else { const c = await api("posts", "POST", p); onSaved(c); }
    toast("Post saved."); onClose();
  };
  return (
    <Modal open onClose={onClose} title={p.id ? "Edit post" : "Create post"} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Client" value={p.client} onChange={(v) => setP({ ...p, client: v })} options={clients.map((c) => ({ value: c.name, label: c.name }))} />
        <Select label="Platform" value={p.platform} onChange={(v) => setP({ ...p, platform: v })} options={PLATFORMS.map((x) => ({ value: x, label: x }))} />
        <Select label="Content type" value={p.contentType} onChange={(v) => setP({ ...p, contentType: v })} options={["Post", "Reel", "Story", "Carousel", "Video"].map((x) => ({ value: x, label: x }))} />
        <Select label="Status" value={p.status} onChange={(v) => setP({ ...p, status: v as PostStatus })} options={POST_STATUSES.map((x) => ({ value: x, label: x }))} />
        <Input label="Campaign" value={p.campaign} onChange={(v) => setP({ ...p, campaign: v })} />
        <Input label="Schedule date" type="date" value={p.scheduleDate} onChange={(v) => setP({ ...p, scheduleDate: v })} dir="ltr" />
        <div className="sm:col-span-2"><Input label="Media (URL from Media library or description)" value={p.media} onChange={(v) => setP({ ...p, media: v })} dir="ltr" /></div>
        <div className="sm:col-span-2"><label className="label">Caption</label><textarea className="input min-h-[100px]" value={p.caption} onChange={(e) => setP({ ...p, caption: e.target.value })} /></div>
      </div>
      <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost !py-2.5" onClick={onClose}>Cancel</button><button className="btn-brand !py-2.5" onClick={save}>Save</button></div>
    </Modal>
  );
}

const blankPost = (client: string): SocialPost => ({ id: "", client, platform: "instagram", caption: "", media: "", contentType: "Post", campaign: "", status: "draft", scheduleDate: new Date().toISOString().slice(0, 10) });

export function ContentAdmin({ initial, clients }: { initial: SocialPost[]; clients: SocialClient[] }) {
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState<SocialPost | null>(null);
  const [status, setStatus] = useState("all");
  const [client, setClient] = useState("all");
  const shown = list.filter((p) => (status === "all" || p.status === status) && (client === "all" || p.client === client)).sort((a, b) => a.scheduleDate.localeCompare(b.scheduleDate));
  const onSaved = (p: SocialPost) => setList((l) => (l.find((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [...l, p]));
  return (
    <>
      <PageHeader title="Content" sub="Plan, review and approve client content." actions={<><DemoBadge /><button className="btn-brand !py-2.5" onClick={() => setEdit(blankPost(clients[0]?.name || ""))}><Plus className="h-4 w-4" /> Create post</button></>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...POST_STATUSES].map((s) => <button key={s} onClick={() => setStatus(s)} className={cx("rounded-full border px-4 py-1.5 text-xs font-bold capitalize", status === s ? "border-transparent bg-brand text-white" : "border-line/25 text-muted")}>{s}</button>)}
        <select className="input ms-auto !w-auto !py-1.5 text-xs" value={client} onChange={(e) => setClient(e.target.value)}><option value="all">All clients</option>{clients.map((c) => <option key={c.id}>{c.name}</option>)}</select>
      </div>
      <Table head={["Date", "Client", "Platform", "Type", "Caption", "Campaign", "Status", ""]} empty={shown.length === 0}>
        {shown.map((p) => (
          <tr key={p.id} className="hover:bg-surface2/30">
            <td className="px-4 py-3 text-xs text-muted" dir="ltr">{p.scheduleDate}</td>
            <td className="px-4 py-3 font-semibold">{p.client}</td>
            <td className="px-4 py-3"><PlatformGlyph id={p.platform} className="h-4 w-4 text-muted" /></td>
            <td className="px-4 py-3 text-muted">{p.contentType}</td>
            <td className="max-w-[260px] truncate px-4 py-3">{p.caption}</td>
            <td className="px-4 py-3 text-muted">{p.campaign}</td>
            <td className="px-4 py-3"><Badge v={p.status} /></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1"><button className="btn-ghost !py-1.5 !text-xs" onClick={() => setEdit(p)}>Edit</button><DeleteButton label="" what="this post" onConfirm={async () => { await api("posts", "DELETE", undefined, `?id=${p.id}`); setList((l) => l.filter((x) => x.id !== p.id)); }} /></div></td>
          </tr>
        ))}
      </Table>
      {edit && <PostModal post={edit} clients={clients} onClose={() => setEdit(null)} onSaved={onSaved} />}
    </>
  );
}

/* ── Calendar ─────────────────────────────────────────── */
export function CalendarAdmin({ initial, clients }: { initial: SocialPost[]; clients: SocialClient[] }) {
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState<SocialPost | null>(null);
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [drag, setDrag] = useState<string | null>(null);
  const toast = useToast();
  const days = useMemo(() => {
    const first = new Date(cur); const startPad = (first.getDay() + 6) % 7;
    const n = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = Array(startPad).fill(null);
    for (let i = 1; i <= n; i++) cells.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`);
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [cur]);
  const onSaved = (p: SocialPost) => setList((l) => (l.find((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [...l, p]));
  const drop = async (date: string) => {
    if (!drag) return;
    const p = list.find((x) => x.id === drag); if (!p || p.scheduleDate === date) return;
    const np = { ...p, scheduleDate: date }; onSaved(np); await api("posts", "PUT", np); toast(`Moved to ${date}.`); setDrag(null);
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader title="Content Calendar" sub="Drag posts between days to reschedule. Click a post to edit it." actions={<><DemoBadge /><button className="btn-brand !py-2.5" onClick={() => setEdit(blankPost(clients[0]?.name || ""))}><Plus className="h-4 w-4" /> Create post</button></>} />
      <div className="card p-4">
        <div className="mb-4 flex items-center justify-between">
          <button className="btn-ghost !p-2" onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
          <h2 className="font-display text-lg font-bold">{cur.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
          <button className="btn-ghost !p-2" onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <div key={i} onDragOver={(e) => d && e.preventDefault()} onDrop={() => d && drop(d)} className={cx("min-h-[92px] rounded-xl border p-1.5", d ? "border-line/10 bg-surface2/30" : "border-transparent", d === today && "border-indigo/60")}>
              {d && <p className={cx("mb-1 text-[11px] font-bold", d === today ? "text-sky" : "text-muted")}>{Number(d.slice(8))}</p>}
              {d && list.filter((p) => p.scheduleDate === d).map((p) => (
                <button key={p.id} draggable onDragStart={() => setDrag(p.id)} onClick={() => setEdit(p)} className={cx("mb-1 flex w-full items-center gap-1 truncate rounded-md px-1.5 py-1 text-start text-[10px] font-semibold", p.status === "published" ? "bg-emerald-500/20 text-emerald-200" : p.status === "scheduled" ? "bg-blue/20 text-sky" : "bg-violet/20 text-[#c4a7ff]")} title={p.caption}>
                  <PlatformGlyph id={p.platform} className="h-3 w-3 shrink-0" /><span className="truncate">{p.client}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {edit && <PostModal post={edit} clients={clients} onClose={() => setEdit(null)} onSaved={onSaved} />}
    </>
  );
}

/* ── Inbox ────────────────────────────────────────────── */
export function InboxAdmin({ initial }: { initial: InboxMessage[] }) {
  const [list, setList] = useState(initial);
  const [plat, setPlat] = useState("all");
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const toast = useToast();
  const shown = list.filter((m) => plat === "all" || m.platform === plat);
  const cur = list.find((m) => m.id === open);
  const update = async (m: InboxMessage, patch: Partial<InboxMessage>) => { const n = { ...m, ...patch }; setList((l) => l.map((x) => (x.id === m.id ? n : x))); await api("inbox", "PUT", { id: m.id, ...patch }); };
  return (
    <>
      <PageHeader title="Unified Inbox" sub="Triage comments and DMs across platforms." actions={<DemoBadge />} />
      <p className="mb-4 rounded-xl border border-violet/30 bg-violet/10 px-4 py-3 text-xs text-[#c4a7ff]">No social platform APIs are connected. This inbox is a CMS/demo workflow — replies are drafted here and sent manually through each platform's official tools.</p>
      <div className="mb-4 flex flex-wrap gap-2">{["all", "instagram", "facebook", "tiktok", "linkedin", "x"].map((p) => <button key={p} onClick={() => setPlat(p)} className={cx("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold capitalize", plat === p ? "border-transparent bg-brand text-white" : "border-line/25 text-muted")}>{p !== "all" && <PlatformGlyph id={p} className="h-3.5 w-3.5" />}{p}</button>)}</div>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card divide-y divide-line/10 overflow-hidden">
          {shown.length === 0 && <p className="p-8 text-center text-sm text-muted">No conversations.</p>}
          {shown.map((m) => (
            <button key={m.id} onClick={() => { setOpen(m.id); setReply(m.suggestedReply); if (m.unread) update(m, { unread: false }); }} className={cx("flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-surface2/50", open === m.id && "bg-surface2/60")}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-muted"><PlatformGlyph id={m.platform} className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1"><p className={cx("truncate text-sm", m.unread ? "font-bold" : "font-semibold")}>{m.author} <span className="font-normal text-muted">{m.handle}</span></p><p className="truncate text-xs text-muted">{m.body}</p></div>
              <Badge v={m.category} />
            </button>
          ))}
        </div>
        <Panel>
          {cur ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-display text-lg font-bold">{cur.author}</p><p className="text-xs text-muted">{cur.handle} · {cur.platform} · {fmtDate(cur.createdAt)}</p></div>
                <Select label="" value={cur.category} onChange={(v) => update(cur, { category: v as InboxMessage["category"] })} options={["lead", "sales", "support", "question", "spam"].map((c) => ({ value: c, label: c }))} />
              </div>
              <p className="w-fit max-w-[90%] rounded-2xl rounded-ss-sm bg-surface2 px-4 py-3 text-sm">{cur.body}</p>
              <div>
                <p className="label flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-sky" /> AI suggested reply (draft)</p>
                <textarea className="input min-h-[90px]" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="No suggestion for this category." />
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-brand !py-2 !text-xs" onClick={() => { navigator.clipboard.writeText(reply); toast("Reply copied — paste it in the platform app."); }}>Copy reply</button>
                <button className="btn-ghost !py-2 !text-xs" onClick={() => { update(cur, { category: "lead" }); toast("Marked as lead."); }}><Flag className="h-3.5 w-3.5" /> Mark as lead</button>
                <button className="btn-ghost !py-2 !text-xs" onClick={() => toast("Escalated to account manager (demo).")}><ArrowUpRight className="h-3.5 w-3.5" /> Escalate</button>
                <button className="btn-ghost !py-2 !text-xs" onClick={async () => { await api("inbox", "DELETE", undefined, `?id=${cur.id}`); setList((l) => l.filter((x) => x.id !== cur.id)); setOpen(null); toast("Conversation closed."); }}><Archive className="h-3.5 w-3.5" /> Close</button>
              </div>
            </div>
          ) : <p className="text-sm text-muted">Select a conversation.</p>}
        </Panel>
      </div>
    </>
  );
}

/* ── Analytics ────────────────────────────────────────── */
function seeded(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
export function AnalyticsAdmin({ clients }: { clients: SocialClient[] }) {
  const [plat, setPlat] = useState("all");
  const [client, setClient] = useState("all");
  const [range, setRange] = useState("30");
  const data = useMemo(() => {
    const r = seeded(plat.length * 7 + client.length * 13 + Number(range));
    const n = Number(range);
    const series = Array.from({ length: n }, (_, i) => Math.round(400 + i * (900 / n) + r() * 350));
    const m = (base: number, spread: number) => Math.round(base + r() * spread);
    return { series, metrics: [["Followers", m(8200, 900)], ["Reach", m(64000, 12000)], ["Impressions", m(112000, 20000)], ["Engagement", m(5400, 800)], ["Likes", m(4100, 700)], ["Comments", m(620, 120)], ["Shares", m(310, 80)], ["Saves", m(540, 140)], ["Profile visits", m(2900, 500)], ["Clicks", m(1200, 300)], ["Leads", m(46, 18)]] as [string, number][] };
  }, [plat, client, range]);
  const max = Math.max(...data.series);
  const pts = data.series.map((v, i) => `${(i / (data.series.length - 1)) * 100},${100 - (v / max) * 90}`).join(" ");
  return (
    <>
      <PageHeader title="Analytics" sub="Performance across managed accounts." actions={<DemoBadge />} />
      <p className="mb-4 rounded-xl border border-violet/30 bg-violet/10 px-4 py-3 text-xs text-[#c4a7ff]">Demo data — generated for the interface. Connect platform exports or APIs to populate real metrics.</p>
      <div className="mb-5 flex flex-wrap gap-3">
        <select className="input !w-auto !py-2 text-xs" value={plat} onChange={(e) => setPlat(e.target.value)}><option value="all">All platforms</option>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <select className="input !w-auto !py-2 text-xs" value={client} onChange={(e) => setClient(e.target.value)}><option value="all">All clients</option>{clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
        <div className="flex rounded-full border border-line/20 p-0.5">{["7", "30", "90"].map((d) => <button key={d} onClick={() => setRange(d)} className={cx("rounded-full px-3 py-1.5 text-xs font-bold", range === d ? "bg-brand text-white" : "text-muted")}>{d}d</button>)}</div>
      </div>
      <Panel title="Reach over time">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-56 w-full">
          <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2F5BFB" stopOpacity="0.5" /><stop offset="1" stopColor="#6C2BFB" stopOpacity="0" /></linearGradient></defs>
          <polygon points={`0,100 ${pts} 100,100`} fill="url(#g)" />
          <polyline points={pts} fill="none" stroke="#4FA9FF" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        </svg>
      </Panel>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {data.metrics.map(([l, v]) => <div key={l} className="card p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{l}</p><p className="mt-1 font-display text-xl font-bold">{v.toLocaleString()}</p></div>)}
      </div>
    </>
  );
}

/* ── Reports ──────────────────────────────────────────── */
export function ReportsAdmin({ clients }: { clients: SocialClient[] }) {
  const months = ["2026-08", "2026-07", "2026-06"];
  const toast = useToast();
  return (
    <>
      <PageHeader title="Reports" sub="Monthly client performance reports." actions={<DemoBadge />} />
      <Table head={["Client", "Period", "Highlights", "Status", ""]}>
        {clients.flatMap((c) => months.map((m) => (
          <tr key={c.id + m}>
            <td className="px-4 py-3 font-semibold">{c.name}</td>
            <td className="px-4 py-3 text-muted">{m}</td>
            <td className="px-4 py-3 text-xs text-muted">Reach, engagement, top posts, next-month plan</td>
            <td className="px-4 py-3"><Badge v={m === "2026-08" ? "review" : "completed"} /></td>
            <td className="px-4 py-3 text-end"><button className="btn-ghost !py-1.5 !text-xs" onClick={() => toast("Report generation is a demo action — connect analytics data to export PDFs.")}>Generate PDF</button></td>
          </tr>
        )))}
      </Table>
    </>
  );
}

/* ── Accounts ─────────────────────────────────────────── */
export function AccountsAdmin({ initial, clients }: { initial: SocialAccount[]; clients: SocialClient[] }) {
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState<SocialAccount | null>(null);
  const toast = useToast();
  const save = async () => {
    if (!edit) return;
    if (edit.id) { await api("accounts", "PUT", edit); setList((l) => l.map((x) => (x.id === edit.id ? edit : x))); }
    else { const c = await api("accounts", "POST", edit); setList((l) => [...l, c]); }
    toast("Account saved."); setEdit(null);
  };
  return (
    <>
      <PageHeader title="Social Accounts" sub="Client accounts managed by FLUXMEDIA." actions={<button className="btn-brand !py-2.5" onClick={() => setEdit({ id: "", platform: "instagram", handle: "", client: clients[0]?.name || "", connected: false, note: "" })}><Plus className="h-4 w-4" /> Add account</button>} />
      <p className="mb-4 rounded-xl border border-violet/30 bg-violet/10 px-4 py-3 text-xs text-[#c4a7ff]">Accounts are managed through each platform's official business tools. "API connected" is a status flag only — no live platform integration is implemented in this build.</p>
      <Table head={["Platform", "Handle", "Client", "API status", "Note", ""]} empty={list.length === 0}>
        {list.map((a) => (
          <tr key={a.id}>
            <td className="px-4 py-3"><span className="inline-flex items-center gap-2 capitalize"><PlatformGlyph id={a.platform} className="h-4 w-4 text-muted" />{a.platform}</span></td>
            <td className="px-4 py-3 font-semibold" dir="ltr">{a.handle}</td>
            <td className="px-4 py-3 text-muted">{a.client}</td>
            <td className="px-4 py-3"><Badge v={a.connected ? "active" : "archived"} /> <span className="ms-1 text-xs text-muted">{a.connected ? "connected" : "manual"}</span></td>
            <td className="px-4 py-3 text-xs text-muted">{a.note}</td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1"><button className="btn-ghost !py-1.5 !text-xs" onClick={() => setEdit(a)}>Edit</button><DeleteButton label="" what={a.handle} onConfirm={async () => { await api("accounts", "DELETE", undefined, `?id=${a.id}`); setList((l) => l.filter((x) => x.id !== a.id)); }} /></div></td>
          </tr>
        ))}
      </Table>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit account" : "Add account"}>
        {edit && (
          <div className="grid gap-4">
            <Select label="Platform" value={edit.platform} onChange={(v) => setEdit({ ...edit, platform: v })} options={PLATFORMS.map((p) => ({ value: p, label: p }))} />
            <Input label="Handle" value={edit.handle} onChange={(v) => setEdit({ ...edit, handle: v })} dir="ltr" />
            <Select label="Client" value={edit.client} onChange={(v) => setEdit({ ...edit, client: v })} options={clients.map((c) => ({ value: c.name, label: c.name }))} />
            <Input label="Note" value={edit.note} onChange={(v) => setEdit({ ...edit, note: v })} />
            <Toggle label="API connected" checked={edit.connected} onChange={(v) => setEdit({ ...edit, connected: v })} />
            <div className="flex justify-end gap-2"><button className="btn-ghost !py-2.5" onClick={() => setEdit(null)}>Cancel</button><button className="btn-brand !py-2.5" onClick={save}>Save</button></div>
          </div>
        )}
      </Modal>
    </>
  );
}
