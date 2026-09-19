import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDb, sortBy } from "@/lib/db";
import { L } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import AutomationRequestClient from "@/components/request-automation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request an Automation",
  description:
    "Tell FLUXMEDIA what you want to automate — lead capture, CRM, WhatsApp, support, appointments — and get a plan.",
  openGraph: { title: "Request an Automation | FLUXMEDIA" },
};

export default function RequestPage({ searchParams }: { searchParams: { automation?: string } }) {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = getDb();
  const automations = sortBy(db.automations.filter((a) => a.active), (a) => a.order);
  const selected = automations.find((a) => a.slug === searchParams.automation) || null;

  return (
    <AutomationRequestClient
      options={automations.map((a) => ({ id: a.id, slug: a.slug, title: L(a.title, locale), short: L(a.short, locale), workflow: a.workflow.map((w) => L(w, locale)), integrations: a.integrations, icon: a.icon }))}
      selectedId={selected?.id || null}
    />
  );
}
