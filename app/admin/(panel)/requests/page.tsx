import { getDb } from "@/lib/db";
import { RequestsList } from "@/components/admin/requests";

export default async function Page() {
  const db = await getDb();

  return <RequestsList initial={db.requests} />;
}