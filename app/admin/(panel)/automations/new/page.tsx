import { getDb } from "@/lib/db";
import { AutomationEditor } from "@/components/admin/automations";

export default async function Page() {
  const db = await getDb();

  return (
    <AutomationEditor
      initial={null}
      categories={db.categories}
    />
  );
}