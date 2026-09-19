import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDb, sortBy } from "@/lib/db";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { SectionHead } from "@/components/ui";
import AutomationsBrowser from "@/components/automations-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Automation Systems",
  description:
    "Explore FLUXMEDIA automation systems: lead capture, CRM workflows, WhatsApp automation, AI support, appointments, e-commerce and more.",
  openGraph: { title: "AI Automation Systems | FLUXMEDIA" },
};

export default function AutomationsPage() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = getDb();
  return (
    <div className="relative overflow-hidden pb-10 pt-36">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="glow-orb -top-24 start-1/3 h-80 w-80 bg-indigo/20" />
      <div className="container-x relative">
        <SectionHead badge={t(locale, "nav.automations")} title={t(locale, "aut.title")} sub={t(locale, "aut.sub")} />
        <div className="mt-12">
          <AutomationsBrowser
            automations={sortBy(db.automations.filter((a) => a.active), (a) => a.order)}
            categories={sortBy(db.categories.filter((c) => c.active), (c) => c.order)}
          />
        </div>
      </div>
    </div>
  );
}
