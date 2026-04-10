"use client";

import { MetricGrid, SurfaceSection } from "@/components/dashboard/dashboard-primitives";
import SummaryGuard from "@/components/dashboard/summary-guard";

export default function FinancialDashboardPage() {
  return (
    <SummaryGuard>
      {(summary) => (
        <div className="space-y-4">
          <SurfaceSection
            eyebrow="Financial"
            title="Affordability translator"
            description={summary.financial.narrative}
          >
            <div className="space-y-4">
              <p className="text-body text-ink-light">{summary.financial.lifestyleTranslation}</p>
              <MetricGrid items={summary.financial.metrics} />
            </div>
          </SurfaceSection>

          <SurfaceSection
            eyebrow="Landing"
            title="First month cost"
            description="The up-front move is often heavier than the monthly budget suggests."
          >
            <div className="space-y-4">
              <MetricGrid items={summary.financial.firstMonthCosts} />
              <p className="text-body-sm text-ink-muted">{summary.financial.taxNote}</p>
            </div>
          </SurfaceSection>
        </div>
      )}
    </SummaryGuard>
  );
}
