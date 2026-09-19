import { getDb } from "@/lib/db";
import { ContentAdmin } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return (
    <ContentAdmin
      initial={db.posts}
      clients={db.clients}
    />
  );
}