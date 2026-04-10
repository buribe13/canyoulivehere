import { getCityBySlug } from "@/lib/cities";
import type {
  CityCostData,
  CityDashboardSummary,
  CityDossier,
  DashboardProfile,
  LiveContentTopic,
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

function budgetBandForUser(realityGap: number, savingsRunwayMonths: number) {
  if (realityGap < 0 || savingsRunwayMonths < 2.5) return "stretch" as const;
  if (realityGap < 12000 || savingsRunwayMonths < 5) return "steady" as const;
  return "flexible" as const;
}

function formatList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function matchCommunitySignals(profile: DashboardProfile, signals: string[]) {
  const haystack = [
    profile.identity.ethnicity,
    profile.identity.communityTies,
    profile.positionality.languageFluency,
  ]
    .join(" ")
    .toLowerCase();

  return signals.filter((signal) => haystack.includes(signal.toLowerCase()));
}

function createTopic(
  id: string,
  title: string,
  description: string,
  query: string
): LiveContentTopic {
  return { id, title, description, query };
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

  const userBudgetBand = budgetBandForUser(realityGap, savingsRunwayMonths);
  const neighborhoodMatches = dossier.neighborhoods.map((item) => {
    let score = 50;
    const reasons: string[] = [];

    if (item.fitProfile.housingFits.includes(profile.lifestyle.housingPreference)) {
      score += 12;
      reasons.push(
        `${item.name} is a better fit for a ${profile.lifestyle.housingPreference} setup.`
      );
    }

    if (item.fitProfile.workStyleFits.includes(profile.lifestyle.workStyle)) {
      score += 10;
      reasons.push(
        `${item.fitProfile.vibe} matches a ${profile.lifestyle.workStyle.replace("-", " ")} work rhythm.`
      );
    }

    if (item.fitProfile.moveReasonFits.includes(profile.positionality.moveReason)) {
      score += 8;
      reasons.push(
        `Its neighborhood logic lines up with moving for ${profile.positionality.moveReason}.`
      );
    }

    if (item.fitProfile.budgetBand === userBudgetBand) {
      score += 12;
      reasons.push(
        `Its price pressure looks more compatible with your current landing margin.`
      );
    } else if (
      userBudgetBand === "stretch" &&
      item.fitProfile.budgetBand === "steady"
    ) {
      score += 8;
      reasons.push(`It gives you more breathing room than the highest-pressure picks.`);
    } else if (
      userBudgetBand === "flexible" &&
      item.fitProfile.budgetBand === "stretch"
    ) {
      score += 4;
    } else {
      score -= 6;
    }

    const communityMatches = matchCommunitySignals(profile, item.fitProfile.communitySignals);
    if (communityMatches.length > 0) {
      score += 12;
      reasons.push(
        `It has stronger signals for ${formatList(communityMatches.slice(0, 2))}.`
      );
    } else if (
      profile.positionality.languageFluency !== "fluent" &&
      item.languages.length > 1
    ) {
      score += 6;
      reasons.push(
        `Its multilingual infrastructure could make the landing phase easier.`
      );
    }

    if (item.pressure === "High") {
      score -= profile.positionality.financialBackup === "strong" ? 4 : 8;
    } else if (item.pressure === "Low") {
      score += 4;
    }

    return {
      item,
      score: Math.round(clamp(score, 24, 96)),
      reasons,
    };
  });

  const recommendedNeighborhood =
    neighborhoodMatches.sort((a, b) => b.score - a.score)[0] ?? null;

  if (!recommendedNeighborhood) {
    throw new Error(`No neighborhoods available for ${citySlug}`);
  }

  const recommendedTopics = [
    createTopic(
      "history",
      `${recommendedNeighborhood.item.name} history`,
      "Recent reporting and background on the neighborhood's past and long-term civic context.",
      recommendedNeighborhood.item.articleQueries.history
    ),
    createTopic(
      "development",
      "Development and housing pressure",
      "Coverage of rezonings, housing, investment, and displacement pressure tied to this neighborhood.",
      recommendedNeighborhood.item.articleQueries.development
    ),
    createTopic(
      "current-events",
      "Current neighborhood updates",
      "Fresh local reporting on issues, organizing, and near-term change in the area.",
      recommendedNeighborhood.item.articleQueries.currentEvents
    ),
  ];

  const consciousTopics = [
    createTopic(
      "tenant-rights",
      "Tenant rights and housing pressure",
      "Read up on local tenant protections, neighborhood pressure, and housing politics before you move.",
      `"${city.name}" tenant rights housing pressure ${recommendedNeighborhood.item.name}`
    ),
    createTopic(
      "community-accountability",
      "Community accountability",
      "Reporting on community organizations, preservation fights, and local accountability around neighborhood change.",
      `"${city.name}" ${recommendedNeighborhood.item.name} community organization neighborhood change`
    ),
    createTopic(
      "belonging",
      "Belonging and adaptation",
      "Resources that can help you understand how to enter the city with more local context and less drift.",
      `"${city.name}" local community guide cultural resources ${profile.identity.communityTies || recommendedNeighborhood.item.name}`
    ),
  ];

  const resourceTopics = [
    createTopic(
      "political-events",
      "Political events",
      "Local politics, council decisions, and policy fights shaping daily life in the city.",
      `"${city.name}" city council housing policy local politics`
    ),
    createTopic(
      "community",
      "Community and organizing",
      "Coverage of neighborhood groups, mutual aid, and civic organizing with real local context.",
      `"${city.name}" community organizing neighborhood news ${recommendedNeighborhood.item.name}`
    ),
    createTopic(
      "socials",
      "Social and public life",
      "Stories about public life, cultural happenings, and the city's social rhythm beyond tourist framing.",
      `"${city.name}" arts culture community events`
    ),
    createTopic(
      "rising-figures",
      "Rising figures",
      "Reporting on organizers, artists, business owners, and public voices shaping the city right now.",
      `"${city.name}" local organizer artist community leader profile`
    ),
  ];

  const improvementLevers = [
    realityGap < 0
      ? "Widen your timeline or lower fixed housing costs before treating the move as settled."
      : "Protect the margin you have now by choosing a neighborhood that does not erase it on day one.",
    profile.positionality.financialBackup === "none"
      ? "Build more backup before signing a lease so a surprise fee or broker cost does not force bad tradeoffs."
      : "Keep your safety net visible in the plan instead of spending to your maximum rent tolerance.",
    profile.positionality.languageFluency === "learning"
      ? "Invest early in language access and local context so convenience does not become your only guide."
      : "Use your existing fluency or community knowledge to build real local relationships, not just easier consumption.",
    recommendedNeighborhood.item.pressure === "High"
      ? `Study ${recommendedNeighborhood.item.name}'s pressure history before deciding that access alone makes it the right fit.`
      : `Use ${recommendedNeighborhood.item.name} as a starting point, but compare it against at least one nearby neighborhood before committing.`,
  ];

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
      recommendedNeighborhood: {
        name: recommendedNeighborhood.item.name,
        score: recommendedNeighborhood.score,
        reason: `${recommendedNeighborhood.item.name} is the strongest current match because ${recommendedNeighborhood.reasons
          .slice(0, 2)
          .join(" ")}`,
        matchReasons: recommendedNeighborhood.reasons.slice(0, 3),
        caution: recommendedNeighborhood.item.fitProfile.caution,
        vibe: recommendedNeighborhood.item.fitProfile.vibe,
        mapView: recommendedNeighborhood.item.mapView,
        topics: recommendedTopics,
      },
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
      topics: resourceTopics,
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
      breakdown: [
        {
          label: "Financial margin",
          score: Math.round(financialScore),
          tone: financialScore >= 70 ? "positive" : financialScore >= 55 ? "neutral" : "caution",
          detail: `Your current income covers about ${Math.round(financialScore)}% of the comfort target for ${city.shortName}.`,
        },
        {
          label: "Landing runway",
          score: Math.round(runwayScore),
          tone: runwayScore >= 70 ? "positive" : runwayScore >= 55 ? "neutral" : "caution",
          detail: `Savings translate to about ${formatMonths(savingsRunwayMonths)} of landing runway.`,
        },
        {
          label: "Language and local adaptation",
          score: Math.round(languageScore),
          tone: languageScore >= 75 ? "positive" : languageScore >= 60 ? "neutral" : "caution",
          detail: `Language fluency shapes how much hidden labor the move may ask of you day to day.`,
        },
        {
          label: "Safety net",
          score: Math.round(backupScore),
          tone: backupScore >= 75 ? "positive" : backupScore >= 60 ? "neutral" : "caution",
          detail: `Backup changes how much pressure an up-front fee, delay, or bad lease puts on the move.`,
        },
        {
          label: "Neighborhood pressure exposure",
          score: Math.round(clamp(100 - pressurePenalty * 8, 24, 100)),
          tone:
            pressurePenalty <= 4
              ? "positive"
              : pressurePenalty <= 8
                ? "neutral"
                : "caution",
          detail: `${recommendedNeighborhood.item.name} is the current best fit, but ${dossier.neighborhoods.filter((item) => item.pressure === "High").length} highlighted neighborhoods still sit under high pressure.`,
        },
      ],
      improvementLevers,
      topics: consciousTopics,
    },
  };
}
