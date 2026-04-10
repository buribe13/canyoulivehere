import type { ChatEngine, ChatMessage, Mode, UserAnswers } from "./types";

export class LocalChatEngine implements ChatEngine {
  private steps: Map<string, (step: number, answers: Partial<UserAnswers>, lastAnswer?: string) => ChatMessage | null>;

  constructor() {
    this.steps = new Map();
  }

  registerFlow(
    mode: Mode,
    flow: (step: number, answers: Partial<UserAnswers>, lastAnswer?: string) => ChatMessage | null,
    _totalSteps: number
  ) {
    this.steps.set(mode, flow);
    this.steps.set(`${mode}:total`, (() => _totalSteps) as unknown as typeof flow);
  }

  getNextMessage(
    mode: Mode,
    step: number,
    answers: Partial<UserAnswers>,
    lastAnswer?: string
  ): ChatMessage | null {
    const flow = this.steps.get(mode);
    if (!flow) return null;
    return flow(step, answers, lastAnswer);
  }

  getTotalSteps(mode: Mode): number {
    const total = this.steps.get(`${mode}:total`);
    if (!total) return 0;
    return (total as unknown as () => number)();
  }
}
