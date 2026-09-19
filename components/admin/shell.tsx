"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Workflow, Tags, Megaphone, Link2, Inbox, MessageSquare, Image as ImageIcon,
  Navigation, Settings, LogOut, ChevronDown, ChevronRight, Menu, X, ExternalLink,
  FileText, Package, Users, FileStack, CalendarDays, MessagesSquare, BarChart3, FileBarChart, AtSign,
} from "lucide-react";
import { Logo } from "@/components/ui";
import { ThemeToggle } from "@/components/navbar";
import { cx } from "@/lib/utils";
import { ToastProvider } from "./toast";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/automations", label: "Automations", icon: Workflow },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  {
    href: "/admin/social", label: "Social Media", icon: Megaphone,
    children: [
      { href: "/admin/social", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/social/page-content", label: "Page Content", icon: FileText },
      { href: "/admin/social/packages", label: "Packages", icon: Package },
      { href: "/admin/social/clients", label: "Clients", icon: Users },
      { href: "/admin/social/content", label: "Content", icon: FileStack },
      { href: "/admin/social/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/admin/social/inbox", label: "Inbox", icon: MessagesSquare },
      { href: "/admin/social/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/social/reports", label: "Reports", icon: FileBarChart },
      { href: "/admin/social/accounts", label: "Social Accounts", icon: AtSign },
    ],
  },
  { href: "/admin/social-links", label: "Social Links", icon: Link2 },
  { href: "/admin/requests", label: "Requests", icon: Inbox },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/navigation", label: "Navigation", icon: Navigation },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openSocial, setOpenSocial] = useState(pathname.startsWith("/admin/social") && !pathname.startsWith("/admin/social-links"));
  return (
    <nav className="flex h-full flex-col" aria-label="Admin">
      <div className="flex h-16 items-center px-5">
        <Link href="/admin" onClick={onNavigate}><Logo size={30} /></Link>
      </div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {NAV.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname === n.href || (pathname.startsWith(n.href + "/") && !(n.href === "/admin/social" && pathname.startsWith("/admin/social-links")));
          if (n.children) {
            return (
              <div key={n.href}>
                <button
                  onClick={() => setOpenSocial((o) => !o)}
                  className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-surface2 text-ink" : "text-muted hover:bg-surface2/60 hover:text-ink")}
                  aria-expanded={openSocial}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                  {openSocial ? <ChevronDown className="ms-auto h-4 w-4" /> : <ChevronRight className="ms-auto h-4 w-4 rtl-flip" />}
                </button>
                {openSocial && (
                  <div className="ms-4 mt-0.5 space-y-0.5 border-s border-line/15 ps-3">
                    {n.children.map((c) => (
                      <Link key={c.href} href={c.href} onClick={onNavigate} className={cx("flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition", pathname === c.href ? "bg-brand/15 text-sky" : "text-muted hover:text-ink")}>
                        <c.icon className="h-3.5 w-3.5" /> {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link key={n.href} href={n.href} onClick={onNavigate} className={cx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-surface2 text-ink" : "text-muted hover:bg-surface2/60 hover:text-ink")}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </div>
      <div className="shrink-0 border-t border-line/10 p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-ink">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = pathname.split("/").filter(Boolean);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen" dir="ltr">
        <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e border-line/10 bg-surface/70 backdrop-blur-xl lg:block">
          <Sidebar />
        </aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 start-0 w-72 bg-surface shadow-card">
              <button className="absolute end-3 top-4 grid h-9 w-9 place-items-center rounded-lg bg-surface2" onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col lg:ps-64">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line/10 bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
            <button className="grid h-9 w-9 place-items-center rounded-lg bg-surface2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-4 w-4" /></button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
              {crumbs.map((c, i) => {
                const href = "/" + crumbs.slice(0, i + 1).join("/");
                const last = i === crumbs.length - 1;
                return (
                  <span key={href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                    {last ? <span className="truncate font-semibold capitalize text-ink">{c.replace(/-/g, " ")}</span> : <Link href={href} className="capitalize hover:text-ink">{c.replace(/-/g, " ")}</Link>}
                  </span>
                );
              })}
            </nav>
            <div className="ms-auto flex items-center gap-2">
              <ThemeToggle />
              <button onClick={logout} className="btn-ghost !px-3.5 !py-2 !text-xs"><LogOut className="h-3.5 w-3.5" /> Log out</button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
