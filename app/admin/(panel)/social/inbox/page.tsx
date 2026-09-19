import { getDb } from "@/lib/db";
import { InboxAdmin } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return <InboxAdmin initial={db.inbox} />;
}
