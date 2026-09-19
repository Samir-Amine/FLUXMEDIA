import { getDb } from "@/lib/db";
import { MessagesList } from "@/components/admin/requests";

export default async function Page() {
  const db = await getDb();

  return <MessagesList initial={db.messages} />;
}