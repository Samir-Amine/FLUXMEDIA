import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { AutomationEditor } from "@/components/admin/automations";
export default function Page({ params }: { params: { id: string } }) {
  const db = getDb();
  const a = db.automations.find((x) => x.id === params.id);
  if (!a) notFound();
  return <AutomationEditor initial={a} categories={db.categories} />;
}
