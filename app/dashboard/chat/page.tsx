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
import { syncAnswersToProfile } from "@/lib/profile-mapper";
import { useRotatingPlaceholder } from "@/lib/use-rotating-placeholder";
import {
  loadBenchmarkData,
  resolvePeerBenchmark,
  buildBenchmarkNarrative,
} from "@/lib/peer-benchmarks";
import { buildMovePlanDocument } from "@/lib/move-document";
import MoveDocumentRail from "@/components/dashboard/move-document-rail";
import type {
  MovePlanMessage,
  DocumentSection,
  CityBenchmarkData,
  PeerBenchmark,
} from "@/lib/types";

type Answers = Record<string, unknown>;

const PLAN_STARTERS = [
  "Can I actually afford rent on my budget?",
  "How much should I save before moving?",
  "What does a realistic first month cost?",
  "How does my income compare to locals?",
  "What neighborhoods fit my price range?",
  "Am I financially ready for this move?",
  "What hidden costs should I plan for?",
  "How tight will my budget be month to month?",
];

const PLAN_FIELD_KEYS = [
  "ethnicity",
  "languageFluency",
  "financialBackup",
  "moveReason",
  "communityTies",
  "ageBand",
];

export default function ChatPage() {
  const {
    city,
    citySlug,
    profile,
    livingHistory,
    summary,
    movePlan,
    setMovePlanMessages,
    addMovePlanMessage,
    setMovePlanAnswers,
    setMovePlanComplete,
    setMovePlanDocumentSections,
    updateFinancial,
    updateLifestyle,
    updatePositionality,
    updateIdentity,
  } = useDashboard();

  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<CityBenchmarkData | null>(
    null
  );
  const [benchmark, setBenchmark] = useState<PeerBenchmark | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);
  const prevCityRef = useRef(citySlug);

  const placeholder = useRotatingPlaceholder(PLAN_STARTERS);

  const messages = movePlan.messages;

  useEffect(() => {
    if (prevCityRef.current !== citySlug) {
      prevCityRef.current = citySlug;
      sentInitial.current = false;
    }
  }, [citySlug]);
  const answers = movePlan.answers;
  const complete = movePlan.complete;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    loadBenchmarkData(citySlug).then((data) => {
      setBenchmarkData(data);
      if (data) {
        const bm = resolvePeerBenchmark(
          data,
          profile.financial.annualIncome,
          profile.identity.ageBand,
          profile.identity.ethnicity
        );
        setBenchmark(bm);
      }
    });
  }, [
    citySlug,
    profile.financial.annualIncome,
    profile.identity.ageBand,
    profile.identity.ethnicity,
  ]);

  useEffect(() => {
    const doc = buildMovePlanDocument({
      city,
      profile,
      livingHistory,
      summary,
      benchmark,
      benchmarkData,
      chatSections: movePlan.documentSections.filter((s) =>
        s.id.startsWith("chat-")
      ),
    });
    setMovePlanDocumentSections(doc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    city,
    profile,
    livingHistory,
    summary,
    benchmark,
    benchmarkData,
  ]);

  const buildRequestPayload = useCallback(
    (msgs: MovePlanMessage[], ans: Answers) => {
      const benchmarkContext =
        benchmark && benchmarkData
          ? buildBenchmarkNarrative(
              city.name,
              profile.financial.annualIncome,
              benchmark
            )
          : "";

      return {
        citySlug,
        mode: "starting-out" as const,
        answers: ans,
        messages: msgs,
        benchmarkContext,
        profile: {
          financial: profile.financial,
          lifestyle: profile.lifestyle,
          positionality: profile.positionality,
          identity: profile.identity,
        },
      };
    },
    [
      benchmark,
      benchmarkData,
      city.name,
      citySlug,
      profile.financial,
      profile.identity,
      profile.lifestyle,
      profile.positionality,
    ]
  );

  const sendMessage = useCallback(
    async (text: string, prevMessages: MovePlanMessage[], prevAnswers: Answers) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: MovePlanMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const next = [...prevMessages, userMsg];
      setMovePlanMessages(next);
      setInputValue("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat-intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildRequestPayload(next, prevAnswers)),
        });

        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const assistantMsgs: MovePlanMessage[] = (
          data.assistantMessages as string[]
        ).map((text, i) => ({
          id: `assistant-${Date.now()}-${i}`,
          role: "assistant" as const,
          content: text,
        }));

        setMovePlanMessages([...next, ...assistantMsgs]);
        const newAnswers = data.answers ?? {};
        setMovePlanAnswers(newAnswers);
        setMovePlanComplete(Boolean(data.complete));

        syncAnswersToProfile(newAnswers, {
          updateFinancial,
          updateLifestyle,
          updatePositionality,
          updateIdentity,
        });

        if (newAnswers.ageBand && typeof newAnswers.ageBand === "string") {
          updateIdentity({ ageBand: newAnswers.ageBand as import("@/lib/types").AgeBand });
        }

        if (data.documentSection) {
          const sec = data.documentSection as DocumentSection;
          setMovePlanDocumentSections([
            ...movePlan.documentSections.filter((s) => s.id !== sec.id),
            sec,
          ]);
        }
      } catch {
        addMovePlanMessage({
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "something went wrong, try again",
        });
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [
      addMovePlanMessage,
      buildRequestPayload,
      loading,
      movePlan.documentSections,
      scrollToBottom,
      setMovePlanAnswers,
      setMovePlanComplete,
      setMovePlanDocumentSections,
      setMovePlanMessages,
      updateFinancial,
      updateIdentity,
      updateLifestyle,
      updatePositionality,
    ]
  );

  useEffect(() => {
    if (sentInitial.current) return;
    sentInitial.current = true;

    if (messages.length > 0) return;

    setLoading(true);
    const payload = buildRequestPayload([], {});
    if (initialPrompt) {
      const userMsg: MovePlanMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: initialPrompt,
      };
      payload.messages = [userMsg];
    }

    fetch("/api/chat-intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        const msgs: MovePlanMessage[] = [];
        if (initialPrompt) {
          msgs.push({
            id: `user-init-${Date.now()}`,
            role: "user",
            content: initialPrompt,
          });
        }
        const assistantTexts = data.assistantMessages as string[];
        assistantTexts.forEach((text: string, i: number) => {
          msgs.push({
            id: `assistant-${Date.now()}-${i}`,
            role: "assistant",
            content: text,
          });
        });
        setMovePlanMessages(msgs);
        setMovePlanAnswers(data.answers ?? {});
      })
      .catch(() => {
        setMovePlanMessages([
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "couldn't start the conversation, try refreshing",
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [
    buildRequestPayload,
    initialPrompt,
    messages.length,
    setMovePlanAnswers,
    setMovePlanMessages,
  ]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(inputValue, messages, answers);
  }

  const filledCount = PLAN_FIELD_KEYS.filter(
    (k) => answers[k] !== undefined && answers[k] !== null
  ).length;
  const progress = Math.round((filledCount / PLAN_FIELD_KEYS.length) * 100);

  return (
    <div className="flex min-h-0 flex-1 print:block">
      {/* Left: Document rail (50%) */}
      <div className="flex w-1/2 shrink-0 flex-col print:w-full">
        <MoveDocumentRail
          sections={movePlan.documentSections}
          cityLabel={`${city.name}, ${city.state}`}
          progress={progress}
          complete={complete}
        />
      </div>

      {/* Right: Chat thread (50%) */}
      <div className="flex w-1/2 min-w-0 flex-col print:hidden">
        <div className="flex items-center px-5 py-4">
          <span className="text-nav text-ink-secondary">
            Plan your move
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4"
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

        <div className="px-3 pb-3 pt-1">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-3xl bg-bg px-4 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
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
    </div>
  );
}
