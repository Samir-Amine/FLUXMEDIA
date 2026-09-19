import { getDb } from "@/lib/db";
import { ClientsAdmin } from "@/components/admin/social-ops";
export default function Page() { const db = getDb(); return <ClientsAdmin initial={db.clients} packages={db.packages} />; }
