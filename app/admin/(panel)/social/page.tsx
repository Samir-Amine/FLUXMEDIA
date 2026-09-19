import { getDb } from "@/lib/db";
import { SocialOverview } from "@/components/admin/social-ops";
export default function Page() { const db = getDb(); return <SocialOverview clients={db.clients} posts={db.posts} inbox={db.inbox} />; }
