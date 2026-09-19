import { getDb } from "@/lib/db";
import { PackagesList } from "@/components/admin/packages";

export default async function Page() {
  const db = await getDb();

  return <PackagesList initial={db.packages} />;
}