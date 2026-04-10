"use client";

import { useRef } from "react";
import { Tabs } from "@base-ui/react/tabs";
import type { Mode } from "@/lib/types";
import CultureTab from "./culture-tab";
import ContributionTab from "./contribution-tab";

interface CityTabsProps {
  citySlug: string;
  mode: Mode;
  costTabContent: (inputPortal: React.RefObject<HTMLDivElement | null>) => React.ReactNode;
}

function ChatIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function CostsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function CultureIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ContributeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

const TABS = [
  { value: "chat", label: "Chat", icon: ChatIcon },
  { value: "costs", label: "Costs", icon: CostsIcon },
  { value: "culture", label: "Culture", icon: CultureIcon },
  { value: "contribute", label: "Contribute", icon: ContributeIcon },
] as const;

export default function CityTabs({
  citySlug,
  mode,
  costTabContent,
}: CityTabsProps) {
  const inputPortalRef = useRef<HTMLDivElement | null>(null);

  return (
    <Tabs.Root defaultValue="chat" className="flex flex-col h-full">
      <Tabs.Panel value="chat" className="city-tab-panel" keepMounted>
        {costTabContent(inputPortalRef)}
      </Tabs.Panel>
      <Tabs.Panel value="costs" className="city-tab-panel">
        <div className="p-4 text-body-sm text-ink-muted">
          Complete the chat to see your cost breakdown.
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="culture" className="city-tab-panel">
        <CultureTab citySlug={citySlug} />
      </Tabs.Panel>
      <Tabs.Panel value="contribute" className="city-tab-panel">
        <ContributionTab citySlug={citySlug} />
      </Tabs.Panel>

      <div className="city-tabs-bar">
        <div ref={inputPortalRef} className="flex flex-col gap-2" />
        <Tabs.List className="city-tabs-list">
          {TABS.map(({ value, label, icon: Icon }) => (
            <Tabs.Tab key={value} value={value} className="city-tab">
              <Icon />
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </div>
    </Tabs.Root>
  );
}
