import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCityBySlug } from "@/lib/cities";
import type { ChatMessage, Mode } from "@/lib/types";

const fluencyValues = ["learning", "conversational", "fluent"] as const;
const backupValues = ["none", "some", "strong"] as const;
const moveReasonValues = ["opportunity", "necessity", "caretaking"] as const;
const ageBandValues = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;

const extractedAnswersSchema = z.object({
  ethnicity: z.string().nullable(),
  languageFluency: z.enum(fluencyValues).nullable(),
  financialBackup: z.enum(backupValues).nullable(),
  moveReason: z.enum(moveReasonValues).nullable(),
  communityTies: z.string().nullable(),
  ageBand: z.enum(ageBandValues).nullable(),
});

const documentSectionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    tone: z.enum(["neutral", "positive", "caution"]).nullable(),
  })
  .nullable();

const chatTurnSchema = z.object({
  assistantMessages: z
    .array(z.string().max(200))
    .min(1)
    .max(3)
    .describe(
      "1-3 short chat bubbles (each ≤200 chars). split thoughts across bubbles instead of writing paragraphs."
    ),
  extractedAnswers: extractedAnswersSchema,
  documentSection: documentSectionSchema,
});

type FieldKey =
  | "ethnicity"
  | "languageFluency"
  | "financialBackup"
  | "moveReason"
  | "communityTies"
  | "ageBand";

interface ProfilePayload {
  financial?: {
    annualIncome?: number;
    savings?: number;
    monthlyDebt?: number;
  };
  lifestyle?: {
    currentMonthlyCost?: number;
    spendingHabit?: string;
    housingPreference?: string;
    workStyle?: string;
  };
  positionality?: {
    financialBackup?: string;
    languageFluency?: string;
    moveReason?: string;
  };
  identity?: {
    ethnicity?: string;
    communityTies?: string;
    ageBand?: string;
  };
}

interface ChatTurnRequestBody {
  citySlug?: string;
  mode?: Mode;
  answers?: Record<string, unknown>;
  messages?: ChatMessage[];
  benchmarkContext?: string;
  profile?: ProfilePayload;
}

const CONTEXT_FIELDS: FieldKey[] = [
  "ageBand",
  "ethnicity",
  "languageFluency",
  "financialBackup",
  "moveReason",
  "communityTies",
];

function seedAnswersFromProfile(
  profile: ProfilePayload,
  current: Record<string, unknown>
): Record<string, unknown> {
  const seeded = { ...current };

  if (profile.positionality?.financialBackup && !seeded.financialBackup) {
    seeded.financialBackup = profile.positionality.financialBackup;
  }
  if (profile.positionality?.languageFluency && !seeded.languageFluency) {
    seeded.languageFluency = profile.positionality.languageFluency;
  }
  if (profile.positionality?.moveReason && !seeded.moveReason) {
    seeded.moveReason = profile.positionality.moveReason;
  }
  if (profile.identity?.ethnicity && !seeded.ethnicity) {
    seeded.ethnicity = profile.identity.ethnicity;
  }
  if (profile.identity?.communityTies && !seeded.communityTies) {
    seeded.communityTies = profile.identity.communityTies;
  }
  if (profile.identity?.ageBand && !seeded.ageBand) {
    seeded.ageBand = profile.identity.ageBand;
  }
  return seeded;
}

function getMissingFields(answers: Record<string, unknown>): FieldKey[] {
  return CONTEXT_FIELDS.filter((field) => {
    const value = answers[field];
    return value === undefined || value === null || value === "";
  });
}

function getOptionsForField(field: FieldKey | undefined) {
  switch (field) {
    case "languageFluency":
      return [
        { label: "Learning", value: "learning" },
        { label: "Conversational", value: "conversational" },
        { label: "Fluent", value: "fluent" },
      ];
    case "financialBackup":
      return [
        { label: "No safety net", value: "none" },
        { label: "Some savings", value: "some" },
        { label: "Strong backup", value: "strong" },
      ];
    case "moveReason":
      return [
        { label: "New opportunity", value: "opportunity" },
        { label: "Necessity", value: "necessity" },
        { label: "Caretaking / family", value: "caretaking" },
      ];
    case "ageBand":
      return [
        { label: "18-24", value: "18-24" },
        { label: "25-34", value: "25-34" },
        { label: "35-44", value: "35-44" },
        { label: "45-54", value: "45-54" },
        { label: "55+", value: "55+" },
      ];
    default:
      return undefined;
  }
}

function mergeAnswers(
  current: Record<string, unknown>,
  extracted: z.infer<typeof extractedAnswersSchema>
): Record<string, unknown> {
  const next = { ...current };
  if (extracted.ethnicity !== null) next.ethnicity = extracted.ethnicity;
  if (extracted.languageFluency !== null)
    next.languageFluency = extracted.languageFluency;
  if (extracted.financialBackup !== null)
    next.financialBackup = extracted.financialBackup;
  if (extracted.moveReason !== null) next.moveReason = extracted.moveReason;
  if (extracted.communityTies !== null)
    next.communityTies = extracted.communityTies;
  if (extracted.ageBand !== null) next.ageBand = extracted.ageBand;
  return next;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function buildProfileSummary(profile: ProfilePayload): string {
  const lines: string[] = [];

  const fin = profile.financial;
  if (fin) {
    lines.push(
      `Financial profile (from user's saved profile — do NOT re-ask these):`,
      `  Annual income: ${fin.annualIncome != null ? formatCurrency(fin.annualIncome) : "not set"}`,
      `  Savings: ${fin.savings != null ? formatCurrency(fin.savings) : "not set"}`,
      `  Monthly debt: ${fin.monthlyDebt != null ? formatCurrency(fin.monthlyDebt) + "/mo" : "not set"}`
    );
  }

  const ls = profile.lifestyle;
  if (ls) {
    lines.push(
      `Lifestyle (from profile — do NOT re-ask):`,
      `  Current monthly cost: ${ls.currentMonthlyCost != null ? formatCurrency(ls.currentMonthlyCost) + "/mo" : "not set"}`,
      `  Spending habit: ${ls.spendingHabit ?? "not set"}`,
      `  Housing preference: ${ls.housingPreference ?? "not set"}`,
      `  Work style: ${ls.workStyle ?? "not set"}`
    );
  }

  const pos = profile.positionality;
  if (pos) {
    lines.push(
      `Positionality (from profile — already known, but confirm or refine in conversation):`,
      `  Financial backup: ${pos.financialBackup ?? "not set"}`,
      `  Language fluency: ${pos.languageFluency ?? "not set"}`,
      `  Move reason: ${pos.moveReason ?? "not set"}`
    );
  }

  const id = profile.identity;
  if (id) {
    if (id.ethnicity) lines.push(`  Ethnicity: ${id.ethnicity}`);
    if (id.communityTies) lines.push(`  Community ties: ${id.communityTies}`);
    if (id.ageBand) lines.push(`  Age band: ${id.ageBand}`);
  }

  return lines.join("\n");
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as ChatTurnRequestBody;
    const citySlug = body.citySlug;
    const mode = body.mode;
    const rawAnswers = body.answers ?? {};
    const messages = body.messages ?? [];
    const benchmarkContext = body.benchmarkContext ?? "";
    const profilePayload = body.profile ?? {};

    if (!citySlug || !mode) {
      return Response.json(
        { error: "citySlug and mode are required" },
        { status: 400 }
      );
    }

    const city = getCityBySlug(citySlug);
    if (!city) {
      return Response.json({ error: "Unknown city" }, { status: 404 });
    }

    const answers = seedAnswersFromProfile(profilePayload, rawAnswers);
    const missingFields = getMissingFields(answers);
    const profileSummary = buildProfileSummary(profilePayload);

    const alreadyKnown = CONTEXT_FIELDS
      .filter((f) => !missingFields.includes(f))
      .join(", ");

    const { output } = await generateText({
      model: openai("gpt-5.4-mini"),
      output: Output.object({ schema: chatTurnSchema }),
      system: `you are the moving-plan advisor for "can you live here?", a cost-of-living planning app. the user already has a full financial and lifestyle profile saved in the app — you do NOT need to collect income, savings, debt, housing preference, food, transport, or lifestyle spending. that data is provided to you below.

your job is to help the user build a useful moving plan by iterating on concerns, trade-offs, and actionable steps. think of yourself as a thoughtful friend who actually did the research.

VOICE & FORMAT — THIS IS CRITICAL:
- write everything in all lowercase. no capital letters ever, not even for city names or "i".
- sound warm, casual, and direct — like texting a friend. short sentences. no fluff.
- no slang, no filler words, no abbreviations like "ngl" or "tbh". just clear, plain language.
- each message bubble must be ≤200 characters. this is a hard limit.
- return 1-3 short message bubbles per turn. split your thoughts across bubbles instead of writing paragraphs.
- never write a wall of text. if you need to say more, use more bubbles.
- use emojis sparingly — one per turn at most, only when it adds warmth or clarity. never stack multiple emojis.
- plain text only, no markdown.

CRITICAL — NEVER ASK ABOUT ANYTHING ALREADY KNOWN:
- financial data (income, savings, debt, housing, food, transport, lifestyle, monthly cost, work style) is ALWAYS in the profile. never ask.
- these context fields are ALREADY KNOWN from the profile: ${alreadyKnown || "none yet"}. do NOT ask about any of them.
${missingFields.length > 0 ? `- the ONLY fields still missing: ${missingFields.join(", ")}. you may ask about ONE of these per turn, naturally woven into conversation.` : "- ALL fields are filled. do not collect any more data. focus entirely on planning."}

once context fields are filled (or from the start if they're already known), focus the conversation on:
1. financial reality check — use their profile numbers and the benchmark data to explain how their finances compare to peers in ${city.name}. be specific with numbers.
2. community contribution — how can they support the community rather than contributing to displacement?
3. displacement awareness — what neighborhoods are under pressure? what history should they understand?
4. practical planning — first-month costs, savings runway, what to do before the move.
5. risk flags — be honest about financial stretch, lack of safety net, or language barriers.

${profileSummary}

${benchmarkContext ? `peer benchmark context:\n${benchmarkContext}` : ""}

opening turn (when conversation is empty):
- do NOT ask for income or any financial data. you already have it.
- open casual with their real numbers, like: "ok so let's figure out ${city.name} for you. you're working with about ${formatCurrency((profilePayload.financial?.annualIncome ?? 0) / 12)}/mo before taxes" then a second bubble like "what part of the budget are you most stressed about?"
- keep it to 2 short bubbles. reference one concrete number so it feels personalized, then hand the conversation to them.

rules:
- be warm, honest, and culturally aware. don't sugarcoat financial risk.
- when you have enough context to make a substantive observation, generate a documentSection (id like "chat-financial-reality", "chat-community-plan", etc.) for the user's downloadable moving plan.
- set documentSection to null if this turn is just collecting a field or having a brief exchange.
- after all context fields are filled, every response should add value to the plan.
- if the user asks questions, address them directly using the profile data and benchmarks.`,
      prompt: [
        `City: ${city.name}`,
        messages.length === 0
          ? `THIS IS THE OPENING TURN — no user message yet. open with 2 short casual bubbles referencing their real monthly income and inviting them to explore how their budget works in ${city.name}. do NOT ask for income — you already have it.`
          : null,
        `Context fields still missing: ${missingFields.join(", ") || "none — focus on planning"}`,
        `Current context answers: ${JSON.stringify(answers)}`,
        `Conversation (last 12 messages): ${JSON.stringify(
          messages.slice(-12).map((m) => ({
            role: m.role,
            content: m.content,
          }))
        )}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    const mergedAnswers = mergeAnswers(answers, output.extractedAnswers);
    const remainingFields = getMissingFields(mergedAnswers);
    const complete = remainingFields.length === 0;
    const nextField = remainingFields[0];

    return Response.json({
      assistantMessages: output.assistantMessages.map((m) => m.trim()),
      answers: mergedAnswers,
      complete,
      options: getOptionsForField(nextField),
      inputType: complete ? null : "text",
      step: complete
        ? CONTEXT_FIELDS.length
        : CONTEXT_FIELDS.length - remainingFields.length + 1,
      totalSteps: CONTEXT_FIELDS.length,
      documentSection: output.documentSection ?? null,
    });
  } catch (error) {
    console.error("Failed to process AI chat intake", error);
    return Response.json(
      { error: "Failed to process chat intake" },
      { status: 500 }
    );
  }
}
