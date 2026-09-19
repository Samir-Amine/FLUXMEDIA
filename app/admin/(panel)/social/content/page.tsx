import { getDb } from "@/lib/db";
import { ContentAdmin } from "@/components/admin/social-ops";
export default function Page() { const db = getDb(); return <ContentAdmin initial={db.posts} clients={db.clients} />; }
