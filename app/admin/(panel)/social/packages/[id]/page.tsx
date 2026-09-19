import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { PackageEditor } from "@/components/admin/packages";

export default async function Page({ params }: { params: { id: string } }) {
  const db = await getDb();

  const p = db.packages.find((x) => x.id === params.id);

  if (!p) notFound();

  return <PackageEditor initial={p} />;
}