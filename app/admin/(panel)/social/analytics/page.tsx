import { getDb } from "@/lib/db";
import { AnalyticsAdmin } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return <AnalyticsAdmin clients={db.clients} />;
}