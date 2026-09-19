import { getDb } from "@/lib/db";
import { SettingsAdmin } from "@/components/admin/automations";
export default function Page() { return <SettingsAdmin initial={getDb().settings} />; }
