"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import type { ContactMessage, RequestStatus, ServiceRequest } from "@/lib/types";
import { fmtDate, cx } from "@/lib/utils";
import { api, PageHeader, Panel, Table, Badge, DeleteButton, Select } from "./kit";
import { useToast } from "./toast";
import { PlatformGlyph } from "@/components/ui";

const STATUSES: RequestStatus[] = ["new", "reviewing", "contacted", "in_progress", "completed", "archived"];

export function RequestsList({ initial }: { initial: ServiceRequest[] }) {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState<"all" | "automation" | "social_media">("all");
  const [status, setStatus] = useState<string>("all");
  const router = useRouter();
  const shown = list.filter((r) => (filter === "all" || r.type === filter) && (status === "all" || r.status === status));

  return (
    <>
      <PageHeader title="Requests" sub="Automation and social media package requests submitted from the website." />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "automation", "social_media"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cx("rounded-full border px-4 py-1.5 text-xs font-bold capitalize", filter === f ? "border-transparent bg-brand text-white" : "border-line/25 text-muted")}>{f.replace("_", " ")}</button>
        ))}
        <select className="input ms-auto !w-auto !py-1.5 text-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>
      <Table head={["Type", "Client", "Company", "Selected", "Date", "Status", ""]} empty={shown.length === 0}>
        {shown.map((r) => (
          <tr key={r.id} className="hover:bg-surface2/30">
            <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${r.type === "automation" ? "bg-blue/15 text-sky" : "bg-violet/15 text-[#c4a7ff]"}`}>{r.type === "automation" ? "Automation" : "Social"}</span></td>
            <td className="px-4 py-3"><p className="font-semibold">{r.fullName}</p><p className="text-xs text-muted">{r.email}</p></td>
            <td className="px-4 py-3 text-muted">{r.company || "—"}</td>
            <td className="px-4 py-3">{r.selectedName}{r.selectedPrice && <span className="block text-xs text-muted">{r.selectedPrice}</span>}</td>
            <td className="px-4 py-3 text-xs text-muted">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3"><Badge v={r.status} /></td>
            <td className="px-4 py-3 text-end">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/admin/requests/${r.id}`} className="btn-ghost !py-1.5 !text-xs">Open</Link>
                <DeleteButton label="" what="this request" onConfirm={async () => { await api("requests", "DELETE", undefined, `?id=${r.id}`); setList((l) => l.filter((x) => x.id !== r.id)); router.refresh(); }} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

export function RequestDetail({ r: initial }: { r: ServiceRequest }) {
  const [r, setR] = useState(initial);
  const toast = useToast();
  const router = useRouter();
  const setStatus = async (s: string) => { await api("requests", "PUT", { id: r.id, status: s }); setR({ ...r, status: s as RequestStatus }); toast("Status updated."); router.refresh(); };
  const Row = ({ k, v }: { k: string; v?: React.ReactNode }) => v ? <div><p className="label">{k}</p><div className="text-sm">{v}</div></div> : null;

  return (
    <>
      <Link href="/admin/requests" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-sky"><ArrowLeft className="h-4 w-4" /> All requests</Link>
      <PageHeader title={`${r.type === "automation" ? "Automation" : "Social media"} request`} sub={`${r.fullName} · ${fmtDate(r.createdAt)}`} actions={<Select label="" value={r.status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Client">
          <div className="grid gap-4">
            <Row k="Full name" v={r.fullName} />
            <Row k="Email" v={<a href={`mailto:${r.email}`} className="inline-flex items-center gap-2 text-sky"><Mail className="h-3.5 w-3.5" />{r.email}</a>} />
            <Row k="WhatsApp" v={<a href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`} target="_blank" className="inline-flex items-center gap-2 text-sky"><MessageCircle className="h-3.5 w-3.5" />{r.whatsapp}</a>} />
            <Row k="Company" v={r.company} />
            <Row k="Status" v={<Badge v={r.status} />} />
          </div>
        </Panel>
        <Panel title={r.type === "automation" ? "Selected system" : "Selected package"}>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-indigo/30 bg-brand-soft p-4">
              <p className="font-display text-lg font-bold">{r.selectedName}</p>
              {r.selectedPrice && <p className="text-sm text-muted">{r.selectedPrice}</p>}
            </div>
            <Row k="Project description" v={<p className="whitespace-pre-wrap">{r.description}</p>} />
            <Row k="Additional information" v={r.additional && <p className="whitespace-pre-wrap">{r.additional}</p>} />
            {r.type === "social_media" && (
              <>
                <Row k="Preferred platforms" v={r.platforms?.length ? <div className="flex flex-wrap gap-2">{r.platforms.map((p) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1 text-xs font-semibold capitalize"><PlatformGlyph id={p} className="h-3.5 w-3.5" />{p}</span>)}</div> : null} />
                <Row k="Business goals" v={r.goals && <p className="whitespace-pre-wrap">{r.goals}</p>} />
                <Row k="Brand information / content requirements" v={r.brandInfo && <p className="whitespace-pre-wrap">{r.brandInfo}</p>} />
              </>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}

export function MessagesList({ initial }: { initial: ContactMessage[] }) {
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null);
  const router = useRouter();
  const cur = list.find((m) => m.id === open);
  const mark = async (m: ContactMessage, status: ContactMessage["status"]) => { await api("messages", "PUT", { id: m.id, status }); setList((l) => l.map((x) => (x.id === m.id ? { ...x, status } : x))); router.refresh(); };

  return (
    <>
      <PageHeader title="Messages" sub="General inquiries from the Contact page." />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card divide-y divide-line/10 overflow-hidden">
          {list.length === 0 && <p className="p-8 text-center text-sm text-muted">No messages yet.</p>}
          {list.map((m) => (
            <button key={m.id} onClick={() => { setOpen(m.id); if (m.status === "new") mark(m, "read"); }} className={cx("flex w-full items-start gap-3 px-4 py-3 text-start transition hover:bg-surface2/50", open === m.id && "bg-surface2/60")}>
              <span className={cx("mt-2 h-2 w-2 shrink-0 rounded-full", m.status === "new" ? "bg-sky" : "bg-transparent")} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name} <span className="font-normal text-muted">· {m.company || m.email}</span></p>
                <p className="truncate text-xs text-muted">{m.message}</p>
              </div>
              <span className="text-[10px] text-muted">{fmtDate(m.createdAt)}</span>
            </button>
          ))}
        </div>
        <Panel>
          {cur ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{cur.name}</p>
                  <p className="text-sm text-muted">{cur.email}{cur.whatsapp && ` · ${cur.whatsapp}`}{cur.company && ` · ${cur.company}`}</p>
                </div>
                <Badge v={cur.status} />
              </div>
              <p className="whitespace-pre-wrap rounded-2xl bg-surface2/50 p-4 text-sm leading-relaxed">{cur.message}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${cur.email}`} className="btn-brand !py-2 !text-xs"><Mail className="h-3.5 w-3.5" /> Reply by email</a>
                <button className="btn-ghost !py-2 !text-xs" onClick={() => mark(cur, "archived")}>Archive</button>
                <DeleteButton what="this message" onConfirm={async () => { await api("messages", "DELETE", undefined, `?id=${cur.id}`); setList((l) => l.filter((x) => x.id !== cur.id)); setOpen(null); router.refresh(); }} />
              </div>
            </div>
          ) : <p className="text-sm text-muted">Select a message.</p>}
        </Panel>
      </div>
    </>
  );
}
