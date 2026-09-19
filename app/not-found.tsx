import Link from "next/link";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { ArrowIcon, Logo } from "@/components/ui";

export default function NotFound() {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="glow-orb top-1/3 start-1/2 h-80 w-80 -translate-x-1/2 bg-indigo/25" />
      <div className="relative text-center">
        <Link href="/" className="inline-block"><Logo /></Link>
        <p className="grad-text mt-8 font-display text-8xl font-black">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">{t(locale, "nf.t")}</h1>
        <p className="mt-2 text-muted">{t(locale, "nf.sub")}</p>
        <Link href="/" className="btn-brand mt-8">{t(locale, "nf.home")}<ArrowIcon /></Link>
      </div>
    </div>
  );
}
