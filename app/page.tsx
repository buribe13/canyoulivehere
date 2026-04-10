"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import type { Mode, CostResult } from "@/lib/types";

const MapShell = dynamic(() => import("@/components/map/map-shell"), {
  ssr: false,
});
const CityPanel = dynamic(() => import("@/components/panels/city-panel"), {
  ssr: false,
});
const CostBreakdownPanel = dynamic(
  () => import("@/components/panels/cost-breakdown-panel"),
  { ssr: false }
);
const ChatThread = dynamic(() => import("@/components/chat/chat-thread"), {
  ssr: false,
});

export default function Home() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [chatComplete, setChatComplete] = useState(false);
  const [costResult, setCostResult] = useState<CostResult | null>(null);

  const handleModeSelect = useCallback((m: Mode) => setMode(m), []);

  const handleCitySelect = useCallback((slug: string) => {
    setSelectedCity(slug);
    setChatComplete(false);
    setCostResult(null);
  }, []);

  const handleCityClose = useCallback(() => {
    setSelectedCity(null);
    setChatComplete(false);
    setCostResult(null);
  }, []);

  const handleChatComplete = useCallback((result: CostResult) => {
    setCostResult(result);
    setChatComplete(true);
  }, []);

  const handleCostClose = useCallback(() => {
    setChatComplete(false);
    setCostResult(null);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-bg">
      <div className="absolute inset-0">
        <MapShell onCitySelect={handleCitySelect} selectedCity={selectedCity} />
      </div>

      <AnimatePresence>
        {selectedCity && (
          <motion.button
            key="view-all"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8, transition: { duration: 0.12, ease: "easeIn" } }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            onClick={handleCityClose}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-body-sm text-ink bg-bg-raised cursor-pointer transition-[background-color] duration-150 ease-out hover:bg-surface"
            style={{ border: "1px solid var(--border)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            View All Cities
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!selectedCity && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="absolute top-5 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="rounded-2xl px-6 py-4 text-center bg-bg-raised" style={{ border: "1px solid var(--border)" }}>
              <p className="text-subheading text-ink">Can You Live Here?</p>
              <p className="text-subheading text-ink-muted mt-0.5">Pick a city on the map.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedCity && (
        <CityPanel
          key={selectedCity}
          citySlug={selectedCity}
          mode={mode}
          onModeSelect={handleModeSelect}
          onClose={handleCityClose}
          costTabContent={
            mode ? (
              <ChatThread
                mode={mode}
                citySlug={selectedCity}
                onComplete={handleChatComplete}
              />
            ) : null
          }
        />
      )}

      <AnimatePresence initial={false}>
        {chatComplete && costResult && mode && (
          <CostBreakdownPanel
            key="cost-breakdown"
            result={costResult}
            mode={mode}
            onClose={handleCostClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
