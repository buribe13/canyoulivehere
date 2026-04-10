"use client";

import { motion } from "motion/react";
import { CITIES } from "@/lib/cities";

interface AppSidebarProps {
  selectedCity: string | null;
  onCitySelect: (slug: string) => void;
  onCityDeselect: () => void;
}

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function CityIcon({ active }: { active: boolean }) {
  return (
    <span
      className="size-2 rounded-full shrink-0 transition-[background-color,box-shadow] duration-150 ease-out"
      style={{
        backgroundColor: active ? "var(--accent-brand)" : "var(--ink-muted)",
        boxShadow: active ? "0 0 0 3px rgba(255,255,255,0.06)" : "none",
      }}
    />
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export default function AppSidebar({
  selectedCity,
  onCitySelect,
  onCityDeselect,
}: AppSidebarProps) {
  return (
    <motion.nav
      className="glass-panel-fill fixed top-3 left-3 z-40 flex flex-col w-[200px] rounded-2xl overflow-clip"
      style={{
        boxShadow: "var(--shadow-panel)",
      }}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
    >
      <motion.div className="px-4 pt-4 pb-3" variants={itemVariants} transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}>
        <p className="text-body text-ink font-medium tracking-tight mb-0">Can You Live Here?</p>
        <p className="text-subline text-ink-muted mt-0">Cost of living explorer</p>
      </motion.div>

      <div className="h-px mx-3" style={{ background: "var(--border)" }} />

      <motion.button
        variants={itemVariants}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        onClick={onCityDeselect}
        className={`mx-2 mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm cursor-pointer transition-[background-color,color] duration-150 ease-out ${
          !selectedCity ? "text-ink bg-surface" : "text-ink-muted hover:text-ink-light hover:bg-surface"
        }`}
      >
        <MapIcon />
        Explore
      </motion.button>

      <motion.button
        type="button"
        variants={itemVariants}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        className="mx-2 mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm text-ink-muted cursor-pointer transition-[background-color,color] duration-150 ease-out hover:text-ink-light hover:bg-surface"
      >
        <InfoIcon />
        About
      </motion.button>

      <motion.div
        className="px-4 pt-4 pb-1.5"
        variants={itemVariants}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      >
        <p className="text-label text-ink-muted">Cities</p>
      </motion.div>

      <div className="px-2 pb-3 flex flex-col gap-0.5">
        {CITIES.map((city) => {
          const active = selectedCity === city.slug;
          return (
            <motion.button
              key={city.slug}
              variants={itemVariants}
              transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
              onClick={() => onCitySelect(city.slug)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm cursor-pointer transition-[background-color,color] duration-150 ease-out text-left ${
                active ? "text-ink bg-surface" : "text-ink-muted hover:text-ink-light hover:bg-surface"
              }`}
            >
              <CityIcon active={active} />
              <span className="truncate">{city.name}</span>
              {!city.available && (
                <span className="ml-auto text-fine text-ink-muted opacity-60">Soon</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
