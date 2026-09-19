import { getDb } from "@/lib/db";
import { AutomationsList } from "@/components/admin/automations";
export default function Page() { const db = getDb(); return <AutomationsList initial={db.automations} categories={db.categories} />; }
