import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCityBySlug } from "@/lib/cities";
import type { ChatMessage, Mode, UserAnswers } from "@/lib/types";

const livingValues = ["alone", "roommates", "family"] as const;
const transportValues = ["car", "transit", "hybrid"] as const;
const foodValues = ["low", "medium", "high"] as const;
const lifestyleValues = ["minimal", "balanced", "social", "premium"] as const;
const priorityValues = ["neighborhood", "commute", "cost"] as const;
const fluencyValues = ["learning", "conversational", "fluent"] as const;
const backupValues = ["none", "some", "strong"] as const;
const moveReasonValues = ["opportunity", "necessity", "caretaking"] as const;

const extractedAnswersSchema = z.object({
  income: z.number().int().nonnegative().nullable(),
  living: z.enum(livingValues).nullable(),
  transport: z.enum(transportValues).nullable(),
  food: z.enum(foodValues).nullable(),
  lifestyle: z.enum(lifestyleValues).nullable(),
  studentLoans: z.number().int().nonnegative().nullable(),
  priority: z.enum(priorityValues).nullable(),
  shouldSetStudentLoansToZero: z.boolean().nullable(),
  ethnicity: z.string().nullable(),
  languageFluency: z.enum(fluencyValues).nullable(),
  financialBackup: z.enum(backupValues).nullable(),
  moveReason: z.enum(moveReasonValues).nullable(),
  communityTies: z.string().nullable(),
});

const chatTurnSchema = z.object({
  assistantMessage: z.string().min(1),
  extractedAnswers: extractedAnswersSchema,
});

type FieldKey =
  | "income" | "living" | "transport" | "food" | "studentLoans" | "priority" | "lifestyle"
  | "ethnicity" | "languageFluency" | "financialBackup" | "moveReason" | "communityTies";

interface ChatTurnRequestBody {
  citySlug?: string;
  mode?: Mode;
  answers?: Partial<UserAnswers>;
  messages?: ChatMessage[];
}

function getRequiredFields(mode: Mode): FieldKey[] {
  const financial: FieldKey[] = mode === "starting-out"
    ? ["income", "living", "transport", "food", "studentLoans", "lifestyle"]
    : ["income", "living", "transport", "food", "priority", "lifestyle"];
  const context: FieldKey[] = ["ethnicity", "languageFluency", "financialBackup", "moveReason", "communityTies"];
  return [...financial, ...context];
}

function getMissingFields(mode: Mode, answers: Record<string, unknown>) {
  return getRequiredFields(mode).filter((field) => {
    const value = answers[field];
    return value === undefined || value === null;
  });
}

function getOptionsForField(field: FieldKey | undefined, mode: Mode) {
  switch (field) {
    case "living":
      return mode === "starting-out"
        ? [
            { label: "Living alone", value: "alone" },
            { label: "With roommates", value: "roommates" },
          ]
        : [
            { label: "Living alone", value: "alone" },
            { label: "With roommates", value: "roommates" },
            { label: "With family", value: "family" },
          ];
    case "transport":
      return [
        { label: "Car", value: "car" },
        { label: "Public transit", value: "transit" },
        { label: "Mix of both", value: "hybrid" },
      ];
    case "food":
      return [
        { label: "Cooking mostly", value: "low" },
        { label: "Balanced", value: "medium" },
        { label: "Eating out often", value: "high" },
      ];
    case "priority":
      return [
        { label: "Neighborhood quality", value: "neighborhood" },
        { label: "Short commute", value: "commute" },
        { label: "Lower cost", value: "cost" },
      ];
    case "lifestyle":
      return mode === "making-change"
        ? [
            { label: "Minimal", value: "minimal" },
            { label: "Balanced", value: "balanced" },
            { label: "Premium", value: "premium" },
          ]
        : [
            { label: "Minimal", value: "minimal" },
            { label: "Balanced", value: "balanced" },
            { label: "Social", value: "social" },
            { label: "Premium", value: "premium" },
          ];
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
    default:
      return undefined;
  }
}

function mergeAnswers(
  mode: Mode,
  current: Record<string, unknown>,
  extracted: z.infer<typeof extractedAnswersSchema>
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...current };

  if (extracted.income !== null) next.income = extracted.income;
  if (extracted.living !== null) next.living = extracted.living;
  if (extracted.transport !== null) next.transport = extracted.transport;
  if (extracted.food !== null) next.food = extracted.food;
  if (extracted.lifestyle !== null) next.lifestyle = extracted.lifestyle;
  if (extracted.studentLoans !== null) next.studentLoans = extracted.studentLoans;
  if (extracted.priority !== null) next.priority = extracted.priority;
  if (extracted.ethnicity !== null) next.ethnicity = extracted.ethnicity;
  if (extracted.languageFluency !== null) next.languageFluency = extracted.languageFluency;
  if (extracted.financialBackup !== null) next.financialBackup = extracted.financialBackup;
  if (extracted.moveReason !== null) next.moveReason = extracted.moveReason;
  if (extracted.communityTies !== null) next.communityTies = extracted.communityTies;

  if (
    mode === "starting-out" &&
    extracted.shouldSetStudentLoansToZero &&
    next.studentLoans === undefined
  ) {
    next.studentLoans = 0;
  }

  return next;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as ChatTurnRequestBody;
    const citySlug = body.citySlug;
    const mode = body.mode;
    const answers = body.answers ?? {};
    const messages = body.messages ?? [];

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

    const requiredFields = getRequiredFields(mode);
    const missingFields = getMissingFields(mode, answers);

    const { output } = await generateText({
      model: openai("gpt-5.4-mini"),
      output: Output.object({ schema: chatTurnSchema }),
      system: `You are the chat intake assistant for "Can You Live Here?", a dark minimal cost-of-living app. Your job is to collect the user's moving-plan inputs conversationally, one question at a time, for ${city.name}. The plan covers financial profile, personal context, and positionality.

Rules:
- Keep the assistant message to 1-2 short paragraphs, plain text only.
- Sound natural, warm, and culturally aware — not robotic.
- Ask for only one missing field at a time.
- If the latest user message clearly answers a field, extract it.
- Start with financial fields, then move to personal context and positionality.

Financial fields:
- Income is annual USD.
- Student loans are a monthly USD payment; set to zero only when the user clearly says they have none.
- Allowed living values: alone, roommates${mode === "making-change" ? ", family" : ""}.
- Allowed transport values: car, transit, hybrid.
- Allowed food values: low, medium, high.
- Allowed lifestyle values: ${mode === "making-change" ? "minimal, balanced, premium" : "minimal, balanced, social, premium"}.
- Allowed priority values for making-change mode: neighborhood, commute, cost.

Personal & positionality fields:
- ethnicity: freeform string — the user's racial or ethnic background.
- languageFluency: learning, conversational, or fluent — their English proficiency.
- financialBackup: none, some, or strong — whether they have a safety net.
- moveReason: opportunity, necessity, or caretaking — why they are moving.
- communityTies: freeform string — any connections they already have in ${city.name}.

- Do not ask multiple questions in one turn.
- When asking about ethnicity or language, be respectful and explain why it matters (local cultural communities, resources, representation).
- If all required fields are collected, say you have everything needed to build their plan.`,
      prompt: [
        `City: ${city.name}`,
        `Mode: ${mode === "starting-out" ? "Starting out" : "Making a change"}`,
        `Required fields: ${requiredFields.join(", ")}`,
        `Current answers: ${JSON.stringify(answers)}`,
        `Missing fields before this turn: ${missingFields.join(", ") || "none"}`,
        `Conversation: ${JSON.stringify(
          messages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content,
          }))
        )}`,
      ].join("\n"),
    });

    const mergedAnswers = mergeAnswers(mode, answers, output.extractedAnswers);
    const remainingFields = getMissingFields(mode, mergedAnswers);
    const complete = remainingFields.length === 0;
    const nextField = remainingFields[0];

    return Response.json({
      assistantMessage: output.assistantMessage.trim(),
      answers: mergedAnswers,
      complete,
      options: getOptionsForField(nextField, mode),
      inputType: complete ? null : "text",
      step: complete
        ? requiredFields.length
        : requiredFields.length - remainingFields.length + 1,
      totalSteps: requiredFields.length,
    });
  } catch (error) {
    console.error("Failed to process AI chat intake", error);
    return Response.json(
      { error: "Failed to process chat intake" },
      { status: 500 }
    );
  }
}
