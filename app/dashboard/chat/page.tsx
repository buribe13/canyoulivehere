"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-provider";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Answers = Record<string, unknown>;

/* ── Plan field definitions grouped by section ─────────── */

interface PlanField {
  key: string;
  label: string;
}

interface PlanSection {
  title: string;
  fields: PlanField[];
}

const FINANCIAL_FIELDS: PlanField[] = [
  { key: "income", label: "Annual Income" },
  { key: "living", label: "Housing" },
  { key: "transport", label: "Transportation" },
  { key: "food", label: "Food Spending" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "studentLoans", label: "Student Loans" },
  { key: "priority", label: "Priority" },
];

const PERSONAL_FIELDS: PlanField[] = [
  { key: "ethnicity", label: "Race / Ethnicity" },
  { key: "languageFluency", label: "Language Fluency" },
  { key: "communityTies", label: "Community Ties" },
];

const POSITIONALITY_FIELDS: PlanField[] = [
  { key: "financialBackup", label: "Financial Safety Net" },
  { key: "moveReason", label: "Reason for Moving" },
];

const PLAN_SECTIONS: PlanSection[] = [
  { title: "Financial Profile", fields: FINANCIAL_FIELDS },
  { title: "Personal Context", fields: PERSONAL_FIELDS },
  { title: "Positionality", fields: POSITIONALITY_FIELDS },
];

const ALL_FIELD_KEYS = PLAN_SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

const VALUE_LABELS: Record<string, string> = {
  alone: "Living alone",
  roommates: "With roommates",
  family: "With family",
  car: "Car",
  transit: "Public transit",
  hybrid: "Mix of both",
  low: "Cooking mostly",
  medium: "Balanced",
  high: "Eating out often",
  minimal: "Minimal",
  balanced: "Balanced",
  social: "Social",
  premium: "Premium",
  neighborhood: "Neighborhood quality",
  commute: "Short commute",
  cost: "Lower cost",
  learning: "Learning",
  conversational: "Conversational",
  fluent: "Fluent",
  none: "No safety net",
  some: "Some savings",
  strong: "Strong backup",
  opportunity: "New opportunity",
  necessity: "Necessity",
  caretaking: "Caretaking / family",
};

function formatValue(key: string, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (key === "income")
    return `$${Number(value).toLocaleString("en-US")}/yr`;
  if (key === "studentLoans")
    return value === 0
      ? "None"
      : `$${Number(value).toLocaleString("en-US")}/mo`;
  if (key === "ethnicity" || key === "communityTies") return String(value);
  return VALUE_LABELS[String(value)] ?? String(value);
}

export default function ChatPage() {
  const { city, citySlug } = useDashboard();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string, prevMessages: ChatMessage[], prevAnswers: Answers) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const next = [...prevMessages, userMsg];
      setMessages(next);
      setInputValue("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat-intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            citySlug,
            mode: "starting-out",
            answers: prevAnswers,
            messages: next,
          }),
        });

        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.assistantMessage,
        };

        setMessages([...next, assistantMsg]);
        setAnswers(data.answers ?? {});
        setComplete(Boolean(data.complete));
      } catch {
        setMessages([
          ...next,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Something went wrong. Try again.",
          },
        ]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [citySlug, loading, scrollToBottom]
  );

  useEffect(() => {
    if (sentInitial.current) return;
    sentInitial.current = true;

    if (initialPrompt) {
      sendMessage(initialPrompt, [], {});
    } else {
      setLoading(true);
      fetch("/api/chat-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citySlug,
          mode: "starting-out",
          answers: {},
          messages: [],
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages([
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: data.assistantMessage,
            },
          ]);
          setAnswers(data.answers ?? {});
        })
        .catch(() => {
          setMessages([
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: "Couldn't start the conversation. Try refreshing.",
            },
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [citySlug, initialPrompt, sendMessage]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(inputValue, messages, answers);
  }

  const filledCount = ALL_FIELD_KEYS.filter(
    (k) => answers[k] !== undefined && answers[k] !== null
  ).length;
  const progress = Math.round((filledCount / ALL_FIELD_KEYS.length) * 100);

  return (
    <div className="flex min-h-0 flex-1">
      {/* ── Left: Plan document (50%) ──────────────────────── */}
      <div className="flex w-1/2 shrink-0 flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-muted"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-nav text-ink-secondary">Moving Plan</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-caption text-ink-muted">
              {filledCount}/{ALL_FIELD_KEYS.length}
            </span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: complete
                    ? "var(--positive)"
                    : "var(--accent)",
                }}
              />
            </div>
            {complete && (
              <span className="rounded-full bg-[rgba(52,211,153,0.15)] px-2 py-0.5 text-caption text-positive">
                Complete
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* City header */}
          <div className="mb-5">
            <p className="text-caption text-ink-muted">City</p>
            <p className="text-nav text-ink mt-1">
              {city.name}, {city.state}
            </p>
          </div>

          {/* Grouped sections */}
          {PLAN_SECTIONS.map((section) => {
            const filled = section.fields.filter(
              (f) => answers[f.key] !== undefined && answers[f.key] !== null
            );
            const empty = section.fields.filter(
              (f) => answers[f.key] === undefined || answers[f.key] === null
            );

            return (
              <div key={section.title} className="mb-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-caption text-ink-muted">
                    {section.title}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {filled.length}/{section.fields.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {filled.map((field) => (
                    <div key={field.key}>
                      <p className="text-caption text-ink-muted">
                        {field.label}
                      </p>
                      <p className="text-nav text-ink mt-0.5">
                        {formatValue(field.key, answers[field.key])}
                      </p>
                    </div>
                  ))}

                  {empty.map((field) => (
                    <div key={field.key} className="opacity-30">
                      <p className="text-caption text-ink-muted">
                        {field.label}
                      </p>
                      <div className="mt-1 h-3.5 w-20 rounded bg-[rgba(255,255,255,0.06)]" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Chat thread (50%) ──────────────────────── */}
      <div className="flex w-1/2 min-w-0 flex-col">
        <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
          <span className="text-nav text-ink-secondary">
            Your conversation will appear here
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-body ${
                msg.role === "user"
                  ? "self-end bg-surface text-ink"
                  : "self-start bg-accent text-white"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="self-start rounded-2xl bg-accent px-4 py-2.5 text-body text-white">
              ...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.06)] px-5 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Chat with your prompt..."
            autoFocus
            className="flex-1 bg-transparent text-body text-ink placeholder:text-ink-muted outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
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
    </div>
  );
}
