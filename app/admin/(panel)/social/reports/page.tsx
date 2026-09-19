import { getDb } from "@/lib/db";
import { ReportsAdmin } from "@/components/admin/social-ops";
export default function Page() { return <ReportsAdmin clients={getDb().clients} />; }
