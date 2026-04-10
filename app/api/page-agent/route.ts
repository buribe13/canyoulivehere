import { generateText } from "ai";
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

function buildFallbackMessage(
  page: DashboardAgentPage,
  cityName: string,
  summary: CityDashboardSummary,
  liveContent: LiveContentSection[]
) {
  const topHeadline =
    liveContent.flatMap((section) => section.articles)[0]?.title ?? null;

  if (page === "neighborhoods") {
    return `${summary.cultural.recommendedNeighborhood.name} is the strongest match right now because ${summary.cultural.recommendedNeighborhood.matchReasons[0]?.toLowerCase() ?? "it best matches your current profile."} Start with the neighborhood history and development links on the left, and compare that against the caution before treating the fit as final.${topHeadline ? ` One useful article to start with is "${topHeadline}."` : ""}`;
  }

  if (page === "conscious-move") {
    return `Your current conscious score is ${summary.consciousMove.score}/100 in ${cityName}. The quickest improvement lever is to act on ${summary.consciousMove.improvementLevers[0]?.toLowerCase() ?? "the biggest current pressure point in your plan."}${topHeadline ? ` A good supporting read is "${topHeadline}."` : ""}`;
  }

  return `Use the sections on the left to get a faster read on ${cityName}'s politics, community life, and rising local voices. Start with the section that feels least familiar to you, then ask me to narrow it to a neighborhood, issue, or type of organization.${topHeadline ? ` One recent headline to start from is "${topHeadline}."` : ""}`;
}

function buildSystemPrompt(
  page: DashboardAgentPage,
  cityName: string,
  profile: DashboardProfile,
  summary: CityDashboardSummary,
  liveContent: LiveContentSection[]
) {
  const shared = `You are the right-side agent inside "Can You Live Here?", a reflective city-move planning app. Use the user's profile, dashboard summary, and live article context to give practical, culturally aware guidance. Keep responses to 1-3 short paragraphs, plain text only. Be concrete, calm, and useful. Never ask for information the app already knows unless the user is explicitly correcting it.

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
You are helping the user pressure-test where they should land in ${cityName}.

Current recommendation:
- Neighborhood: ${summary.cultural.recommendedNeighborhood.name}
- Fit score: ${summary.cultural.recommendedNeighborhood.score}
- Match reasons: ${summary.cultural.recommendedNeighborhood.matchReasons.join(" | ")}
- Caution: ${summary.cultural.recommendedNeighborhood.caution}

Your job:
- Explain why the recommendation does or does not make sense.
- Use the live article context to connect the user to real reporting on history, development, and current neighborhood dynamics.
- Offer tradeoffs with other highlighted neighborhoods when relevant.
- If the user seems too focused on convenience, push them toward reading the neighborhood's pressure history before deciding.
- When useful, suggest exactly which live section or article cluster they should read next.`;
  }

  if (page === "conscious-move") {
    return `${shared}
You are coaching the user on how to improve their approach to this move, not just how to optimize convenience.

Current score context:
- Score: ${summary.consciousMove.score}/100
- Label: ${summary.consciousMove.label}
- One-liner: ${summary.consciousMove.oneLiner}
- Improvement levers: ${summary.consciousMove.improvementLevers.join(" | ")}

Your job:
- Explain what is driving the score in plain language.
- Coach the user toward better habits, stronger preparation, and more responsible neighborhood choices.
- Pull in live reading suggestions or resources when they would help the user act on the advice.
- Focus on concrete next steps, not abstract morality.`;
  }

  return `${shared}
You are the user's discovery guide for resources and city context in ${cityName}.

Current resource sections:
${summary.resources.topics.map((topic) => `- ${topic.title}: ${topic.description}`).join("\n")}

Your job:
- Help the user decide what to read first and why.
- Surface connections between politics, community, social life, and rising local figures.
- Use live article context when recommending a path.
- Suggest real next steps like newsletters, issue areas, local scenes, or organizations to pay attention to.`;
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
        assistantMessage: buildFallbackMessage(page, city.name, summary, liveContent),
      });
    }

    const result = await generateText({
      model: openai("gpt-5.4-mini"),
      system: buildSystemPrompt(page, city.name, profile, summary, liveContent),
      prompt: [
        messages.length === 0
          ? `This is the opening turn. Greet the user and orient them to what you can help with on the ${page} page.`
          : null,
        `Recent conversation: ${JSON.stringify(
          messages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content,
          }))
        )}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return Response.json({ assistantMessage: result.text.trim() });
  } catch (error) {
    console.error("Failed to run page agent", error);
    return Response.json({ error: "Failed to run page agent" }, { status: 500 });
  }
}
