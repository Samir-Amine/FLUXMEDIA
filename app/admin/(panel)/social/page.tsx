import { getDb } from "@/lib/db";
import { SocialOverview } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return (
    <SocialOverview
      clients={db.clients}
      posts={db.posts}
      inbox={db.inbox}
    />
  );
}