"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

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
  const { setCitySlug } = useDashboard();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function go(prompt?: string, citySlug?: string) {
    if (citySlug) setCitySlug(citySlug);

    const text = (prompt ?? inputValue).trim();
    if (text) {
      router.push(`/dashboard/chat?prompt=${encodeURIComponent(text)}`);
    } else {
      router.push("/dashboard/chat");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-2.5">
      <h1 className="text-heading text-ink">
        Create an intentional moving plan
      </h1>

      <div className="flex w-full max-w-lg items-center gap-3">
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

      <div className="flex flex-col items-center gap-3">
        {SUGGESTIONS.map((row, i) => (
          <div key={i} className="flex gap-3">
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
