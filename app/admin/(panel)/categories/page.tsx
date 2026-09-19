import { getDb } from "@/lib/db";
import { CategoriesAdmin } from "@/components/admin/automations";

export default async function Page() {
  const db = await getDb();

  return <CategoriesAdmin initial={db.categories} />;
}