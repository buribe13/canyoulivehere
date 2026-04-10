"use client";

import { motion } from "motion/react";
import type { City } from "@/lib/types";

interface ComingSoonPanelProps {
  city: City;
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function ComingSoonPanel({ city }: ComingSoonPanelProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full px-6 pb-16 text-center"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div
        variants={item}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        className="w-8 h-8 rounded-full mb-4"
        style={{ backgroundColor: "var(--accent-brand)", opacity: 0.6 }}
      />
      <motion.p
        variants={item}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        className="text-subheading text-ink mb-0"
      >
        Coming Soon
      </motion.p>
      <motion.p
        variants={item}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        className="text-subline-md text-ink-muted mt-0 max-w-xs"
      >
        We&apos;re crunching the numbers for {city.name}. Check back soon.
      </motion.p>
    </motion.div>
  );
}
