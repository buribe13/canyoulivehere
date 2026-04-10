/* ── Mode ──────────────────────────────────────────────── */
export type Mode = "starting-out" | "making-change";

/* ── City ──────────────────────────────────────────────── */
export interface City {
  name: string;
  slug: string;
  tagline: string;
  coords: [lng: number, lat: number];
  accent: string;
  available: boolean;
}

/* ── Cost data (loaded from JSON per city) ─────────────── */
export interface CityRentData {
  alone: number;
  roommates: number;
  family: number;
}

export interface CityTransportData {
  car: number;
  transit: number;
  hybrid: number;
}

export interface CityFoodData {
  low: number;
  medium: number;
  high: number;
}

export interface CityLifestyleData {
  minimal: number;
  balanced: number;
  social: number;
  premium: number;
}

export interface CityCostData {
  rent: CityRentData;
  transport: CityTransportData;
  food: CityFoodData;
  lifestyle: CityLifestyleData;
  studentLoanAvg: number;
}

/* ── User answers from chat ────────────────────────────── */
export interface UserAnswers {
  income: number;
  living: keyof CityRentData;
  transport: keyof CityTransportData;
  food: keyof CityFoodData;
  lifestyle: keyof CityLifestyleData;
  studentLoans?: number;
  priority?: "neighborhood" | "commute" | "cost";
}

/* ── Cost result ───────────────────────────────────────── */
export interface CostResult {
  rent: number;
  transport: number;
  food: number;
  lifestyle: number;
  studentLoans: number;
  monthlyCost: number;
  comfortableMonthlyCost: number;
  recommendedSalary: number;
  realityGap: number;
  disposableIncome?: number;
  monthsToEmergencyFund?: number;
}

/* ── Chat ──────────────────────────────────────────────── */
export type MessageRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  options?: ChatOption[];
  inputType?: "number";
  step?: number;
  totalSteps?: number;
}

export interface ChatOption {
  label: string;
  value: string;
}

export interface ChatEngine {
  getNextMessage(
    mode: Mode,
    step: number,
    answers: Partial<UserAnswers>,
    lastAnswer?: string
  ): ChatMessage | null;
  getTotalSteps(mode: Mode): number;
}

/* ── Culture ───────────────────────────────────────────── */
export interface CultureCard {
  name: string;
  tag: string;
  story: string;
  link?: string;
}

/* ── Contribution ──────────────────────────────────────── */
export interface ContributionItem {
  id: string;
  title: string;
  description: string;
}
