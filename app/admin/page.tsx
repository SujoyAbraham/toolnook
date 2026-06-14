import { getHiddenTools } from "@/lib/visibility";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// Never cached; middleware redirects unauthenticated requests before this runs.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const hidden = await getHiddenTools();
  return <AdminDashboard initialHidden={hidden} />;
}
