/* ── Mode ──────────────────────────────────────────────── */
export type Mode = "starting-out" | "making-change";
export type DashboardSection =
  | "overview"
  | "financial"
  | "neighborhoods"
  | "displacement"
  | "conscious-move"
  | "resources";

export interface MapViewPreset {
  center: [lng: number, lat: number];
  zoom: number;
  bearing?: number;
  pitch?: number;
}

/* ── City ──────────────────────────────────────────────── */
export interface City {
  name: string;
  shortName: string;
  slug: string;
  state: string;
  tagline: string;
  coords: [lng: number, lat: number];
  accent: string;
  available: boolean;
  statusLabel: string;
  statusTone: "neutral" | "info";
  mapView: MapViewPreset;
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
  ethnicity?: string;
  languageFluency?: LanguageFluency;
  financialBackup?: FinancialBackup;
  moveReason?: MoveReason;
  communityTies?: string;
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

/* ── Dashboard profile ─────────────────────────────────── */
export interface UserFinancialProfile {
  annualIncome: number;
  savings: number;
  monthlyDebt: number;
}

export type SpendingHabit = "careful" | "balanced" | "social";
export type HousingPreference = keyof CityRentData;
export type WorkStyle = "remote" | "hybrid" | "in-person";

export interface LifestyleSnapshot {
  currentMonthlyCost: number;
  spendingHabit: SpendingHabit;
  housingPreference: HousingPreference;
  workStyle: WorkStyle;
}

export type FinancialBackup = "none" | "some" | "strong";
export type LanguageFluency = "learning" | "conversational" | "fluent";
export type MoveReason = "opportunity" | "necessity" | "caretaking";

export interface PositionalityProfile {
  financialBackup: FinancialBackup;
  languageFluency: LanguageFluency;
  moveReason: MoveReason;
}

export interface DashboardProfile {
  financial: UserFinancialProfile;
  lifestyle: LifestyleSnapshot;
  positionality: PositionalityProfile;
}

export interface DashboardSession {
  email: string;
  signedInAt: string;
}

/* ── Dashboard content ─────────────────────────────────── */
export interface CityFinancialAssumptions {
  effectiveTaxRate: number;
  depositMonths: number;
  movingCost: number;
  landingBuffer: number;
  rentBurdenTarget: number;
}

export interface CityDossier {
  citySlug: string;
  overview: string;
  historicalContext: string;
  languageAccess: string;
  financialAssumptions: CityFinancialAssumptions;
  neighborhoods: NeighborhoodContextCard[];
  timeline: DisplacementTimelineEvent[];
  tenantProtections: string[];
  resources: ResourceItem[];
}

export interface MetricItem {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "caution";
  detail?: string;
}

export interface FinancialReadinessSummary {
  title: string;
  narrative: string;
  lifestyleTranslation: string;
  taxNote: string;
  metrics: MetricItem[];
  firstMonthCosts: MetricItem[];
}

export interface NeighborhoodContextCard {
  name: string;
  pressure: "Low" | "Medium" | "High";
  narrative: string;
  languages: string[];
  anchors: string[];
}

export interface CulturalNeighborhoodSummary {
  title: string;
  narrative: string;
  historicalContext: string;
  languageAccess: string;
  neighborhoods: NeighborhoodContextCard[];
}

export interface DisplacementTimelineEvent {
  year: string;
  title: string;
  detail: string;
}

export interface DisplacementSummary {
  title: string;
  narrative: string;
  timeline: DisplacementTimelineEvent[];
  tenantProtections: string[];
}

export interface ResourceItem {
  title: string;
  description: string;
  category: "tenant-rights" | "community" | "mutual-aid" | "forum";
  href?: string;
}

export interface ResourcesSummary {
  title: string;
  narrative: string;
  items: ResourceItem[];
}

export interface ConsciousMoveSummary {
  title: string;
  score: number;
  label: string;
  oneLiner: string;
  narrative: string;
  drivers: string[];
  prompts: string[];
}

export interface CityDashboardSummary {
  citySlug: string;
  cityName: string;
  generatedAt: string;
  financial: FinancialReadinessSummary;
  cultural: CulturalNeighborhoodSummary;
  displacement: DisplacementSummary;
  resources: ResourcesSummary;
  consciousMove: ConsciousMoveSummary;
}

/* ── Chat ──────────────────────────────────────────────── */
export type MessageRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  options?: ChatOption[];
  inputType?: "number" | "text";
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
