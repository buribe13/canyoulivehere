"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import type { ChatMessage, Mode, UserAnswers, CityCostData, CostResult } from "@/lib/types";
import { createChatEngine } from "@/lib/chat-flow";
import { loadCityCostData } from "@/lib/cities";
import { calculateCost } from "@/lib/cost-model";
import ChatBubble, { TypingIndicator } from "./chat-bubble";

interface ChatThreadProps {
  mode: Mode;
  citySlug: string;
  onComplete: (result: CostResult) => void;
  inputPortal?: React.RefObject<HTMLDivElement | null>;
}

const engine = createChatEngine();

export default function ChatThread({
  mode,
  citySlug,
  onComplete,
  inputPortal,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({});
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const costDataRef = useRef<CityCostData | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    loadCityCostData(citySlug).then((data) => {
      costDataRef.current = data;
    });
  }, [citySlug]);

  const pushAssistantMessage = useCallback(
    (nextStep: number, currentAnswers: Partial<UserAnswers>) => {
      setTyping(true);
      setTimeout(() => {
        const msg = engine.getNextMessage(mode, nextStep, currentAnswers);
        if (msg) {
          setMessages((prev) => [...prev, msg]);
          setStep(nextStep + 1);
        }
        setTyping(false);
      }, 600);
    },
    [mode]
  );

  useEffect(() => {
    pushAssistantMessage(0, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const handleAnswer = useCallback(
    (value: string) => {
      const userMsg: ChatMessage = {
        id: `user-${step}`,
        role: "user",
        content: value,
      };
      setMessages((prev) => [...prev, userMsg]);

      const newAnswers = { ...answers };
      const currentStep = step - 1;

      if (mode === "starting-out") {
        switch (currentStep) {
          case 0:
            newAnswers.income = Number(value);
            break;
          case 1:
            newAnswers.living = value as UserAnswers["living"];
            break;
          case 2:
            newAnswers.transport = value as UserAnswers["transport"];
            break;
          case 3:
            newAnswers.food = value as UserAnswers["food"];
            break;
          case 4:
            newAnswers.studentLoans = Number(value) || 0;
            break;
          case 5:
            newAnswers.lifestyle = value as UserAnswers["lifestyle"];
            break;
        }
      } else {
        switch (currentStep) {
          case 0:
            newAnswers.income = Number(value);
            break;
          case 1:
            newAnswers.living = value as UserAnswers["living"];
            break;
          case 2:
            newAnswers.transport = value as UserAnswers["transport"];
            break;
          case 3:
            newAnswers.food = value as UserAnswers["food"];
            break;
          case 4:
            newAnswers.priority = value as UserAnswers["priority"];
            break;
          case 5:
            newAnswers.lifestyle = value as UserAnswers["lifestyle"];
            break;
        }
      }

      setAnswers(newAnswers);

      const totalSteps = engine.getTotalSteps(mode);
      if (step >= totalSteps) {
        if (costDataRef.current) {
          const result = calculateCost(
            costDataRef.current,
            newAnswers as UserAnswers,
            mode
          );
          setTimeout(() => onComplete(result), 400);
        }
      } else {
        pushAssistantMessage(step, newAnswers);
      }
    },
    [step, answers, mode, onComplete, pushAssistantMessage]
  );

  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const showOptions = lastAssistantMsg?.options && !typing;
  const showInput = lastAssistantMsg?.inputType && !typing;
  const isWaitingForAnswer =
    lastAssistantMsg?.role === "assistant" &&
    messages[messages.length - 1]?.role === "assistant";

  const inputContent = isWaitingForAnswer && !typing ? (
    <>
      {showOptions && (
        <div className="flex flex-wrap gap-1.5">
          {lastAssistantMsg!.options!.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="rounded-lg px-3 py-1.5 text-body-sm text-ink-light hover:text-ink bg-surface hover:bg-surface-hover transition-[background-color,color] duration-150 ease-out cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {showInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              handleAnswer(inputValue.trim());
              setInputValue("");
            }
          }}
          className="flex items-center gap-2 rounded-[50px] px-3 w-full"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        >
          <span className="text-body-sm text-ink-muted select-none">$</span>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter amount"
            autoFocus
            className="flex-1 bg-transparent py-2.5 text-body-sm text-ink placeholder:text-ink-muted outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="submit"
            className="size-6 flex items-center justify-center rounded-[50px] transition-[opacity] duration-150 ease-out hover:opacity-90 cursor-pointer shrink-0"
            style={{ backgroundColor: "var(--accent-brand)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      )}
    </>
  ) : null;

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              step={msg.step}
              totalSteps={msg.totalSteps}
            >
              {msg.content}
            </ChatBubble>
          ))}
          {typing && <TypingIndicator key="typing" />}
        </AnimatePresence>
      </div>

      {inputContent && inputPortal?.current
        ? createPortal(inputContent, inputPortal.current)
        : inputContent && (
            <div className="pb-3 pt-1.5 flex flex-col gap-2">
              {inputContent}
            </div>
          )}
    </div>
  );
}
