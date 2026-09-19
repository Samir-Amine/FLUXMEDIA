import { getDb } from "@/lib/db";
import { ReportsAdmin } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return <ReportsAdmin clients={db.clients} />;
}