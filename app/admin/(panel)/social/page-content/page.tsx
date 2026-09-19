import { getDb } from "@/lib/db";
import { PageContentEditor } from "@/components/admin/page-content";
export default function Page() { const db = getDb(); return <PageContentEditor initial={db.socialPage} faqs={db.faqs} />; }
