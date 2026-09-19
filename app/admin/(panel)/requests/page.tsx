import { getDb } from "@/lib/db";
import { RequestsList } from "@/components/admin/requests";
export default function Page() { return <RequestsList initial={getDb().requests} />; }
