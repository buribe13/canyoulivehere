"use client";

import { motion } from "motion/react";
import { bubbleIn } from "@/lib/motion";
import type { MessageRole } from "@/lib/types";

interface ChatBubbleProps {
  role: MessageRole;
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
}

export default function ChatBubble({
  role,
  children,
  step,
  totalSteps,
}: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={bubbleIn.initial}
      animate={bubbleIn.animate}
      transition={bubbleIn.transition}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] rounded-[10px] px-3.5 py-2.5 ${
          isAssistant
            ? "text-ink"
            : "text-ink"
        }`}
        style={{
          background: isAssistant
            ? "rgba(255, 255, 255, 0.06)"
            : "var(--accent-brand)",
        }}
      >
        <p className="text-body-sm mb-0">{children}</p>
        {step !== undefined && totalSteps !== undefined && (
          <p className="text-subline-sm text-ink-muted mt-0">
            {step} of {totalSteps}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div
        className="rounded-[10px] px-3.5 py-2.5 flex gap-1 items-center"
        style={{ background: "rgba(255, 255, 255, 0.06)" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-muted"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
