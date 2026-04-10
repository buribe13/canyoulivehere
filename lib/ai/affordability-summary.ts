import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { CostResult, Mode } from "@/lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface SummaryInput {
  cityName: string;
  mode: Mode;
  result: CostResult;
}

export async function generateAffordabilitySummary({
  cityName,
  mode,
  result,
}: SummaryInput) {
  const { text } = await generateText({
    model: openai("gpt-5.4-mini"),
    system:
      "You write short, sharp affordability guidance for a US cost-of-living app. Respond with exactly two short paragraphs in plain text, no markdown, no bullets. Keep it under 110 words total. Reference the city by name, explain what the numbers mean in human terms, and give one concrete next step.",
    prompt: [
      `City: ${cityName}`,
      `Mode: ${mode === "starting-out" ? "Starting out" : "Making a change"}`,
      `Monthly cost: ${formatCurrency(result.monthlyCost)}`,
      `Comfortable monthly cost: ${formatCurrency(result.comfortableMonthlyCost)}`,
      `Recommended annual salary: ${formatCurrency(result.recommendedSalary)}`,
      `Reality gap: ${result.realityGap >= 0 ? "+" : "-"}${formatCurrency(Math.abs(result.realityGap))}`,
      `Reality gap meaning: positive means the user is above the recommended salary target; negative means the user is below it.`,
      result.disposableIncome !== undefined
        ? `Disposable income per month: ${result.disposableIncome >= 0 ? "" : "-"}${formatCurrency(Math.abs(result.disposableIncome))}`
        : null,
      result.monthsToEmergencyFund !== undefined
        ? `Months to $10K emergency fund: ${result.monthsToEmergencyFund}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return text.trim();
}
