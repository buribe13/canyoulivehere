import type {
  UserFinancialProfile,
  LifestyleSnapshot,
  PositionalityProfile,
  IdentityProfile,
  LivingHistoryNode,
  LivingHistory,
  SpendingHabit,
  HousingPreference,
  FinancialBackup,
  LanguageFluency,
  MoveReason,
} from "@/lib/types";

type Answers = Record<string, unknown>;

export function answersToFinancialPatch(
  answers: Answers
): Partial<UserFinancialProfile> {
  const patch: Partial<UserFinancialProfile> = {};
  if (typeof answers.income === "number") patch.annualIncome = answers.income;
  if (typeof answers.studentLoans === "number")
    patch.monthlyDebt = answers.studentLoans;
  return patch;
}

const FOOD_TO_SPENDING: Record<string, SpendingHabit> = {
  low: "careful",
  medium: "balanced",
  high: "social",
};

const LIVING_TO_HOUSING: Record<string, HousingPreference> = {
  alone: "alone",
  roommates: "roommates",
  family: "family",
};

export function answersToLifestylePatch(
  answers: Answers
): Partial<LifestyleSnapshot> {
  const patch: Partial<LifestyleSnapshot> = {};
  if (typeof answers.food === "string" && answers.food in FOOD_TO_SPENDING)
    patch.spendingHabit = FOOD_TO_SPENDING[answers.food];
  if (typeof answers.living === "string" && answers.living in LIVING_TO_HOUSING)
    patch.housingPreference = LIVING_TO_HOUSING[answers.living];
  return patch;
}

const VALID_BACKUP: Set<string> = new Set(["none", "some", "strong"]);
const VALID_FLUENCY: Set<string> = new Set([
  "learning",
  "conversational",
  "fluent",
]);
const VALID_MOVE_REASON: Set<string> = new Set([
  "opportunity",
  "necessity",
  "caretaking",
]);

export function answersToPositionalityPatch(
  answers: Answers
): Partial<PositionalityProfile> {
  const patch: Partial<PositionalityProfile> = {};
  if (
    typeof answers.financialBackup === "string" &&
    VALID_BACKUP.has(answers.financialBackup)
  )
    patch.financialBackup = answers.financialBackup as FinancialBackup;
  if (
    typeof answers.languageFluency === "string" &&
    VALID_FLUENCY.has(answers.languageFluency)
  )
    patch.languageFluency = answers.languageFluency as LanguageFluency;
  if (
    typeof answers.moveReason === "string" &&
    VALID_MOVE_REASON.has(answers.moveReason)
  )
    patch.moveReason = answers.moveReason as MoveReason;
  return patch;
}

export function answersToIdentityPatch(
  answers: Answers
): Partial<IdentityProfile> {
  const patch: Partial<IdentityProfile> = {};
  if (typeof answers.ethnicity === "string" && answers.ethnicity.trim())
    patch.ethnicity = answers.ethnicity.trim();
  if (typeof answers.communityTies === "string" && answers.communityTies.trim())
    patch.communityTies = answers.communityTies.trim();
  return patch;
}

export function syncAnswersToProfile(
  answers: Answers,
  updaters: {
    updateFinancial: (patch: Partial<UserFinancialProfile>) => void;
    updateLifestyle: (patch: Partial<LifestyleSnapshot>) => void;
    updatePositionality: (patch: Partial<PositionalityProfile>) => void;
    updateIdentity: (patch: Partial<IdentityProfile>) => void;
  }
) {
  const fin = answersToFinancialPatch(answers);
  const life = answersToLifestylePatch(answers);
  const pos = answersToPositionalityPatch(answers);
  const id = answersToIdentityPatch(answers);
  if (Object.keys(fin).length) updaters.updateFinancial(fin);
  if (Object.keys(life).length) updaters.updateLifestyle(life);
  if (Object.keys(pos).length) updaters.updatePositionality(pos);
  if (Object.keys(id).length) updaters.updateIdentity(id);
}

export function livingHistoryToGradingContext(history: LivingHistory): string {
  if (!history.nodes.length) return "";
  const lines = history.nodes.map((n) => {
    const parts = [n.place, n.relationship];
    if (n.dateOfBirth) parts.push(`born ${n.dateOfBirth}`);
    if (n.startYear) parts.push(`from ${n.startYear}`);
    if (n.endYear) parts.push(`to ${n.endYear}`);
    if (n.historicalContext) parts.push(`(${n.historicalContext})`);
    return parts.join(" / ");
  });
  return lines.join("; ");
}

let _nodeCounter = 0;
export function createHistoryNode(
  partial: Omit<LivingHistoryNode, "id">
): LivingHistoryNode {
  return {
    ...partial,
    id: `lh-${Date.now()}-${_nodeCounter++}`,
  };
}
