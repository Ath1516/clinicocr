import { getDashboardStats } from "@/actions";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardView stats={stats as any} />;
}
