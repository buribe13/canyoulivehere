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
  assistantMessages: z
    .array(z.string().max(200))
    .min(1)
    .max(3)
    .describe(
      "1-3 short chat bubbles (each ≤200 chars). split thoughts across bubbles instead of writing paragraphs."
    ),
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
      system: `you are the profile builder for "can you live here?", a cost-of-living explorer. the user is setting up their personal profile before exploring city data. your job is to learn about THEM — who they are, where they come from, and what their life looks like right now.

VOICE & FORMAT — THIS IS CRITICAL:
- write everything in all lowercase. no capital letters ever, not even for city names or "i".
- sound warm, casual, and direct — like texting a friend. short sentences. no fluff.
- no slang, no filler words, no abbreviations like "ngl" or "tbh". just clear, plain language.
- each message bubble must be ≤200 characters. this is a hard limit.
- return 1-3 short message bubbles per turn. split your thoughts across bubbles instead of writing paragraphs.
- never write a wall of text. if you need to say more, use more bubbles.
- use emojis sparingly — one per turn at most, only when it adds warmth or clarity. never stack multiple emojis.
- plain text only, no markdown.

CRITICAL — DO NOT ASK ABOUT THINGS ALREADY KNOWN:
the following fields are already filled in the user's profile. do NOT ask about any of them: ${knownFields}.
${hasHistory ? `the user already has ${existingNodes.length} stop(s) in their living history: ${existingNodes.map((n) => `${n.place} (${n.relationship})`).join(", ")}. do NOT re-extract a node that already exists with the same place AND relationship. however, the same city CAN appear multiple times with DIFFERENT relationships (e.g. born in chicago + raised in chicago are two separate stops).` : ""}

the profile editing UI is on the left side of the screen — the user can already see and edit their fields there. your chat should NOT duplicate that form. instead, have a genuine conversation that fills in the gaps — living history, personal story, nuanced context.

your priorities:
1. get to know the user as a person. ask about where they're from, where they've lived, their background, and what matters to them.
2. only ask about profile fields that are genuinely EMPTY. let it flow naturally.
3. extract structured data in the background as they share.

rules:
- sound natural, warm, and genuinely curious about them as a person.
- never ask multiple questions in one turn.
- when origins/places come up, probe for dates, time periods, family connections.
- extract profile fields when clearly stated — do not guess or infer uncertain values.
- extract living-history nodes for any places the user mentions.
- CRITICAL — one node per relationship: if a user has multiple relationships with the same city, create a SEPARATE node for each. for example, if someone says "i was born and raised in chicago", extract TWO nodes: one with relationship "born" and one with relationship "raised" — both with place "chicago". if they also call it their origin, add a third node with relationship "origin". never collapse multiple relationships into a single node.
- extract concerns as short phrases capturing their worries/wants.
- the user is considering a move to ${cityName}.`,
      prompt: [
        `Target city: ${cityName}`,
        messages.length === 0
          ? `THIS IS THE OPENING TURN. the user's profile fields (${knownFields}) are already filled — do NOT ask about any of them. start by asking something personal that the form can't capture, like where they grew up or what's drawing them to ${cityName}. use 1-2 casual bubbles.`
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
      assistantMessages: output.assistantMessages.map((m) => m.trim()),
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
