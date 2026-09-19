import { getDb } from "@/lib/db";
import { ClientsAdmin } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return (
    <ClientsAdmin
      initial={db.clients}
      packages={db.packages}
    />
  );
}