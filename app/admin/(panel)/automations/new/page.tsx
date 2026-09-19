import { getDb } from "@/lib/db";
import { AutomationEditor } from "@/components/admin/automations";
export default function Page() { return <AutomationEditor initial={null} categories={getDb().categories} />; }
