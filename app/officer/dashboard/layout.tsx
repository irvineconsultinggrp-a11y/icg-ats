import { DashboardMobileShell } from "@/components/layout/DashboardMobileShell";
import { Sidebar } from "./_components/Sidebar";

export default function OfficerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardMobileShell title="ICG Officer" sidebar={<Sidebar />}>
      {children}
    </DashboardMobileShell>
  );
}
