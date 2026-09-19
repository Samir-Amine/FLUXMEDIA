import { getDb } from "@/lib/db";
import { CategoriesAdmin } from "@/components/admin/automations";
export default function Page() { return <CategoriesAdmin initial={getDb().categories} />; }
