import { getCityBySlug } from "@/lib/cities";
import type {
  CityCostData,
  CityDashboardSummary,
  CityDossier,
  DashboardProfile,
  MetricItem,
  SpendingHabit,
  WorkStyle,
} from "@/lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonths(value: number) {
  return `${value.toFixed(1)} mo`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getFoodKey(spendingHabit: SpendingHabit): keyof CityCostData["food"] {
  if (spendingHabit === "careful") return "low";
  if (spendingHabit === "social") return "high";
  return "medium";
}

function getLifestyleKey(
  spendingHabit: SpendingHabit
): keyof CityCostData["lifestyle"] {
  if (spendingHabit === "careful") return "minimal";
  if (spendingHabit === "social") return "social";
  return "balanced";
}

function getTransportCost(
  data: CityCostData,
  citySlug: string,
  workStyle: WorkStyle
) {
  if (workStyle === "remote") {
    return Math.round(data.transport.hybrid * 0.7);
  }

  if (workStyle === "hybrid") {
    return data.transport.hybrid;
  }

  if (citySlug === "los-angeles") {
    return data.transport.car;
  }

  return data.transport.transit;
}

function getTaxNote(rate: number, cityName: string) {
  if (rate >= 0.34) {
    return `${cityName} layers on more tax drag than a lower-tax move, so take-home pay will feel tighter than the headline salary suggests.`;
  }

  if (rate >= 0.3) {
    return `${cityName} sits in the middle: taxes are noticeable, but housing and move-in costs will shape the bigger part of the squeeze.`;
  }

  return `${cityName} is a little gentler on taxes than the coastal high end, so rent and debt are more likely to be your real pressure points.`;
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Strong footing";
  if (score >= 65) return "Promising, with tradeoffs";
  if (score >= 50) return "Possible with intention";
  return "Proceed carefully";
}

function getMirrorLine(score: number, cityName: string) {
  if (score >= 80) {
    return `${cityName} looks workable if you protect your cushion and stay deliberate about where your money lands.`;
  }

  if (score >= 65) {
    return `${cityName} can make sense, but your margin depends on choosing place, pace, and spending habits with care.`;
  }

  if (score >= 50) {
    return `${cityName} is not out of reach, but the move asks for planning, local context, and less room for drift.`;
  }

  return `${cityName} is reflecting a thin buffer right now, so the most ethical move may be slowing down and widening your options first.`;
}

function toneForDelta(delta: number): MetricItem["tone"] {
  if (delta >= 0) return "positive";
  if (delta < 0) return "caution";
  return "neutral";
}

export function buildDashboardSummary({
  citySlug,
  dossier,
  profile,
  costData,
}: {
  citySlug: string;
  dossier: CityDossier;
  profile: DashboardProfile;
  costData: CityCostData;
}): CityDashboardSummary {
  const city = getCityBySlug(citySlug);
  if (!city) {
    throw new Error(`Unknown city: ${citySlug}`);
  }

  const rent = costData.rent[profile.lifestyle.housingPreference];
  const food = costData.food[getFoodKey(profile.lifestyle.spendingHabit)];
  const lifestyle = costData.lifestyle[getLifestyleKey(profile.lifestyle.spendingHabit)];
  const transport = getTransportCost(
    costData,
    citySlug,
    profile.lifestyle.workStyle
  );

  const monthlyCost =
    rent + food + lifestyle + transport + profile.financial.monthlyDebt;
  const comfortableMonthlyCost = Math.round(monthlyCost * 1.12);
  const firstMonthCost = Math.round(
    rent * (1 + dossier.financialAssumptions.depositMonths) +
      dossier.financialAssumptions.movingCost +
      dossier.financialAssumptions.landingBuffer
  );
  const monthlyIncome = profile.financial.annualIncome / 12;
  const rentBurdenPercent = clamp((rent / Math.max(monthlyIncome, 1)) * 100, 0, 100);
  const savingsRunwayMonths =
    profile.financial.savings / Math.max(comfortableMonthlyCost, 1);
  const incomeNeeded = Math.round(
    (comfortableMonthlyCost * 12) /
      (1 - dossier.financialAssumptions.effectiveTaxRate)
  );
  const realityGap = profile.financial.annualIncome - incomeNeeded;

  const financialScore = clamp(
    (profile.financial.annualIncome / Math.max(incomeNeeded, 1)) * 100,
    0,
    100
  );
  const runwayScore = clamp(savingsRunwayMonths * 18, 0, 100);
  const languageScore =
    profile.positionality.languageFluency === "fluent"
      ? 100
      : profile.positionality.languageFluency === "conversational"
        ? 78
        : 58;
  const backupScore =
    profile.positionality.financialBackup === "strong"
      ? 88
      : profile.positionality.financialBackup === "some"
        ? 72
        : 52;
  const moveReasonScore =
    profile.positionality.moveReason === "necessity"
      ? 82
      : profile.positionality.moveReason === "caretaking"
        ? 74
        : 62;
  const pressurePenalty =
    dossier.neighborhoods.filter((item) => item.pressure === "High").length * 4;

  const consciousMoveScore = Math.round(
    clamp(
      financialScore * 0.4 +
        runwayScore * 0.2 +
        languageScore * 0.12 +
        backupScore * 0.1 +
        moveReasonScore * 0.18 -
        pressurePenalty,
      18,
      96
    )
  );

  const translatedDelta = Math.round(monthlyCost - profile.lifestyle.currentMonthlyCost);
  const financialNarrative =
    realityGap >= 0
      ? `${city.name} looks feasible on your current numbers, but the comfort gap still depends on move-in costs, tax drag, and how much slack you want after rent.`
      : `${city.name} is currently running ahead of your income target, so the move becomes easier if you lower fixed costs, widen the timeline, or increase earnings before landing.`;

  return {
    citySlug,
    cityName: city.name,
    generatedAt: new Date().toISOString(),
    financial: {
      title: "Financial readiness",
      narrative: financialNarrative,
      lifestyleTranslation: `Your current ${formatCurrency(profile.lifestyle.currentMonthlyCost)}/mo rhythm lands closer to ${formatCurrency(monthlyCost)}/mo in ${city.shortName}.`,
      taxNote: getTaxNote(dossier.financialAssumptions.effectiveTaxRate, city.name),
      metrics: [
        {
          label: "Estimated monthly cost",
          value: formatCurrency(monthlyCost),
        },
        {
          label: "Comfortable monthly target",
          value: formatCurrency(comfortableMonthlyCost),
        },
        {
          label: "Rent burden",
          value: `${rentBurdenPercent.toFixed(0)}%`,
          tone:
            rentBurdenPercent <= dossier.financialAssumptions.rentBurdenTarget * 100
              ? "positive"
              : "caution",
          detail: `Target is about ${Math.round(
            dossier.financialAssumptions.rentBurdenTarget * 100
          )}% of gross income.`,
        },
        {
          label: "Savings runway",
          value: formatMonths(savingsRunwayMonths),
          tone: savingsRunwayMonths >= 4 ? "positive" : "caution",
        },
        {
          label: "Income needed",
          value: formatCurrency(incomeNeeded),
        },
        {
          label: "Income gap",
          value: `${realityGap >= 0 ? "+" : "-"}${formatCurrency(
            Math.abs(realityGap)
          )}`,
          tone: toneForDelta(realityGap),
        },
      ],
      firstMonthCosts: [
        {
          label: "First month + deposit",
          value: formatCurrency(
            Math.round(rent * (1 + dossier.financialAssumptions.depositMonths))
          ),
        },
        {
          label: "Moving costs",
          value: formatCurrency(dossier.financialAssumptions.movingCost),
        },
        {
          label: "Landing buffer",
          value: formatCurrency(dossier.financialAssumptions.landingBuffer),
        },
        {
          label: "Estimated first-month cash",
          value: formatCurrency(firstMonthCost),
        },
        {
          label: "Shift from current monthly life",
          value: `${translatedDelta >= 0 ? "+" : "-"}${formatCurrency(
            Math.abs(translatedDelta)
          )}`,
          tone: toneForDelta(-translatedDelta),
        },
      ],
    },
    cultural: {
      title: "Cultural and neighborhood context",
      narrative: dossier.overview,
      historicalContext: dossier.historicalContext,
      languageAccess: dossier.languageAccess,
      neighborhoods: dossier.neighborhoods,
    },
    displacement: {
      title: "Displacement and neighborhood change",
      narrative:
        "Use the timeline as context for what demand, redevelopment, and public policy have already changed before you arrive.",
      timeline: dossier.timeline,
      tenantProtections: dossier.tenantProtections,
    },
    resources: {
      title: "Resource and connection layer",
      narrative:
        "A move lands better when logistics and belonging are planned together. These are starting points, not substitutes for local relationships.",
      items: dossier.resources,
    },
    consciousMove: {
      title: "Conscious move score",
      score: consciousMoveScore,
      label: getScoreLabel(consciousMoveScore),
      oneLiner: getMirrorLine(consciousMoveScore, city.name),
      narrative:
        "This number is a mirror for readiness and impact, not a grade. It combines your financial cushion with how much neighborhood pressure and adaptation work the move may ask of you.",
      drivers: [
        `Income is covering about ${Math.round(financialScore)}% of the current comfort target.`,
        `Your savings translate to roughly ${formatMonths(savingsRunwayMonths)} of landing runway.`,
        `Neighborhood pressure is highest in ${dossier.neighborhoods
          .filter((item) => item.pressure === "High")
          .map((item) => item.name)
          .join(", ") || "fewer of the highlighted districts"}.`,
      ],
      prompts: [
        "What part of your budget could stay local once you arrive?",
        "Which neighborhood relationships should come before a lease decision?",
        "Are you moving into pressure because it is convenient, or because it truly matches your needs?",
      ],
    },
  };
}
