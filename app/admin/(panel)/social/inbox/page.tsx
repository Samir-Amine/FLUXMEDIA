import { getDb } from "@/lib/db";
import { InboxAdmin } from "@/components/admin/social-ops";
export default function Page() { return <InboxAdmin initial={getDb().inbox} />; }
