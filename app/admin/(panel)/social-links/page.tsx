import { getDb } from "@/lib/db";
import { SocialLinksAdmin } from "@/components/admin/page-content";
export default function Page() { return <SocialLinksAdmin initial={getDb().socialLinks} />; }
