"use client";

import { useEffect } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { getCityBySlug } from "@/lib/cities";
import type { Mode } from "@/lib/types";
import CityTabs from "@/components/tabs/city-tabs";
import ComingSoonPanel from "./coming-soon-panel";
import ModeSelector from "./mode-selector";

interface CityPanelProps {
  citySlug: string;
  mode: Mode | null;
  onModeSelect: (mode: Mode) => void;
  onClose: () => void;
  costTabContent: React.ReactNode;
}

export default function CityPanel({
  citySlug,
  mode,
  onModeSelect,
  onClose,
  costTabContent,
}: CityPanelProps) {
  const city = getCityBySlug(citySlug);

  useEffect(() => {
    if (!city) return;
    document.documentElement.style.setProperty("--accent", `var(--accent-${city.slug})`);
    return () => { document.documentElement.style.removeProperty("--accent"); };
  }, [city]);

  if (!city) return null;

  return (
    <Drawer.Root
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      swipeDirection="right"
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="drawer-backdrop" />
        <Drawer.Viewport className="drawer-viewport">
          <Drawer.Popup className="drawer-popup">
            <Drawer.Content className="drawer-content">
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <Drawer.Title className="text-subheading text-ink">
                    {city.name}
                  </Drawer.Title>
                  <Drawer.Description className="text-subheading text-ink-muted mt-0.5">
                    {city.tagline}
                  </Drawer.Description>
                </div>
                <Drawer.Close className="mt-0.5 size-8 flex items-center justify-center rounded-lg text-ink-muted transition-[color] duration-150 ease-out hover:text-ink active:scale-[0.96] cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </Drawer.Close>
              </div>

              <div className="flex-1 overflow-hidden">
                {!mode ? (
                  <div className="flex flex-col justify-center h-full px-5 pb-16">
                    <p className="text-body-sm text-ink-muted mb-4">
                      How should we look at {city.name}?
                    </p>
                    <ModeSelector onSelect={onModeSelect} />
                  </div>
                ) : city.available ? (
                  <CityTabs citySlug={citySlug} mode={mode} costTabContent={costTabContent} />
                ) : (
                  <ComingSoonPanel city={city} />
                )}
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
