import DashboardShell from "@/components/dashboard/dashboard-shell";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
