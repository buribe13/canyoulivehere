"use client";

import { SurfaceSection } from "@/components/dashboard/dashboard-primitives";
import SummaryGuard from "@/components/dashboard/summary-guard";

export default function ResourcesPage() {
  return (
    <SummaryGuard>
      {(summary) => (
        <div className="space-y-4">
          <SurfaceSection
            eyebrow="Resources"
            title={summary.resources.title}
            description={summary.resources.narrative}
          >
            <div className="grid gap-px overflow-hidden rounded-lg border border-border xl:grid-cols-2">
              {summary.resources.items.map((item) => (
                <div key={item.title} className="bg-[rgba(255,255,255,0.02)] p-4">
                  <p className="text-caption text-ink-muted">{item.category.replace("-", " ")}</p>
                  <p className="text-body text-ink font-medium mt-1.5">{item.title}</p>
                  <p className="text-body-sm text-ink-light mt-1.5">{item.description}</p>
                </div>
              ))}
            </div>
          </SurfaceSection>
        </div>
      )}
    </SummaryGuard>
  );
}
