"use client";

import { motion } from "motion/react";
import type { Mode } from "@/lib/types";

interface ModeSelectorProps {
  onSelect: (mode: Mode) => void;
}

const modes: { mode: Mode; title: string; desc: string }[] = [
  {
    mode: "starting-out",
    title: "Just Starting Out",
    desc: "Early career, student loans, figuring it out.",
  },
  {
    mode: "making-change",
    title: "Thinking About a Change",
    desc: "Mid-career, maybe a family, new numbers.",
  },
];

const item = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <motion.div
      className="flex flex-col gap-3 w-full"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {modes.map((m) => (
        <motion.button
          key={m.mode}
          variants={item}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(m.mode)}
          className="w-full rounded-xl px-5 py-4 text-left cursor-pointer bg-surface transition-[background-color,box-shadow] duration-150 ease-out hover:bg-surface-hover"
          style={{ boxShadow: "var(--shadow-border)" }}
        >
          <p className="text-body text-ink">{m.title}</p>
          <p className="text-caption text-ink-muted mt-0.5">{m.desc}</p>
        </motion.button>
      ))}
    </motion.div>
  );
}
