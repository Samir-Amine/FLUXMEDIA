import Link from "next/link";
import { Inbox, MessageSquare, Workflow, Package, Megaphone, Link2, ArrowUpRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { PageHeader, Panel, Badge } from "@/components/admin/kit";
import { fmtDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const db = await getDb();
  const newReq = db.requests.filter((r) => r.status === "new").length;
  const stats = [
    { label: "Requests", value: db.requests.length, sub: `${newReq} new`, icon: Inbox, href: "/admin/requests" },
    { label: "Messages", value: db.messages.length, sub: `${db.messages.filter((m) => m.status === "new").length} unread`, icon: MessageSquare, href: "/admin/messages" },
    { label: "Automations", value: db.automations.length, sub: `${db.automations.filter((a) => a.active).length} live`, icon: Workflow, href: "/admin/automations" },
    { label: "Packages", value: db.packages.length, sub: `${db.packages.filter((p) => p.visible).length} visible`, icon: Package, href: "/admin/social/packages" },
    { label: "Social clients", value: db.clients.length, sub: "demo workspace", icon: Megaphone, href: "/admin/social/clients" },
    { label: "Social links", value: db.socialLinks.filter((l) => l.active).length, sub: "active", icon: Link2, href: "/admin/social-links" },
  ];
  const recent = db.requests.slice(0, 6);

  return (
    <>
      <PageHeader title="Dashboard" sub="Overview of website activity and CMS content." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card group flex items-center gap-4 p-5 transition hover:border-indigo/50">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue to-violet text-white shadow-glow-sm"><s.icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</p>
              <p className="font-display text-2xl font-bold">{s.value} <span className="text-xs font-medium text-muted">{s.sub}</span></p>
            </div>
            <ArrowUpRight className="ms-auto h-4 w-4 text-muted transition group-hover:text-sky" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent requests">
          {recent.length === 0 ? (
            <p className="text-sm text-muted">No requests yet. Submitted automation and package requests appear here.</p>
          ) : (
            <ul className="divide-y divide-line/10">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/requests/${r.id}`} className="flex items-center gap-3 py-3 hover:text-sky">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${r.type === "automation" ? "bg-blue/15 text-sky" : "bg-violet/15 text-[#c4a7ff]"}`}>{r.type === "automation" ? "Auto" : "Social"}</span>
                    <span className="min-w-0 flex-1 truncate text-sm"><b>{r.fullName}</b> · {r.selectedName}</span>
                    <Badge v={r.status} />
                    <span className="hidden text-xs text-muted sm:block">{fmtDate(r.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Quick actions">
          <div className="grid gap-2">
            {[
              ["Add automation", "/admin/automations/new"],
              ["Add social package", "/admin/social/packages/new"],
              ["Edit Social Media page", "/admin/social/page-content"],
              ["Edit social links", "/admin/social-links"],
              ["Edit navigation", "/admin/navigation"],
              ["Site settings", "/admin/settings"],
            ].map(([l, h]) => (
              <Link key={h} href={h} className="flex items-center justify-between rounded-xl border border-line/15 px-4 py-3 text-sm font-medium transition hover:border-indigo/50 hover:bg-surface2/60">
                {l} <ArrowUpRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
