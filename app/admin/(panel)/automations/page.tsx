import { getDb } from "@/lib/db";
import { AutomationsList } from "@/components/admin/automations";

export default async function Page() {
  const db = await getDb();

  return (
    <AutomationsList
      initial={db.automations}
      categories={db.categories}
    />
  );
}