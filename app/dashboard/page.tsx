"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { parseMoveIntent } from "@/lib/parse-move-intent";

interface Suggestion {
  label: string;
  citySlug?: string;
}

const SUGGESTIONS: Suggestion[][] = [
  [
    { label: "To Los Angeles", citySlug: "los-angeles" },
    { label: "Boston history", citySlug: "boston" },
    { label: "West Coast displacement" },
  ],
  [
    { label: "Programs for Gen Z" },
    { label: "NYC transit expenses", citySlug: "new-york" },
  ],
];

export default function GetStartedPage() {
  const router = useRouter();
  const {
    setCitySlug,
    addHistoryNode,
    updateHistoryNode,
    removeHistoryNode,
    livingHistory,
  } = useDashboard();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const intent = useMemo(() => parseMoveIntent(inputValue), [inputValue]);

  function go(prompt?: string, citySlug?: string) {
    const text = (prompt ?? inputValue).trim();

    const resolvedSlug = citySlug ?? intent.destination?.slug;
    if (resolvedSlug) setCitySlug(resolvedSlug);

    if (!citySlug && intent.originText) {
      const originNodes = livingHistory.nodes.filter(
        (n) => n.relationship === "origin"
      );
      const keep = originNodes[0];
      for (const stale of originNodes.slice(1)) {
        removeHistoryNode(stale.id);
      }
      if (keep) {
        updateHistoryNode(keep.id, { place: intent.originText });
      } else {
        addHistoryNode({
          id: "origin-auto",
          place: intent.originText,
          relationship: "origin",
        });
      }
    }

    if (text) {
      router.push(`/dashboard/chat?prompt=${encodeURIComponent(text)}`);
    } else {
      router.push("/dashboard/chat");
    }
  }

  const showIndicator =
    intent.destination !== null || intent.originText !== null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-2.5">
      <h1 className="text-heading text-ink">
        Create an intentional moving plan
      </h1>

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={() => go()}
            className="flex shrink-0 items-center gap-2 rounded-3xl bg-white px-4 py-3 text-nav text-black transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className="flex flex-1 items-center gap-2 rounded-3xl bg-bg px-4 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Start your moving plan..."
              autoFocus
              className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-muted outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96] disabled:opacity-30"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        <AnimatePresence>
          {showIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="flex items-center gap-2 px-1"
            >
              {intent.originText && (
                <motion.span
                  key={`from-${intent.originText}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                  className="flex items-center gap-1.5 rounded-full bg-surface/50 px-2.5 py-1"
                >
                  <span className="text-caption text-ink-muted">from</span>
                  <span className="text-caption text-ink-secondary">
                    {intent.originText}
                  </span>
                </motion.span>
              )}
              {intent.originText && intent.destination && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--ink-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
              {intent.destination && (
                <motion.span
                  key={`to-${intent.destination.slug}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                  className="flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-caption text-accent">
                    {intent.destination.name}
                  </span>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-1">
        {SUGGESTIONS.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => go(s.label, s.citySlug)}
                className="rounded-3xl bg-bg/60 px-3 py-2 text-pill text-ink backdrop-blur-md transition-[opacity,transform] duration-150 ease-out hover:opacity-80 active:scale-[0.96]"
              >
                {s.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
