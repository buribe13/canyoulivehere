import { getCityBySlug } from "@/lib/cities";
import { generateAffordabilitySummary } from "@/lib/ai/affordability-summary";
import type { CostResult, Mode } from "@/lib/types";

interface SummaryRequestBody {
  citySlug?: string;
  mode?: Mode;
  result?: CostResult;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as SummaryRequestBody;
    const citySlug = body.citySlug;
    const mode = body.mode;
    const result = body.result;

    if (!citySlug || !mode || !result) {
      return Response.json(
        { error: "citySlug, mode, and result are required" },
        { status: 400 }
      );
    }

    const city = getCityBySlug(citySlug);
    if (!city) {
      return Response.json({ error: "Unknown city" }, { status: 404 });
    }

    const summary = await generateAffordabilitySummary({
      cityName: city.name,
      mode,
      result,
    });

    return Response.json({ summary });
  } catch (error) {
    console.error("Failed to generate affordability summary", error);
    return Response.json(
      { error: "Failed to generate affordability summary" },
      { status: 500 }
    );
  }
}
