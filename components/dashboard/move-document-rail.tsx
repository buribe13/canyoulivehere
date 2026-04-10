"use client";

import { useCallback } from "react";
import type { DocumentSection } from "@/lib/types";

function toneColor(tone?: DocumentSection["tone"]): string {
  if (tone === "positive") return "var(--positive)";
  if (tone === "caution") return "var(--negative)";
  return "var(--ink-muted)";
}

function SectionBlock({ section }: { section: DocumentSection }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="inline-block size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: toneColor(section.tone) }}
        />
        <h3 className="text-[13px] leading-[17px] font-medium text-ink-secondary">
          {section.title}
        </h3>
      </div>
      <div className="pl-[14px]">
        <p className="whitespace-pre-line text-[13px] leading-[18px] text-ink-muted">
          {section.body}
        </p>
      </div>
    </div>
  );
}

export default function MoveDocumentRail({
  sections,
  cityLabel,
  progress,
  complete,
}: {
  sections: DocumentSection[];
  cityLabel: string;
  progress: number;
  complete: boolean;
}) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const isEmpty = sections.length === 0;

  return (
    <div className="print-document flex h-full flex-col bg-[rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <img
          src="/images/ben-uribe.png"
          alt="Ben Uribe"
          className="size-6 rounded-full object-cover"
        />
        <span className="text-[13px] leading-[17px] font-medium text-ink-secondary">
          Ben Uribe
        </span>
        <div className="ml-auto flex items-center gap-2 print:hidden">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: complete
                  ? "var(--positive)"
                  : "var(--accent)",
              }}
            />
          </div>
          {complete && (
            <span className="rounded-full bg-[rgba(52,211,153,0.15)] px-2 py-0.5 text-[13px] leading-[17px] text-positive">
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-[13px] leading-[17px] text-ink-muted">
              Start your conversation to build your moving plan.
            </p>
          </div>
        ) : (
          <>
            {/* City — h1 to match profile page */}
            <div className="mb-10">
              <p className="text-[12px] leading-[20px] text-ink-muted">City</p>
              <h1 className="text-heading text-ink mt-0.5">
                {cityLabel}
              </h1>
            </div>

            {sections.map((section) => (
              <SectionBlock key={section.id} section={section} />
            ))}
          </>
        )}
      </div>

      {/* Print action */}
      {!isEmpty && (
        <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[rgba(255,255,255,0.06)] px-3 py-2 text-[13px] leading-[17px] font-medium text-ink-secondary transition-[background-color,transform] duration-150 ease-out hover:bg-[rgba(255,255,255,0.1)] active:scale-[0.96]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download as pdf
          </button>
        </div>
      )}
    </div>
  );
}
