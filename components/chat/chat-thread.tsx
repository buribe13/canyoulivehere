"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import type {
  ChatMessage,
  ChatOption,
  Mode,
  UserAnswers,
  CityCostData,
  CostResult,
} from "@/lib/types";
import { loadCityCostData } from "@/lib/cities";
import { calculateCost } from "@/lib/cost-model";
import ChatBubble, { TypingIndicator } from "./chat-bubble";

interface ChatThreadProps {
  mode: Mode;
  citySlug: string;
  onComplete: (result: CostResult) => void;
  inputPortal?: React.RefObject<HTMLDivElement | null>;
}

interface ChatTurnResponse {
  assistantMessages: string[];
  answers: Partial<UserAnswers>;
  complete: boolean;
  options?: ChatOption[];
  inputType: "text" | null;
  step: number;
  totalSteps: number;
}

export default function ChatThread({
  mode,
  citySlug,
  onComplete,
  inputPortal,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Partial<UserAnswers>>({});
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ChatOption[]>();
  const [inputType, setInputType] = useState<"text" | null>("text");
  const scrollRef = useRef<HTMLDivElement>(null);
  const costDataRef = useRef<CityCostData | null>(null);
  const requestIdRef = useRef(0);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const requestAssistantTurn = useCallback(
    async (
      nextMessages: ChatMessage[],
      currentAnswers: Partial<UserAnswers>
    ) => {
      const requestId = ++requestIdRef.current;
      setTyping(true);
      setOptions(undefined);

      try {
        const response = await fetch("/api/chat-intake", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citySlug,
            mode,
            answers: currentAnswers,
            messages: nextMessages,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat intake failed");
        }

        const data = (await response.json()) as ChatTurnResponse;
        if (requestId !== requestIdRef.current) {
          return;
        }

        const assistantMsgs: ChatMessage[] = data.assistantMessages.map(
          (text, i) => ({
            id: `assistant-${Date.now()}-${i}`,
            role: "assistant" as const,
            content: text,
            options: i === data.assistantMessages.length - 1 ? data.options : undefined,
            inputType: i === data.assistantMessages.length - 1 ? (data.inputType ?? undefined) : undefined,
            step: data.step,
            totalSteps: data.totalSteps,
          })
        );

        setMessages([...nextMessages, ...assistantMsgs]);
        setAnswers(data.answers);
        setOptions(data.options);
        setInputType(data.inputType);

        if (data.complete) {
          const costData =
            costDataRef.current ?? (await loadCityCostData(citySlug));
          costDataRef.current = costData;

          if (costData) {
            const result = calculateCost(
              costData,
              data.answers as UserAnswers,
              mode
            );
            window.setTimeout(() => onComplete(result), 450);
          }
        }
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setOptions(undefined);
        setInputType("text");
        setMessages([
          ...nextMessages,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content:
              "hit a snag reading your answer, try sending that again",
          },
        ]);
      } finally {
        if (requestId === requestIdRef.current) {
          setTyping(false);
        }
      }
    },
    [citySlug, mode, onComplete]
  );

  useEffect(() => {
    requestIdRef.current += 1;
    setMessages([]);
    setAnswers({});
    setInputValue("");
    setOptions(undefined);
    setInputType("text");
    void requestAssistantTurn([], {});
  }, [citySlug, mode, requestAssistantTurn]);

  const handleAnswer = useCallback(
    async (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue || typing) {
        return;
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedValue,
      };
      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setInputValue("");

      await requestAssistantTurn(nextMessages, answers);
    },
    [answers, messages, requestAssistantTurn, typing]
  );

  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const showOptions = options && options.length > 0 && !typing;
  const showInput = inputType && !typing;
  const isWaitingForAnswer =
    lastAssistantMsg?.role === "assistant" &&
    messages[messages.length - 1]?.role === "assistant" &&
    Boolean(inputType);

  const inputContent = isWaitingForAnswer && !typing ? (
    <>
      {showOptions && (
        <div className="flex flex-wrap gap-1.5">
          {options!.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="rounded-lg px-3 py-1.5 text-body-sm text-ink-light hover:text-ink bg-surface hover:bg-surface-hover transition-[background-color,color,transform] duration-150 ease-out cursor-pointer active:scale-[0.96]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {showInput && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleAnswer(inputValue);
          }}
          className="flex items-center gap-2 rounded-[50px] px-3 w-full"
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 28px rgba(0,0,0,0.12)",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer"
            autoFocus
            className="flex-1 bg-transparent py-2.5 text-body-sm text-ink placeholder:text-ink-muted outline-none"
          />
          <button
            type="submit"
            className="size-8 flex items-center justify-center rounded-[50px] transition-[opacity,transform] duration-150 ease-out hover:opacity-90 cursor-pointer shrink-0 active:scale-[0.96]"
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 flex flex-col">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              step={msg.step}
              totalSteps={msg.totalSteps}
              className={i === 0 ? "" : messages[i - 1].role !== msg.role ? "mt-5" : "mt-1"}
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
