"use client";

import { PillRow, SurfaceSection } from "@/components/dashboard/dashboard-primitives";
import SummaryGuard from "@/components/dashboard/summary-guard";

export default function NeighborhoodsPage() {
  return (
    <SummaryGuard>
      {(summary) => (
        <div className="space-y-4">
          <SurfaceSection
            eyebrow="Neighborhoods"
            title={summary.cultural.title}
            description={summary.cultural.narrative}
          >
            <div className="space-y-4">
              <p className="text-body-sm text-ink-light">{summary.cultural.historicalContext}</p>
              <p className="text-body-sm text-ink-muted">{summary.cultural.languageAccess}</p>
            </div>
          </SurfaceSection>

          <div className="grid gap-4 xl:grid-cols-2">
            {summary.cultural.neighborhoods.map((item) => (
              <SurfaceSection
                key={item.name}
                eyebrow={item.pressure}
                title={item.name}
                description={item.narrative}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-label text-ink-muted mb-2">Language access</p>
                    <PillRow items={item.languages} />
                  </div>
                  <div>
                    <p className="text-label text-ink-muted mb-2">Cultural anchors</p>
                    <PillRow items={item.anchors} />
                  </div>
                </div>
              </SurfaceSection>
            ))}
          </div>
        </div>
      )}
    </SummaryGuard>
  );
}
