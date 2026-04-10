import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { getCityBySlug } from "@/lib/cities";
import { buildDashboardSummary } from "@/lib/dashboard-model";
import { getCityDossier } from "@/data/dashboard/city-dossiers";
import { loadCityCostData } from "@/lib/cities";

const profileSchema = z.object({
  financial: z.object({
    annualIncome: z.number().nonnegative(),
    savings: z.number().nonnegative(),
    monthlyDebt: z.number().nonnegative(),
  }),
  lifestyle: z.object({
    currentMonthlyCost: z.number().nonnegative(),
    spendingHabit: z.enum(["careful", "balanced", "social"]),
    housingPreference: z.enum(["alone", "roommates", "family"]),
    workStyle: z.enum(["remote", "hybrid", "in-person"]),
  }),
  positionality: z.object({
    financialBackup: z.enum(["none", "some", "strong"]),
    languageFluency: z.enum(["learning", "conversational", "fluent"]),
    moveReason: z.enum(["opportunity", "necessity", "caretaking"]),
  }),
});

const requestSchema = z.object({
  citySlug: z.string().min(1),
  profile: profileSchema,
});

const aiSchema = z.object({
  financialNarrative: z.string(),
  culturalNarrative: z.string(),
  consciousOneLiner: z.string(),
  consciousNarrative: z.string(),
});

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid dashboard summary request" },
        { status: 400 }
      );
    }

    const { citySlug, profile } = parsed.data;
    const city = getCityBySlug(citySlug);
    const dossier = getCityDossier(citySlug);
    const costData = await loadCityCostData(citySlug);

    if (!city || !dossier || !costData) {
      return Response.json({ error: "Unknown city" }, { status: 404 });
    }

    const summary = buildDashboardSummary({
      citySlug,
      dossier,
      profile,
      costData,
    });

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ summary, aiEnhanced: false });
    }

    const { object } = await generateObject({
      model: openai("gpt-5.4-mini"),
      schema: aiSchema,
      system:
        "You write calm, precise dashboard copy for a relocation tool. Keep the tone reflective, non-judgmental, and concrete. Never frame the score as a grade or pass/fail. Keep each field to 1-3 sentences, plain text, no markdown.",
      prompt: [
        `City: ${city.name}`,
        `Overview: ${dossier.overview}`,
        `Historical context: ${dossier.historicalContext}`,
        `Language access: ${dossier.languageAccess}`,
        `Financial narrative seed: ${summary.financial.narrative}`,
        `Lifestyle translation: ${summary.financial.lifestyleTranslation}`,
        `Top financial metrics: ${summary.financial.metrics
          .map((metric) => `${metric.label}: ${metric.value}`)
          .join("; ")}`,
        `Cultural narrative seed: ${summary.cultural.narrative}`,
        `Neighborhood highlights: ${summary.cultural.neighborhoods
          .map(
            (item) =>
              `${item.name} (${item.pressure} pressure): ${item.narrative}`
          )
          .join(" | ")}`,
        `Conscious move label: ${summary.consciousMove.label}`,
        `Score: ${summary.consciousMove.score}`,
        `Score narrative seed: ${summary.consciousMove.narrative}`,
        `Drivers: ${summary.consciousMove.drivers.join(" | ")}`,
      ].join("\n"),
    });

    summary.financial.narrative = object.financialNarrative.trim();
    summary.cultural.narrative = object.culturalNarrative.trim();
    summary.consciousMove.oneLiner = object.consciousOneLiner.trim();
    summary.consciousMove.narrative = object.consciousNarrative.trim();

    return Response.json({ summary, aiEnhanced: true });
  } catch (error) {
    console.error("Failed to generate dashboard summary", error);
    return Response.json(
      { error: "Failed to generate dashboard summary" },
      { status: 500 }
    );
  }
}
