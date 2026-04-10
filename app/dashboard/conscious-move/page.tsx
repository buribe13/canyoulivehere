"use client";

import { MetricGrid, SurfaceSection } from "@/components/dashboard/dashboard-primitives";
import SummaryGuard from "@/components/dashboard/summary-guard";

export default function ConsciousMovePage() {
  return (
    <SummaryGuard>
      {(summary) => (
        <div className="space-y-4">
          <SurfaceSection
            eyebrow="Mirror"
            title={`${summary.consciousMove.title} · ${summary.consciousMove.score}`}
            description={summary.consciousMove.oneLiner}
          >
            <div className="space-y-4">
              <p className="text-body-sm text-ink-light">{summary.consciousMove.narrative}</p>
              <MetricGrid
                items={[
                  {
                    label: "Composite score",
                    value: `${summary.consciousMove.score}/100`,
                  },
                  {
                    label: "Current read",
                    value: summary.consciousMove.label,
                  },
                ]}
              />
            </div>
          </SurfaceSection>

          <div className="grid gap-4 xl:grid-cols-2">
            <SurfaceSection
              eyebrow="Drivers"
              title="What is pushing the score"
              description="These are the main variables shaping the current readout."
            >
              <div className="space-y-2">
                {summary.consciousMove.drivers.map((item) => (
                  <p key={item} className="text-body-sm text-ink-light">
                    {item}
                  </p>
                ))}
              </div>
            </SurfaceSection>

            <SurfaceSection
              eyebrow="Prompts"
              title="Questions to sit with"
              description="Use these as reflection prompts before treating convenience as fit."
            >
              <div className="space-y-2">
                {summary.consciousMove.prompts.map((item) => (
                  <p key={item} className="text-body-sm text-ink-light">
                    {item}
                  </p>
                ))}
              </div>
            </SurfaceSection>
          </div>
        </div>
      )}
    </SummaryGuard>
  );
}
