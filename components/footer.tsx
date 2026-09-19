import Link from "next/link";
import { Lock } from "lucide-react";
import { cookies } from "next/headers";
import { getDb, sortBy } from "@/lib/db";
import { t } from "@/lib/i18n";
import { L } from "@/lib/utils";
import { Logo, PlatformGlyph } from "./ui";
import { LanguageSwitcher } from "./navbar";
import type { Locale } from "@/lib/types";

export default function Footer() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = getDb();
  const tr = (k: string) => t(locale, k);
  const nav = sortBy(db.navigation.filter((n) => n.active), (n) => n.order);
  const links = sortBy(db.socialLinks.filter((l) => l.active), (l) => l.order).slice(0, 5);

  return (
    <footer className="relative mt-24 border-t border-line/15 bg-surface/40">
      <div className="glow-orb -top-24 start-1/4 h-64 w-64 bg-indigo/20" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="FLUXMEDIA home">
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{tr("footer.desc")}</p>
          <p className="mt-3 text-xs text-muted/80">{L(db.settings.footerNote, locale)}</p>
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </div>

        <nav aria-label={tr("footer.nav")}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">{tr("footer.nav")}</h3>
          <ul className="space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.id}>
                <Link href={n.href} className="text-muted transition hover:text-sky">
                  {L(n.label, locale)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="text-muted transition hover:text-sky">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={tr("footer.serv")}>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">{tr("footer.serv")}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/automations" className="text-muted transition hover:text-sky">{tr("footer.auto")}</Link></li>
            <li><Link href="/social-media" className="text-muted transition hover:text-sky">{tr("footer.sm")}</Link></li>
            <li><Link href="/request" className="text-muted transition hover:text-sky">{tr("nav.start")}</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">{tr("footer.social")}</h3>
          <ul className="space-y-2.5">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-muted transition hover:text-sky"
                >
                  <PlatformGlyph id={l.platform} className="h-4 w-4" />
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted/80 sm:flex-row">
          <span>© {new Date().getFullYear()} FLUXMEDIA. {tr("footer.rights")}</span>
          <span className="flex gap-6">
            <Link href="/privacy" className="transition hover:text-sky">{tr("footer.privacy")}</Link>
            <Link href="/terms" className="transition hover:text-sky">{tr("footer.terms")}</Link>
            <Link href="/admin" className="inline-flex items-center gap-1 text-muted/60 transition hover:text-sky" rel="nofollow">
              <Lock className="h-3 w-3" aria-hidden /> Admin
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
