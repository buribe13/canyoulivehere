import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCityBySlug } from "@/lib/cities";

const placeRelationships = [
  "origin",
  "born",
  "raised",
  "moved-to",
  "family-root",
  "studied",
  "worked",
] as const;

const livingHistoryNodeSchema = z.object({
  place: z.string(),
  relationship: z.enum(placeRelationships),
  dateOfBirth: z.string().nullable(),
  startYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  historicalContext: z.string().nullable(),
  parentId: z.string().nullable(),
});

const extractedProfileSchema = z.object({
  income: z.number().int().nonnegative().nullable(),
  living: z.enum(["alone", "roommates", "family"]).nullable(),
  transport: z.enum(["car", "transit", "hybrid"]).nullable(),
  food: z.enum(["low", "medium", "high"]).nullable(),
  lifestyle: z.enum(["minimal", "balanced", "social", "premium"]).nullable(),
  studentLoans: z.number().int().nonnegative().nullable(),
  financialBackup: z.enum(["none", "some", "strong"]).nullable(),
  languageFluency: z.enum(["learning", "conversational", "fluent"]).nullable(),
  moveReason: z.enum(["opportunity", "necessity", "caretaking"]).nullable(),
  ethnicity: z.string().nullable(),
  communityTies: z.string().nullable(),
});

const profileChatTurnSchema = z.object({
  assistantMessage: z.string().min(1),
  extractedProfile: extractedProfileSchema,
  extractedHistoryNodes: z.array(livingHistoryNodeSchema),
  extractedConcerns: z.array(z.string()),
});

const FIELD_LABELS: Record<string, string> = {
  income: "income",
  savings: "savings",
  monthlyDebt: "monthly debt",
  living: "housing preference",
  currentMonthlyCost: "monthly cost of living",
  spendingHabit: "spending habits",
  workStyle: "work style",
  food: "food spending",
  transport: "transportation",
  lifestyle: "lifestyle spending",
  studentLoans: "student loans",
  financialBackup: "financial safety net",
  languageFluency: "language fluency",
  moveReason: "reason for moving",
  ethnicity: "ethnicity",
  communityTies: "community ties",
};

function buildKnownFieldsList(answers: Record<string, unknown>): string {
  const known: string[] = [];
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const val = answers[key];
    if (val !== undefined && val !== null && val !== "") {
      known.push(label);
    }
  }
  return known.length > 0
    ? known.join(", ")
    : "none";
}

interface RequestBody {
  citySlug?: string;
  messages?: Array<{ role: string; content: string }>;
  currentAnswers?: Record<string, unknown>;
  existingNodes?: Array<{ place: string; relationship: string }>;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as RequestBody;
    const citySlug = body.citySlug;
    const messages = body.messages ?? [];
    const currentAnswers = body.currentAnswers ?? {};
    const existingNodes = body.existingNodes ?? [];

    const city = citySlug ? getCityBySlug(citySlug) : null;
    const cityName = city?.name ?? "their target city";

    const knownFields = buildKnownFieldsList(currentAnswers);
    const hasHistory = existingNodes.length > 0;

    const { output } = await generateText({
      model: openai("gpt-5.4-mini"),
      output: Output.object({ schema: profileChatTurnSchema }),
      system: `You are the profile builder for "Can You Live Here?", a cost-of-living explorer. The user is setting up their personal profile before exploring city data. Your job is to learn about THEM — who they are, where they come from, and what their life looks like right now.

CRITICAL — DO NOT ASK ABOUT THINGS ALREADY KNOWN:
The following fields are already filled in the user's profile. Do NOT ask about any of them: ${knownFields}.
${hasHistory ? `The user already has ${existingNodes.length} place(s) in their living history: ${existingNodes.map((n) => `${n.place} (${n.relationship})`).join(", ")}. Do NOT ask about places they've already added.` : ""}

The profile editing UI is on the left side of the screen — the user can already see and edit their income, savings, debt, housing, lifestyle, and positionality fields there. Your chat should NOT duplicate that form. Instead, have a genuine conversation that fills in the GAPS — things the editable fields don't capture well, like living history, personal story, and nuanced context.

Your priorities:
1. Get to know the user as a person. Ask about where they're from, where they've lived, their background, and what matters to them. Build their living history.
2. Only ask about profile fields that are genuinely EMPTY (not already known). Let it flow naturally.
3. Extract structured data in the background as they share. Don't make it feel like a form.

Rules:
- Keep each response to 1-2 short paragraphs, plain text only.
- Sound natural, warm, and genuinely curious about them as a person.
- Never ask multiple questions in one turn.
- When origins/places come up, probe for dates, time periods, family connections, and why a place matters.
- If mentioning ethnicity or language, explain that it helps surface local communities, resources, and representation.
- Extract profile fields when clearly stated — do not guess or infer uncertain values.
- Extract living-history nodes for any places the user mentions living in, being from, family roots, or meaningful connections to.
- Extract concerns as short phrases capturing their worries/wants.
- The user is considering a move to ${cityName}.`,
      prompt: [
        `Target city: ${cityName}`,
        messages.length === 0
          ? `THIS IS THE OPENING TURN. The user's profile fields (${knownFields}) are already filled — do NOT ask about any of them. Start by asking something personal that the form can't capture, like where they grew up or what's drawing them to ${cityName}.`
          : null,
        `Current profile answers: ${JSON.stringify(currentAnswers)}`,
        `Existing living history: ${JSON.stringify(existingNodes)}`,
        `Conversation: ${JSON.stringify(
          messages.slice(-12).map((m) => ({
            role: m.role,
            content: m.content,
          }))
        )}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return Response.json({
      assistantMessage: output.assistantMessage.trim(),
      extractedProfile: output.extractedProfile,
      extractedHistoryNodes: output.extractedHistoryNodes,
      extractedConcerns: output.extractedConcerns,
    });
  } catch (error) {
    console.error("Profile chat error:", error);
    return Response.json(
      { error: "Failed to process profile chat" },
      { status: 500 }
    );
  }
}
