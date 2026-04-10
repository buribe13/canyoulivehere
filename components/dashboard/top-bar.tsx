"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

export default function TopBar() {
  const router = useRouter();
  const { city, cities, setCitySlug, resetAllState, session } = useDashboard();
  const username = "Ben Uribe";
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      resetTimer.current = setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetAllState();
    setConfirmReset(false);
    router.push("/dashboard");
  }

  return (
    <header className="flex items-center">
      <span className="text-nav text-ink-secondary">{username}</span>
      <span className="text-nav text-ink-separator mx-2">/</span>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-nav text-ink-secondary transition-[opacity] duration-150 ease-out hover:opacity-80"
        >
          <span className="text-ink-muted">Moving to:</span>
          {city.name}, {city.state}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-[transform] duration-150 ease-out ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-xl bg-bg-raised p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {cities.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  setCitySlug(c.slug);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-nav transition-[background-color] duration-150 ease-out ${
                  c.slug === city.slug
                    ? "bg-surface text-ink"
                    : "text-ink-secondary hover:bg-[rgba(60,60,60,0.5)]"
                }`}
              >
                {c.name}, {c.state}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto">
        <button
          type="button"
          onClick={handleReset}
          className={`rounded-lg px-3 py-1.5 text-caption transition-[color,background-color] duration-150 ease-out active:scale-[0.96] ${
            confirmReset
              ? "bg-negative/12 text-negative"
              : "text-ink-muted hover:text-ink-secondary hover:bg-surface-hover"
          }`}
        >
          {confirmReset ? "Confirm reset" : "Reset"}
        </button>
      </div>
    </header>
  );
}
