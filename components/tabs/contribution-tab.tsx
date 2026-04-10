"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ContributionItem } from "@/lib/types";

interface ContributionTabProps {
  citySlug: string;
}

export default function ContributionTab({ citySlug }: ContributionTabProps) {
  const [items, setItems] = useState<ContributionItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pledged, setPledged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSelected(new Set());
    setPledged(false);
    import(`@/data/cities/culture/${citySlug}`)
      .then((mod) => {
        setItems(mod.contributionItems ?? []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [citySlug]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-body-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-body-sm text-ink-muted">
          Contribution pledges for this city are coming soon.
        </p>
      </div>
    );
  }

  if (pledged) {
    const pledgedItems = items.filter((it) => selected.has(it.id));
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl bg-surface p-6 my-4 text-center"
        style={{ border: "1px solid var(--border)" }}
      >
        <p className="text-heading text-ink mb-0">Your Pledge</p>
        <p className="text-subline-lg text-ink-muted mt-0 mb-4">
          You&apos;re committed to making this city better.
        </p>
        <div className="flex flex-col gap-2">
          {pledgedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-surface px-4 py-3 text-left"
              style={{ border: "1px solid var(--border)" }}
            >
              <p className="text-body-sm text-ink">{item.title}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      <p className="text-body-sm text-ink-muted mb-4">
        Choose up to three ways you&apos;d contribute to this community.
      </p>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {items.map((item, i) => {
            const isSelected = selected.has(item.id);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                onClick={() => toggle(item.id)}
                className={`rounded-lg px-4 py-3 text-left transition-colors cursor-pointer ${
                  isSelected ? "bg-surface-hover" : "bg-surface hover:bg-surface-hover"
                }`}
                style={{
                  border: isSelected
                    ? "1.5px solid var(--accent-brand)"
                    : "1px solid var(--border)",
                }}
              >
                <p className="text-body-sm text-ink mb-0">{item.title}</p>
                <p className="text-subline-sm text-ink-muted mt-0">
                  {item.description}
                </p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      {selected.size > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setPledged(true)}
          className="mt-4 w-full rounded-lg py-3 text-body-sm text-ink transition-[opacity] duration-150 ease-out hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: "var(--accent-brand)" }}
        >
          Make my pledge ({selected.size}/3)
        </motion.button>
      )}
    </div>
  );
}
