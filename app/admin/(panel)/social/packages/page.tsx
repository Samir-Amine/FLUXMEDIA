import { getDb } from "@/lib/db";
import { PackagesList } from "@/components/admin/packages";
export default function Page() { return <PackagesList initial={getDb().packages} />; }
