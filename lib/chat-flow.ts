import { LocalChatEngine } from "./chat-engine";
import type { ChatMessage, UserAnswers } from "./types";

let _id = 0;
function msgId() {
  return `msg-${++_id}`;
}

function msg(
  content: string,
  opts?: Partial<ChatMessage>
): ChatMessage {
  return {
    id: msgId(),
    role: "assistant",
    content,
    ...opts,
  };
}

/* ── Starting Out flow (6 steps) ──────────────────────── */
function startingOutFlow(
  step: number,
  _answers: Partial<UserAnswers>,
  _lastAnswer?: string
): ChatMessage | null {
  const total = 6;
  switch (step) {
    case 0:
      return msg(
        "Let's figure out if you can actually live here. First — what's your annual income (or expected income)?",
        { inputType: "number", step: 1, totalSteps: total }
      );
    case 1:
      return msg("What's your living situation going to look like?", {
        options: [
          { label: "Living alone", value: "alone" },
          { label: "With roommates", value: "roommates" },
        ],
        step: 2,
        totalSteps: total,
      });
    case 2:
      return msg("How are you getting around?", {
        options: [
          { label: "Car", value: "car" },
          { label: "Public transit", value: "transit" },
          { label: "Mix of both", value: "hybrid" },
        ],
        step: 3,
        totalSteps: total,
      });
    case 3:
      return msg("How much are you spending on food?", {
        options: [
          { label: "Cooking mostly", value: "low" },
          { label: "Balanced", value: "medium" },
          { label: "Eating out often", value: "high" },
        ],
        step: 4,
        totalSteps: total,
      });
    case 4:
      return msg("Do you have student loans? If so, what's your monthly payment?", {
        inputType: "number",
        step: 5,
        totalSteps: total,
      });
    case 5:
      return msg("Finally — what kind of lifestyle are you going for?", {
        options: [
          { label: "Minimal", value: "minimal" },
          { label: "Balanced", value: "balanced" },
          { label: "Social", value: "social" },
          { label: "Premium", value: "premium" },
        ],
        step: 6,
        totalSteps: total,
      });
    default:
      return null;
  }
}

/* ── Making a Change flow (6 steps) ───────────────────── */
function makingChangeFlow(
  step: number,
  _answers: Partial<UserAnswers>,
  _lastAnswer?: string
): ChatMessage | null {
  const total = 6;
  switch (step) {
    case 0:
      return msg(
        "Let's see if this city works for your next chapter. What's your current annual income?",
        { inputType: "number", step: 1, totalSteps: total }
      );
    case 1:
      return msg("What's your housing situation?", {
        options: [
          { label: "Living alone", value: "alone" },
          { label: "With roommates", value: "roommates" },
          { label: "With family", value: "family" },
        ],
        step: 2,
        totalSteps: total,
      });
    case 2:
      return msg("How will you be commuting?", {
        options: [
          { label: "Car", value: "car" },
          { label: "Public transit", value: "transit" },
          { label: "Mix of both", value: "hybrid" },
        ],
        step: 3,
        totalSteps: total,
      });
    case 3:
      return msg("What does your food budget look like?", {
        options: [
          { label: "Cooking mostly", value: "low" },
          { label: "Balanced", value: "medium" },
          { label: "Eating out often", value: "high" },
        ],
        step: 4,
        totalSteps: total,
      });
    case 4:
      return msg("What's most important to you in a new city?", {
        options: [
          { label: "Neighborhood quality", value: "neighborhood" },
          { label: "Short commute", value: "commute" },
          { label: "Lower cost", value: "cost" },
        ],
        step: 5,
        totalSteps: total,
      });
    case 5:
      return msg("What kind of lifestyle are you aiming for?", {
        options: [
          { label: "Minimal", value: "minimal" },
          { label: "Balanced", value: "balanced" },
          { label: "Premium", value: "premium" },
        ],
        step: 6,
        totalSteps: total,
      });
    default:
      return null;
  }
}

/* ── Build engine ──────────────────────────────────────── */
export function createChatEngine(): LocalChatEngine {
  const engine = new LocalChatEngine();
  engine.registerFlow("starting-out", startingOutFlow, 6);
  engine.registerFlow("making-change", makingChangeFlow, 6);
  return engine;
}
