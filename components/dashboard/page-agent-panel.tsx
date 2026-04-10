"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import type { MovePlanMessage } from "@/lib/types";

export default function PageAgentPanel({
  title,
  placeholder,
  messages,
  loading,
  onSend,
  headerAction,
}: {
  title: string;
  placeholder: string;
  messages: MovePlanMessage[];
  loading: boolean;
  onSend: (content: string) => Promise<void> | void;
  headerAction?: React.ReactNode;
}) {
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [loading, messages]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue || loading) return;
    setValue("");
    void onSend(nextValue);
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-nav text-ink-secondary">{title}</span>
        {headerAction}
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col overflow-y-auto px-5 py-4"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              duration: 0.35,
              bounce: 0,
              delay: index === messages.length - 1 ? 0.04 : 0,
            }}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-body ${
              message.role === "user"
                ? "self-end bg-surface text-ink"
                : "self-start bg-accent text-white"
            }${index === 0 ? "" : messages[index - 1].role !== message.role ? " mt-5" : " mt-1"}`}
          >
            {message.content}
          </motion.div>
        ))}
        {loading ? (
          <div className="self-start rounded-2xl bg-accent px-4 py-2.5 text-body text-white">
            ...
          </div>
        ) : null}
      </div>

      <div className="px-3 pb-3 pt-1">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-3xl bg-bg px-4 py-3"
        >
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-muted outline-none"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96] disabled:opacity-30"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
