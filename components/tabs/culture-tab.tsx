"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { CultureCard } from "@/lib/types";

interface CultureTabProps {
  citySlug: string;
}

export default function CultureTab({ citySlug }: CultureTabProps) {
  const [cards, setCards] = useState<CultureCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    import(`@/data/cities/culture/${citySlug}`)
      .then((mod) => {
        setCards(mod.cultureCards ?? []);
        setLoading(false);
      })
      .catch(() => {
        setCards([]);
        setLoading(false);
      });
  }, [citySlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-body-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-body-sm text-ink-muted">
          Culture content for this city is coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-lg bg-surface p-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-label text-accent">{card.tag}</span>
          </div>
          <p className="text-subheading text-ink mb-0">{card.name}</p>
          <p className="text-subline-md text-ink-light mt-0">{card.story}</p>
          {card.link && (
            <a
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-caption text-accent hover:underline"
            >
              Learn more →
            </a>
          )}
        </motion.div>
      ))}
    </div>
  );
}
