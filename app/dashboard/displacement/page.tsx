"use client";

import { SurfaceSection } from "@/components/dashboard/dashboard-primitives";
import SummaryGuard from "@/components/dashboard/summary-guard";

export default function DisplacementPage() {
  return (
    <SummaryGuard>
      {(summary) => (
        <div className="space-y-4">
          <SurfaceSection
            eyebrow="Displacement"
            title={summary.displacement.title}
            description={summary.displacement.narrative}
          >
            <div className="space-y-px overflow-hidden rounded-lg border border-border">
              {summary.displacement.timeline.map((item) => (
                <div
                  key={`${item.year}-${item.title}`}
                  className="bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <p className="text-caption text-ink-muted">{item.year}</p>
                  <p className="text-body text-ink font-medium mt-1.5">{item.title}</p>
                  <p className="text-body-sm text-ink-light mt-1.5">{item.detail}</p>
                </div>
              ))}
            </div>
          </SurfaceSection>

          <SurfaceSection
            eyebrow="Protections"
            title="Tenant and pressure notes"
            description="These are not a substitute for local legal advice, but they help frame what pressure looks like on the ground."
          >
            <div className="space-y-2">
              {summary.displacement.tenantProtections.map((item) => (
                <p key={item} className="text-body-sm text-ink-light">{item}</p>
              ))}
            </div>
          </SurfaceSection>
        </div>
      )}
    </SummaryGuard>
  );
}
