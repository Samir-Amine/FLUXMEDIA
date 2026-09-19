import { getDb } from "@/lib/db";
import { PageContentEditor } from "@/components/admin/page-content";

export default async function Page() {
  const db = await getDb();

  return (
    <PageContentEditor
      initial={db.socialPage}
      faqs={db.faqs}
    />
  );
}