import { getDb } from "@/lib/db";
import { SocialLinksAdmin } from "@/components/admin/page-content";

export default async function Page() {
  const db = await getDb();

  return <SocialLinksAdmin initial={db.socialLinks} />;
}