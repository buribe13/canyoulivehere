"use client";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { EmptyState } from "@/components/dashboard/dashboard-primitives";
import type { CityDashboardSummary } from "@/lib/types";

export default function SummaryGuard({
  children,
}: {
  children: (summary: CityDashboardSummary) => React.ReactNode;
}) {
  const { summary, summaryStatus, aiEnhanced } = useDashboard();

  if (summaryStatus === "loading" && !summary) {
    return (
      <EmptyState
        title="Building your readout"
        description="Pulling together financial, cultural, and displacement context."
      />
    );
  }

  if (summaryStatus === "error" || !summary) {
    return (
      <EmptyState
        title="Readout unavailable"
        description="Try adjusting an input or reloading the page."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 items-center rounded-md border border-border px-2 text-caption text-ink-muted">
          {aiEnhanced ? "AI-enhanced" : "Curated data"}
        </span>
      </div>
      {children(summary)}
    </div>
  );
}
