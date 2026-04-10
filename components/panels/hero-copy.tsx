"use client";

import { motion } from "motion/react";
import { fadeIn } from "@/lib/motion";

export default function HeroCopy() {
  return (
    <motion.div
      className="text-center"
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      exit={fadeIn.exit}
      transition={{ ...fadeIn.transition, delay: 0.1 }}
    >
      <h1 className="text-display text-ink mb-0">Can You Live Here?</h1>
      <p className="text-subline text-ink-muted mt-0 max-w-sm mx-auto">
        The real cost of living in America&apos;s most iconic cities — for where
        you are right now.
      </p>
    </motion.div>
  );
}
