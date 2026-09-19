import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { getDb } from "@/lib/db";
import { t } from "@/lib/i18n";
import { L } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import { Reveal, SectionHead } from "@/components/ui";
import ContactForm from "@/components/contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with FLUXMEDIA for general inquiries, partnerships or questions.",
  openGraph: { title: "Contact FLUXMEDIA" },
};

export default async function ContactPage() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = await getDb();
  const s = db.settings;
  return (
    <div className="relative overflow-hidden pb-16 pt-36">
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="glow-orb -top-24 start-1/4 h-80 w-80 bg-indigo/20" />
      <div className="container-x relative">
        <SectionHead badge="Contact" title={t(locale, "contact.title")} sub={t(locale, "contact.sub")} />
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="card h-full space-y-6 p-8">
              {[
                { icon: Mail, label: "Email", value: s.contactEmail, href: `mailto:${s.contactEmail}` },
                { icon: MessageCircle, label: "WhatsApp", value: s.whatsapp, href: `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` },
                { icon: MapPin, label: "Location", value: L(s.address, locale) },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface2 text-sky"><r.icon className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">{r.label}</p>
                    {r.href ? (
                      <a href={r.href} className="mt-0.5 block text-sm font-semibold hover:text-sky" dir="ltr">{r.value}</a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold">{r.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
