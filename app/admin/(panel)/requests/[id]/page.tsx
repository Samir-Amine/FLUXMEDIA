import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { RequestDetail } from "@/components/admin/requests";
export default async function Page({ params }: { params: { id: string } }) {
  const db = await getDb();

  const r = db.requests.find((x) => x.id === params.id);

  if (!r) notFound();

  return <RequestDetail r={r} />;
}
