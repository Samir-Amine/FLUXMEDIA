import { getDb } from "@/lib/db";
import { AccountsAdmin } from "@/components/admin/social-ops";

export default async function Page() {
  const db = await getDb();

  return (
    <AccountsAdmin
      initial={db.accounts}
      clients={db.clients}
    />
  );
}