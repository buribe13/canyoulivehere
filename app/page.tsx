"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import type { Mode, CostResult } from "@/lib/types";

const MapShell = dynamic(() => import("@/components/map/map-shell"), {
  ssr: false,
});
const AppSidebar = dynamic(() => import("@/components/sidebar/app-sidebar"), {
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
    setMode(null);
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

      <AppSidebar
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
        onCityDeselect={handleCityClose}
      />

      {selectedCity && (
        <CityPanel
          key={selectedCity}
          citySlug={selectedCity}
          mode={mode}
          onModeSelect={handleModeSelect}
          onClose={handleCityClose}
          costTabContent={(inputPortal) =>
            mode ? (
              <ChatThread
                mode={mode}
                citySlug={selectedCity}
                onComplete={handleChatComplete}
                inputPortal={inputPortal}
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
