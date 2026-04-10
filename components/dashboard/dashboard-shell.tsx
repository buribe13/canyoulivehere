"use client";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import Sidebar from "@/components/dashboard/sidebar";
import TopBar from "@/components/dashboard/top-bar";
import MapShell from "@/components/map/map-shell";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { citySlug, hydrated, session } = useDashboard();

  if (!hydrated || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="text-nav text-ink-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-bg p-5">
      <TopBar />

      <div className="mt-10 flex min-h-0 flex-1 gap-5">
        <div className="shrink-0">
          <Sidebar />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-bg-raised">
          <div className="absolute inset-0">
            <MapShell citySlug={citySlug} />
          </div>
          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
