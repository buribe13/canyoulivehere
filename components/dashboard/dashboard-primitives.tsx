"use client";

import type { MetricItem } from "@/lib/types";

export function SurfaceSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-[rgba(255,255,255,0.02)] p-5">
      {eyebrow ? (
        <p className="text-label text-ink-muted mb-2">{eyebrow}</p>
      ) : null}
      <div className="mb-4">
        <h2 className="text-body text-ink font-medium">{title}</h2>
        {description ? (
          <p className="text-body-sm text-ink-light mt-1">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function MetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-[rgba(255,255,255,0.02)] px-4 py-3"
        >
          <p className="text-caption text-ink-muted mb-1.5">{item.label}</p>
          <p
            className={`text-body tabular-nums font-medium ${
              item.tone === "positive"
                ? "text-positive"
                : item.tone === "caution"
                  ? "text-[#f6c26b]"
                  : "text-ink"
            }`}
          >
            {item.value}
          </p>
          {item.detail ? (
            <p className="text-caption text-ink-muted mt-1">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PillRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-1 text-[12px] leading-[16px] text-ink-secondary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-border bg-[rgba(255,255,255,0.01)] px-6 text-center">
      <div className="max-w-md">
        <p className="text-body text-ink">{title}</p>
        <p className="text-body-sm text-ink-light mt-2">{description}</p>
      </div>
    </div>
  );
}
