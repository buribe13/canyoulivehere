"use client";

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
  costTabContent: (inputPortal: React.RefObject<HTMLDivElement | null>) => React.ReactNode;
}

export default function CityPanel({
  citySlug,
  mode,
  onModeSelect,
  onClose,
  costTabContent,
}: CityPanelProps) {
  const city = getCityBySlug(citySlug);

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
            <Drawer.Content className="drawer-content glass-panel-fill">
              <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div>
                  <Drawer.Title className="text-body text-ink font-medium mb-0">
                    {city.name}
                  </Drawer.Title>
                  <Drawer.Description className="text-subline text-ink-muted mt-0">
                    {city.tagline}
                  </Drawer.Description>
                </div>
                <Drawer.Close className="mt-0.5 size-7 flex items-center justify-center rounded-lg text-ink-muted transition-[color] duration-150 ease-out hover:text-ink active:scale-[0.96] cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </Drawer.Close>
              </div>

              <div className="flex-1 overflow-hidden">
                {!mode ? (
                  <div className="flex flex-col justify-center h-full px-4 pb-16">
                    <p className="text-body-sm text-ink-muted mb-3">
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
