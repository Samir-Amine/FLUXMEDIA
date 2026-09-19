import { getDb } from "@/lib/db";
import { SettingsAdmin } from "@/components/admin/automations";

export default async function Page() {
  const db = await getDb();

  return <SettingsAdmin initial={db.settings} />;
}