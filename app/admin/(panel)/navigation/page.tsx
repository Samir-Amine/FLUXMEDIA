import { getDb } from "@/lib/db";
import { NavigationAdmin } from "@/components/admin/automations";

export default async function Page() {
  const db = await getDb();

  return <NavigationAdmin initial={db.navigation} />;
}