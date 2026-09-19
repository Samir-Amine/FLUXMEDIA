import { getDb } from "@/lib/db";
import { NavigationAdmin } from "@/components/admin/automations";
export default function Page() { return <NavigationAdmin initial={getDb().navigation} />; }
