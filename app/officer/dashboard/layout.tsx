import { Sidebar } from "./_components/Sidebar";

export default function OfficerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      {children}
    </div>
  );
}
