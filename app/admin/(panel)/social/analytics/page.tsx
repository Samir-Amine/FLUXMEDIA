import { getDb } from "@/lib/db";
import { AnalyticsAdmin } from "@/components/admin/social-ops";
export default function Page() { return <AnalyticsAdmin clients={getDb().clients} />; }
