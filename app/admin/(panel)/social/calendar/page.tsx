import { getDb } from "@/lib/db";
import { CalendarAdmin } from "@/components/admin/social-ops";
export default function Page() { const db = getDb(); return <CalendarAdmin initial={db.posts} clients={db.clients} />; }
