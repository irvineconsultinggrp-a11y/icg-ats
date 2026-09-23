import { DashboardMobileShell } from "@/components/layout/DashboardMobileShell";
import { Sidebar } from "./_components/Sidebar";

export default function ApplicantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardMobileShell title="ICG Applicant" sidebar={<Sidebar />}>
      {children}
    </DashboardMobileShell>
  );
}
