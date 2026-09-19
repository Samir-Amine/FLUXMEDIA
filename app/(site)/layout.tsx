import { cookies } from "next/headers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getDb, sortBy } from "@/lib/db";
import { L } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = await getDb();
  const items = sortBy(db.navigation.filter((n) => n.active), (n) => n.order).map((n) => ({
    href: n.href,
    label: L(n.label, locale),
  }));
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar items={items} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
