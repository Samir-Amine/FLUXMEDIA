import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDb, sortBy } from "@/lib/db";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import SocialLinksClient from "@/components/social-links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect With FLUXMEDIA",
  description: "All official FLUXMEDIA links — Instagram, Facebook, WhatsApp, LinkedIn, X and website.",
  openGraph: { title: "Connect With FLUXMEDIA" },
};

export default function SocialPage() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const links = sortBy(getDb().socialLinks.filter((l) => l.active), (l) => l.order);
  return (
    <SocialLinksClient
      links={links}
      title={t(locale, "social.title")}
      sub={t(locale, "social.sub")}
      locale={locale}
    />
  );
}
