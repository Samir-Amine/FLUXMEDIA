import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDb, sortBy } from "@/lib/db";
import type { Locale } from "@/lib/types";
import PackageRequestClient from "@/components/request-package";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { package?: string };
}): Promise<Metadata> {
  const db = await getDb();

  const pkg = db.packages.find(
    (p) => p.slug === searchParams.package && p.visible
  );
  const name = pkg ? `${pkg.name} Package` : "Social Media Package";
  return {
    title: `Request the ${name}`,
    description: pkg ? pkg.description.en : "Request a FLUXMEDIA social media management package.",
    openGraph: { title: `Request the ${name} | FLUXMEDIA` },
  };
}

export default async function PackageRequestPage({ searchParams }: { searchParams: { package?: string } }) {
  const locale = (cookies().get("locale")?.value as Locale) || "en";
  const db = await getDb();
  const packages = sortBy(db.packages.filter((p) => p.visible), (p) => p.order);
  const selected = packages.find((p) => p.slug === searchParams.package) || null;
  return <PackageRequestClient packages={packages} selectedId={selected?.id || null} locale={locale} />;
}
