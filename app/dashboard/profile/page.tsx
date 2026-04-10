"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type FormEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { syncAnswersToProfile, createHistoryNode } from "@/lib/profile-mapper";
import { useRotatingPlaceholder } from "@/lib/use-rotating-placeholder";
import type {
  LivingHistoryNode,
  PlaceRelationship,
  SpendingHabit,
  HousingPreference,
  WorkStyle,
  FinancialBackup,
  LanguageFluency,
  MoveReason,
} from "@/lib/types";

/* ── Constants ─────────────────────────────────────────── */

const RELATIONSHIP_LABELS: Record<PlaceRelationship, string> = {
  origin: "Origin",
  born: "Born",
  raised: "Raised",
  "moved-to": "Moved to",
  "family-root": "Family root",
  studied: "Studied",
  worked: "Worked",
};

const RELATIONSHIP_OPTIONS: { value: PlaceRelationship; label: string }[] = [
  { value: "born", label: "Born" },
  { value: "raised", label: "Raised" },
  { value: "family-root", label: "Family root" },
  { value: "origin", label: "Origin" },
  { value: "moved-to", label: "Moved to" },
  { value: "studied", label: "Studied" },
  { value: "worked", label: "Worked" },
];

const SPENDING_OPTIONS: { value: SpendingHabit; label: string }[] = [
  { value: "careful", label: "Careful" },
  { value: "balanced", label: "Balanced" },
  { value: "social", label: "Social" },
];

const HOUSING_OPTIONS: { value: HousingPreference; label: string }[] = [
  { value: "roommates", label: "Roommates" },
  { value: "alone", label: "Solo" },
  { value: "family", label: "Family" },
];

const WORK_OPTIONS: { value: WorkStyle; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "in-person", label: "In person" },
];

const BACKUP_OPTIONS: { value: FinancialBackup; label: string }[] = [
  { value: "none", label: "None" },
  { value: "some", label: "Some" },
  { value: "strong", label: "Strong" },
];

const FLUENCY_OPTIONS: { value: LanguageFluency; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
];

const MOVE_OPTIONS: { value: MoveReason; label: string }[] = [
  { value: "opportunity", label: "Opportunity" },
  { value: "necessity", label: "Necessity" },
  { value: "caretaking", label: "Caretaking" },
];

/* ── Editable number field ─────────────────────────────── */

function EditableNumber({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, value]);

  function commit() {
    const n = Number(draft.replace(/[^0-9.-]/g, ""));
    if (!isNaN(n) && n >= 0) onChange(n);
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        <p className="text-[12px] leading-[20px] text-ink-muted">{label}</p>
        <div className="mt-0.5 flex items-center gap-1">
          {prefix && (
            <span className="text-[13px] text-ink-muted">{prefix}</span>
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[14px] leading-[22px] font-medium text-ink outline-none"
          />
          {suffix && (
            <span className="text-[13px] text-ink-muted">{suffix}</span>
          )}
        </div>
      </div>
    );
  }

  const display = `${prefix ?? ""}${Number(value).toLocaleString("en-US")}${suffix ?? ""}`;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full text-left group"
    >
      <p className="text-[12px] leading-[20px] text-ink-muted">{label}</p>
      <p className="text-[14px] leading-[22px] font-medium text-ink mt-0.5 transition-[color] duration-150 group-hover:text-accent">
        {display}
      </p>
    </button>
  );
}

/* ── Editable text field ──────────────────────────────── */

function EditableText({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, value]);

  function commit() {
    onChange(draft.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        <p className="text-[12px] leading-[20px] text-ink-muted">{label}</p>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder={placeholder}
          className="mt-0.5 w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[14px] leading-[22px] font-medium text-ink outline-none placeholder:text-ink-muted/40"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full text-left group"
    >
      <p className="text-[12px] leading-[20px] text-ink-muted">{label}</p>
      <p className="text-[14px] leading-[22px] font-medium text-ink mt-0.5 transition-[color] duration-150 group-hover:text-accent">
        {value || <span className="text-ink-muted/40">{placeholder}</span>}
      </p>
    </button>
  );
}

/* ── Segmented picker ──────────────────────────────────── */

function SegmentedPicker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-[12px] leading-[20px] text-ink-muted mb-1.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-lg px-2 py-1 text-[12px] leading-[20px] transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] ${
                active
                  ? "bg-[rgba(255,255,255,0.1)] text-ink"
                  : "bg-[rgba(255,255,255,0.03)] text-ink-muted hover:bg-[rgba(255,255,255,0.06)] hover:text-ink-secondary"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Apple Maps-style stop builder ─────────────────────── */

function StopRow({
  node,
  index,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  node: LivingHistoryNode;
  index: number;
  isLast: boolean;
  onUpdate: (id: string, patch: Partial<LivingHistoryNode>) => void;
  onRemove: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingPlace, setEditingPlace] = useState(false);
  const [placeDraft, setPlaceDraft] = useState(node.place);
  const placeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPlace) {
      setPlaceDraft(node.place);
      requestAnimationFrame(() => placeRef.current?.select());
    }
  }, [editingPlace, node.place]);

  function commitPlace() {
    const trimmed = placeDraft.trim();
    if (trimmed && trimmed !== node.place) {
      onUpdate(node.id, { place: trimmed });
    }
    setEditingPlace(false);
  }

  const dateLabel = [
    node.startYear && `${node.startYear}`,
    node.endYear ? `${node.endYear}` : node.startYear ? "present" : null,
  ]
    .filter(Boolean)
    .join("–");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0, delay: index * 0.04 }}
    >
      {/* Row */}
      <div className="group flex items-center gap-3 px-3.5 py-2">
        {/* Marker dot */}
        <div className="flex flex-col items-center gap-0">
          <div className="size-[10px] rounded-full bg-accent" />
        </div>

        {/* Place name — click to edit */}
        <div className="min-w-0 flex-1">
          {editingPlace ? (
            <input
              ref={placeRef}
              type="text"
              value={placeDraft}
              onChange={(e) => setPlaceDraft(e.target.value)}
              onBlur={commitPlace}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPlace();
                if (e.key === "Escape") setEditingPlace(false);
              }}
              className="w-full rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[14px] leading-[22px] font-medium text-ink outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingPlace(true)}
              className="w-full text-left"
            >
              <p className="text-[14px] leading-[22px] font-medium text-ink truncate">
                {node.place}
              </p>
              <p className="text-[11px] leading-[15px] text-ink-muted mt-0">
                {RELATIONSHIP_LABELS[node.relationship]}
                {dateLabel && ` · ${dateLabel}`}
              </p>
            </button>
          )}
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity duration-150 group-hover:opacity-60 hover:!opacity-100"
        >
          <motion.svg
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0 }}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-muted"
          >
            <polyline points="9 18 15 12 9 6" />
          </motion.svg>
        </button>

        {/* Reorder handle */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="flex size-4 items-center justify-center rounded opacity-0 transition-opacity duration-150 group-hover:opacity-50 hover:!opacity-100 disabled:!opacity-20"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="flex size-4 items-center justify-center rounded opacity-0 transition-opacity duration-150 group-hover:opacity-50 hover:!opacity-100 disabled:!opacity-20"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-3.5 pb-3 pl-[38px]">
              <SegmentedPicker
                label="Relationship"
                value={node.relationship}
                options={RELATIONSHIP_OPTIONS}
                onChange={(v) => onUpdate(node.id, { relationship: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <EditableNumber
                  label="Start year"
                  value={node.startYear ?? 0}
                  onChange={(v) =>
                    onUpdate(node.id, { startYear: v || undefined })
                  }
                />
                <EditableNumber
                  label="End year"
                  value={node.endYear ?? 0}
                  onChange={(v) =>
                    onUpdate(node.id, {
                      endYear: v || null,
                    })
                  }
                />
              </div>
              <div>
                <p className="text-[12px] leading-[20px] text-ink-muted mb-1">
                  Historical context
                </p>
                <textarea
                  value={node.historicalContext ?? ""}
                  onChange={(e) =>
                    onUpdate(node.id, {
                      historicalContext: e.target.value || undefined,
                    })
                  }
                  placeholder="Why this place matters..."
                  rows={2}
                  className="w-full resize-none rounded-lg bg-[rgba(255,255,255,0.04)] px-2.5 py-1.5 text-[13px] leading-[17px] text-ink placeholder:text-ink-muted outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(node.id)}
                className="self-start text-[12px] leading-[20px] text-negative opacity-60 transition-opacity duration-150 hover:opacity-100"
              >
                Remove stop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical connector line */}
      {!isLast && (
        <div className="flex items-stretch px-3.5">
          <div className="ml-[3.5px] w-[3px] rounded-full bg-[rgba(255,255,255,0.08)]" style={{ minHeight: 16 }} />
        </div>
      )}
    </motion.div>
  );
}

function AddStopRow({
  onAdd,
}: {
  onAdd: (place: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) requestAnimationFrame(() => inputRef.current?.focus());
  }, [adding]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) {
      onAdd(trimmed);
      setDraft("");
      setAdding(false);
    } else {
      setAdding(false);
    }
  }

  if (adding) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2">
        <div className="size-[10px] rounded-full bg-accent opacity-40" />
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (!draft.trim()) setAdding(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setAdding(false);
          }}
          placeholder="Place name..."
          className="flex-1 bg-transparent text-[14px] leading-[22px] text-ink placeholder:text-ink-muted outline-none"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAdding(true)}
      className="flex w-full items-center gap-3 px-3.5 py-2 transition-[opacity] duration-150 hover:opacity-80"
    >
      <div className="flex size-5 items-center justify-center rounded-full bg-accent">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <span className="text-[14px] leading-[22px] text-accent">
        Add stop
      </span>
    </button>
  );
}

function LivingHistoryBuilder({
  nodes,
  onUpdate,
  onRemove,
  onAdd,
  onReorder,
}: {
  nodes: LivingHistoryNode[];
  onUpdate: (id: string, patch: Partial<LivingHistoryNode>) => void;
  onRemove: (id: string) => void;
  onAdd: (node: LivingHistoryNode) => void;
  onReorder: (from: number, to: number) => void;
}) {
  return (
    <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] overflow-hidden py-2.5">
      <AnimatePresence initial={false} mode="popLayout">
        {nodes.map((node, i) => (
          <StopRow
            key={node.id}
            node={node}
            index={i}
            isLast={i === nodes.length - 1}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onMoveUp={() => onReorder(i, i - 1)}
            onMoveDown={() => onReorder(i, i + 1)}
            canMoveUp={i > 0}
            canMoveDown={i < nodes.length - 1}
          />
        ))}
      </AnimatePresence>

      {/* Connector before add button */}
      {nodes.length > 0 && (
        <div className="flex items-stretch px-3.5">
          <div className="ml-[3.5px] w-[3px] rounded-full bg-[rgba(255,255,255,0.08)]" style={{ minHeight: 12 }} />
        </div>
      )}

      <AddStopRow
        onAdd={(place) =>
          onAdd(
            createHistoryNode({
              place,
              relationship: "moved-to",
            })
          )
        }
      />
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */

const PROFILE_STARTERS = [
  "Where did you grow up?",
  "Tell me about your family roots",
  "What's your current living situation?",
  "Where have you lived before?",
  "What do you do for work?",
  "Any places that shaped who you are?",
  "What communities are you part of?",
  "What languages do you speak?",
];

export default function ProfilePage() {
  const {
    city,
    citySlug,
    profile,
    livingHistory,
    profileChat,
    updateFinancial,
    updateLifestyle,
    updatePositionality,
    updateIdentity,
    addHistoryNode,
    updateHistoryNode,
    removeHistoryNode,
    reorderHistoryNodes,
    setProfileChat,
    addProfileChatMessage,
  } = useDashboard();

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const prevCityRef = useRef(citySlug);
  const placeholder = useRotatingPlaceholder(PROFILE_STARTERS);
  const messages = profileChat.messages;

  useEffect(() => {
    if (prevCityRef.current !== citySlug) {
      prevCityRef.current = citySlug;
      sentInitial.current = false;
    }
  }, [citySlug]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: trimmed,
      };

      addProfileChatMessage(userMsg);
      setInputValue("");
      setLoading(true);

      const allMessages = [...messages, userMsg];

      try {
        const res = await fetch("/api/profile-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            citySlug,
            messages: allMessages,
            currentAnswers: {
              income: profile.financial.annualIncome,
              living: profile.lifestyle.housingPreference,
              food:
                profile.lifestyle.spendingHabit === "careful"
                  ? "low"
                  : profile.lifestyle.spendingHabit === "social"
                    ? "high"
                    : "medium",
              financialBackup: profile.positionality.financialBackup,
              languageFluency: profile.positionality.languageFluency,
              moveReason: profile.positionality.moveReason,
              ethnicity: profile.identity.ethnicity,
              communityTies: profile.identity.communityTies,
            },
            existingNodes: livingHistory.nodes.map((n) => ({
              place: n.place,
              relationship: n.relationship,
            })),
          }),
        });

        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        const assistantTexts = data.assistantMessages as string[];
        const assistantMsgs = assistantTexts.map(
          (text: string, i: number) => ({
            id: `assistant-${Date.now()}-${i}`,
            role: "assistant" as const,
            content: text,
          })
        );

        for (const msg of assistantMsgs) {
          addProfileChatMessage(msg);
        }

        if (data.extractedProfile) {
          syncAnswersToProfile(data.extractedProfile, {
            updateFinancial,
            updateLifestyle,
            updatePositionality,
            updateIdentity,
          });
        }

        if (data.extractedHistoryNodes?.length) {
          for (const raw of data.extractedHistoryNodes) {
            if (!raw.place) continue;
            const exists = livingHistory.nodes.some(
              (n) =>
                n.place.toLowerCase() === raw.place.toLowerCase() &&
                n.relationship === raw.relationship
            );
            if (!exists) {
              addHistoryNode(
                createHistoryNode({
                  place: raw.place,
                  relationship: raw.relationship,
                  dateOfBirth: raw.dateOfBirth ?? undefined,
                  startYear: raw.startYear ?? undefined,
                  endYear: raw.endYear,
                  historicalContext: raw.historicalContext ?? undefined,
                  parentId: raw.parentId,
                })
              );
            }
          }
        }

        if (data.extractedConcerns?.length) {
          setProfileChat({
            ...profileChat,
            messages: [...allMessages, ...assistantMsgs],
            concerns: [
              ...new Set([
                ...profileChat.concerns,
                ...data.extractedConcerns,
              ]),
            ],
          });
        }
      } catch {
        addProfileChatMessage({
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
      addHistoryNode,
      addProfileChatMessage,
      citySlug,
      livingHistory.nodes,
      loading,
      messages,
      profile,
      profileChat,
      scrollToBottom,
      setProfileChat,
      updateFinancial,
      updateIdentity,
      updateLifestyle,
      updatePositionality,
    ]
  );

  useEffect(() => {
    if (sentInitial.current || messages.length > 0) return;
    sentInitial.current = true;

    setLoading(true);
    fetch("/api/profile-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citySlug,
        messages: [],
        currentAnswers: {
          income: profile.financial.annualIncome,
          savings: profile.financial.savings,
          monthlyDebt: profile.financial.monthlyDebt,
          living: profile.lifestyle.housingPreference,
          currentMonthlyCost: profile.lifestyle.currentMonthlyCost,
          spendingHabit: profile.lifestyle.spendingHabit,
          workStyle: profile.lifestyle.workStyle,
          food:
            profile.lifestyle.spendingHabit === "careful"
              ? "low"
              : profile.lifestyle.spendingHabit === "social"
                ? "high"
                : "medium",
          financialBackup: profile.positionality.financialBackup,
          languageFluency: profile.positionality.languageFluency,
          moveReason: profile.positionality.moveReason,
          ethnicity: profile.identity.ethnicity,
          communityTies: profile.identity.communityTies,
        },
        existingNodes: livingHistory.nodes.map((n) => ({
          place: n.place,
          relationship: n.relationship,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const texts = data.assistantMessages as string[];
        texts.forEach((text: string, i: number) => {
          addProfileChatMessage({
            id: `assistant-${Date.now()}-${i}`,
            role: "assistant",
            content: text,
          });
        });
      })
      .catch(() => {
        addProfileChatMessage({
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "couldn't start the conversation, try refreshing",
        });
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addProfileChatMessage, citySlug, messages.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(inputValue);
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* ── Left: Editable profile + Living history ──────── */}
      <div className="flex w-1/2 shrink-0 flex-col bg-[rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <img
            src="/images/ben-uribe.png"
            alt="Ben Uribe"
            className="size-6 rounded-full object-cover"
          />
          <span className="text-[13px] leading-[17px] font-medium text-ink-secondary">
            Ben Uribe
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* City */}
          <div className="mb-10">
            <p className="text-[12px] leading-[20px] text-ink-muted">City</p>
            <h1 className="text-heading text-ink mt-0.5">
              {city.name}, {city.state}
            </h1>
          </div>

          {/* Living History */}
          <div className="mb-10">
            <p className="text-[13px] leading-[17px] text-ink-muted mb-2">
              Living history
            </p>
            <LivingHistoryBuilder
              nodes={livingHistory.nodes}
              onUpdate={updateHistoryNode}
              onRemove={removeHistoryNode}
              onAdd={addHistoryNode}
              onReorder={reorderHistoryNodes}
            />
          </div>

          {/* Financial */}
          <div className="mb-10">
            <p className="text-[13px] leading-[17px] text-ink-muted mb-2">
              Financial
            </p>
            <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <EditableNumber
                  label="Annual income"
                  value={profile.financial.annualIncome}
                  prefix="$"
                  onChange={(v) => updateFinancial({ annualIncome: v })}
                />
                <EditableNumber
                  label="Savings"
                  value={profile.financial.savings}
                  prefix="$"
                  onChange={(v) => updateFinancial({ savings: v })}
                />
                <EditableNumber
                  label="Monthly debt"
                  value={profile.financial.monthlyDebt}
                  prefix="$"
                  suffix="/mo"
                  onChange={(v) => updateFinancial({ monthlyDebt: v })}
                />
                <EditableNumber
                  label="Monthly cost"
                  value={profile.lifestyle.currentMonthlyCost}
                  prefix="$"
                  suffix="/mo"
                  onChange={(v) =>
                    updateLifestyle({ currentMonthlyCost: v })
                  }
                />
              </div>
            </div>
          </div>

          {/* Lifestyle + Positionality side by side */}
          <div className="mb-10 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] leading-[17px] text-ink-muted mb-2">
                Lifestyle
              </p>
              <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4 flex flex-col gap-3">
                <SegmentedPicker
                  label="Spending"
                  value={profile.lifestyle.spendingHabit}
                  options={SPENDING_OPTIONS}
                  onChange={(v) => updateLifestyle({ spendingHabit: v })}
                />
                <SegmentedPicker
                  label="Housing"
                  value={profile.lifestyle.housingPreference}
                  options={HOUSING_OPTIONS}
                  onChange={(v) => updateLifestyle({ housingPreference: v })}
                />
                <SegmentedPicker
                  label="Work style"
                  value={profile.lifestyle.workStyle}
                  options={WORK_OPTIONS}
                  onChange={(v) => updateLifestyle({ workStyle: v })}
                />
              </div>
            </div>
            <div>
              <p className="text-[13px] leading-[17px] text-ink-muted mb-2">
                Positionality
              </p>
              <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4 flex flex-col gap-3">
                <SegmentedPicker
                  label="Safety net"
                  value={profile.positionality.financialBackup}
                  options={BACKUP_OPTIONS}
                  onChange={(v) =>
                    updatePositionality({ financialBackup: v })
                  }
                />
                <SegmentedPicker
                  label="Language"
                  value={profile.positionality.languageFluency}
                  options={FLUENCY_OPTIONS}
                  onChange={(v) =>
                    updatePositionality({ languageFluency: v })
                  }
                />
                <SegmentedPicker
                  label="Moving for"
                  value={profile.positionality.moveReason}
                  options={MOVE_OPTIONS}
                  onChange={(v) => updatePositionality({ moveReason: v })}
                />
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="mb-10">
            <p className="text-[13px] leading-[17px] text-ink-muted mb-2">
              Identity
            </p>
            <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4 flex flex-col gap-3">
              <EditableText
                label="Ethnicity / race"
                value={profile.identity.ethnicity}
                placeholder="e.g. Mexican-American, Black, Korean"
                onChange={(v) => updateIdentity({ ethnicity: v })}
              />
              <EditableText
                label="Community ties"
                value={profile.identity.communityTies}
                placeholder="e.g. Latin community, diaspora networks"
                onChange={(v) => updateIdentity({ communityTies: v })}
              />
            </div>
          </div>

          {/* Concerns */}
          {profileChat.concerns.length > 0 && (
            <div className="mb-10">
              <p className="text-[13px] leading-[17px] text-ink-muted mb-2">
                Your concerns
              </p>
              <div className="rounded-3xl bg-[rgba(255,255,255,0.04)] p-4 flex flex-wrap gap-1.5">
                {profileChat.concerns.map((concern) => (
                  <span
                    key={concern}
                    className="rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-1 text-[12px] leading-[20px] text-ink-secondary"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Chat thread (assistive) ───────────────── */}
      <div className="flex w-1/2 min-w-0 flex-col">
        <div className="flex items-center px-5 py-4">
          <span className="text-nav text-ink-secondary">
            Chat assistant
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                duration: 0.35,
                bounce: 0,
                delay: i === messages.length - 1 ? 0.05 : 0,
              }}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-body ${
                msg.role === "user"
                  ? "self-end bg-surface text-ink"
                  : "self-start bg-accent text-white"
              }`}
            >
              {msg.content}
            </motion.div>
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
