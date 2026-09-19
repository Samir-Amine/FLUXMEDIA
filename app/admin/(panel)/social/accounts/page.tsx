import { getDb } from "@/lib/db";
import { AccountsAdmin } from "@/components/admin/social-ops";
export default function Page() { const db = getDb(); return <AccountsAdmin initial={db.accounts} clients={db.clients} />; }
