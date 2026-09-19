import { getDb } from "@/lib/db";
import { MessagesList } from "@/components/admin/requests";
export default function Page() { return <MessagesList initial={getDb().messages} />; }
