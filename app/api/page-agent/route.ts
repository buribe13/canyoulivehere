import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCityBySlug } from "@/lib/cities";
import type {
  CityDashboardSummary,
  DashboardAgentPage,
  DashboardProfile,
  LiveContentSection,
  MovePlanMessage,
} from "@/lib/types";

const pageAgentSchema = z.object({
  assistantMessages: z
    .array(z.string().max(200))
    .min(1)
    .max(3)
    .describe(
      "1-3 short chat bubbles (each ≤200 chars). split thoughts across bubbles instead of writing paragraphs."
    ),
});

const messageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const requestSchema = z.object({
  page: z.enum(["neighborhoods", "conscious-move", "resources"]),
  citySlug: z.string().min(1),
  messages: z.array(messageSchema).default([]),
  profile: z.any(),
  summary: z.any(),
  liveContent: z.array(z.any()).default([]),
});

function summarizeLiveContent(sections: LiveContentSection[]) {
  if (sections.length === 0) return "No live article context was available for this turn.";

  return sections
    .map((section) => {
      const headlines = section.articles
        .slice(0, 3)
        .map((article) => `${article.title} (${article.source})`)
        .join(" | ");
      return `${section.title}: ${headlines || "No articles found"}`;
    })
    .join("\n");
}

function buildFallbackMessages(
  page: DashboardAgentPage,
  cityName: string,
  summary: CityDashboardSummary,
  liveContent: LiveContentSection[]
): string[] {
  const topHeadline =
    liveContent.flatMap((section) => section.articles)[0]?.title ?? null;

  if (page === "neighborhoods") {
    const msgs = [
      `${summary.cultural.recommendedNeighborhood.name.toLowerCase()} is the strongest match rn because ${summary.cultural.recommendedNeighborhood.matchReasons[0]?.toLowerCase() ?? "it fits your current profile best"}`,
    ];
    if (topHeadline) msgs.push(`start with "${topHeadline.toLowerCase()}" on the left to get the full picture`);
    return msgs;
  }

  if (page === "conscious-move") {
    const msgs = [
      `your conscious score is ${summary.consciousMove.score}/100 in ${cityName.toLowerCase()}`,
      `quickest win: ${summary.consciousMove.improvementLevers[0]?.toLowerCase() ?? "tackling the biggest pressure point in your plan"}`,
    ];
    return msgs;
  }

  const msgs = [
    `check out the sections on the left to get a read on ${cityName.toLowerCase()}'s politics, community, and local voices`,
  ];
  if (topHeadline) msgs.push(`"${topHeadline.toLowerCase()}" is a good place to start`);
  return msgs;
}

function buildSystemPrompt(
  page: DashboardAgentPage,
  cityName: string,
  profile: DashboardProfile,
  summary: CityDashboardSummary,
  liveContent: LiveContentSection[]
) {
  const shared = `you are the right-side agent inside "can you live here?", a reflective city-move planning app. use the user's profile, dashboard summary, and live article context to give practical, culturally aware guidance.

VOICE & FORMAT — THIS IS CRITICAL:
- write everything in all lowercase. no capital letters ever, not even for city names or "i".
- sound warm, casual, and direct — like texting a friend. short sentences. no fluff.
- no slang, no filler words, no abbreviations like "ngl" or "tbh". just clear, plain language.
- each message bubble must be ≤200 characters. this is a hard limit.
- return 1-3 short message bubbles per turn. split your thoughts across bubbles instead of writing paragraphs.
- never write a wall of text. plain text only, no markdown.
- use emojis sparingly — one per turn at most, only when it adds warmth or clarity. never stack multiple emojis.
- be concrete, calm, and useful. never ask for information the app already knows.
- OPENING MESSAGES must be ultra-short. never list your capabilities, never summarize the whole page. just say one specific, interesting thing and let the user ask for more.

Known profile:
- Income: ${profile.financial.annualIncome}
- Savings: ${profile.financial.savings}
- Monthly debt: ${profile.financial.monthlyDebt}
- Housing: ${profile.lifestyle.housingPreference}
- Work style: ${profile.lifestyle.workStyle}
- Spending habit: ${profile.lifestyle.spendingHabit}
- Financial backup: ${profile.positionality.financialBackup}
- Language fluency: ${profile.positionality.languageFluency}
- Move reason: ${profile.positionality.moveReason}
- Ethnicity: ${profile.identity.ethnicity || "not specified"}
- Community ties: ${profile.identity.communityTies || "not specified"}

Live article context:
${summarizeLiveContent(liveContent)}
`;

  if (page === "neighborhoods") {
    return `${shared}

you're helping the user pressure-test where they should land in ${cityName}.

current recommendation:
- neighborhood: ${summary.cultural.recommendedNeighborhood.name}
- fit score: ${summary.cultural.recommendedNeighborhood.score}
- match reasons: ${summary.cultural.recommendedNeighborhood.matchReasons.join(" | ")}
- caution: ${summary.cultural.recommendedNeighborhood.caution}

your job:
- explain why the recommendation does or does not make sense.
- use live article context to connect the user to real reporting on history and neighborhood dynamics.
- offer tradeoffs with other highlighted neighborhoods when relevant.
- if the user seems too focused on convenience, push them toward reading the neighborhood's pressure history.`;
  }

  if (page === "conscious-move") {
    return `${shared}

you're coaching the user on how to improve their approach to this move, not just how to optimize convenience.

current score context:
- score: ${summary.consciousMove.score}/100
- label: ${summary.consciousMove.label}
- one-liner: ${summary.consciousMove.oneLiner}
- improvement levers: ${summary.consciousMove.improvementLevers.join(" | ")}

your job:
- explain what is driving the score in plain language.
- coach the user toward better habits and more responsible neighborhood choices.
- pull in live reading suggestions when they would help.
- focus on concrete next steps, not abstract morality.`;
  }

  return `${shared}

you're the user's discovery guide for resources and city context in ${cityName}.

current resource sections:
${summary.resources.topics.map((topic) => `- ${topic.title}: ${topic.description}`).join("\n")}

your job:
- help the user decide what to read first and why.
- surface connections between politics, community, social life, and rising local figures.
- use live article context when recommending a path.
- suggest real next steps like newsletters, issue areas, local scenes, or organizations.`;
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid page agent request" }, { status: 400 });
    }

    const {
      citySlug,
      liveContent,
      messages,
      page,
      profile,
      summary,
    } = parsed.data as {
      citySlug: string;
      liveContent: LiveContentSection[];
      messages: MovePlanMessage[];
      page: DashboardAgentPage;
      profile: DashboardProfile;
      summary: CityDashboardSummary;
    };

    const city = getCityBySlug(citySlug);
    if (!city) {
      return Response.json({ error: "Unknown city" }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        assistantMessages: buildFallbackMessages(page, city.name, summary, liveContent),
      });
    }

    const { output } = await generateText({
      model: openai("gpt-5.4-mini"),
      output: Output.object({ schema: pageAgentSchema }),
      system: buildSystemPrompt(page, city.name, profile, summary, liveContent),
      prompt: [
        messages.length === 0
          ? `this is the opening turn. say hey and give ONE specific, useful thing you noticed from their profile or the data — like a neighborhood name, a score, or a resource topic. do NOT list everything you can do. do NOT summarize the whole page. just one punchy opener, max 2 bubbles.`
          : null,
        `recent conversation: ${JSON.stringify(
          messages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content,
          }))
        )}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return Response.json({
      assistantMessages: output.assistantMessages.map((m) => m.trim()),
    });
  } catch (error) {
    console.error("Failed to run page agent", error);
    return Response.json({ error: "Failed to run page agent" }, { status: 500 });
  }
}
