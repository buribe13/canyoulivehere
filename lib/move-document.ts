import type {
  CityDashboardSummary,
  DashboardProfile,
  DocumentSection,
  LivingHistory,
  City,
  PeerBenchmark,
  CityBenchmarkData,
} from "@/lib/types";
import { buildBenchmarkSummaryForDocument } from "@/lib/peer-benchmarks";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildMovePlanDocument({
  city,
  profile,
  livingHistory,
  summary,
  benchmark,
  benchmarkData,
  chatSections,
}: {
  city: City;
  profile: DashboardProfile;
  livingHistory: LivingHistory;
  summary: CityDashboardSummary | null;
  benchmark: PeerBenchmark | null;
  benchmarkData: CityBenchmarkData | null;
  chatSections: DocumentSection[];
}): DocumentSection[] {
  const sections: DocumentSection[] = [];

  sections.push({
    id: "header",
    title: `Moving plan: ${city.name}, ${city.state}`,
    body: `Prepared for a ${profile.identity.ageBand ?? "—"} year-old${profile.identity.ethnicity ? `, ${profile.identity.ethnicity}` : ""} individual earning ${formatCurrency(profile.financial.annualIncome)}/yr with ${formatCurrency(profile.financial.savings)} in savings.`,
  });

  if (summary) {
    const fin = summary.financial;
    const metricLines = fin.metrics
      .map((m) => `${m.label}: ${m.value}`)
      .join("\n");

    sections.push({
      id: "financial-readiness",
      title: "Financial readiness",
      body: `${fin.narrative}\n\n${fin.lifestyleTranslation}\n\n${metricLines}`,
      tone:
        fin.metrics.find((m) => m.label === "Income gap")?.tone ?? "neutral",
    });

    sections.push({
      id: "first-month",
      title: "First-month costs",
      body: fin.firstMonthCosts
        .map((m) => `${m.label}: ${m.value}`)
        .join("\n"),
    });
  }

  if (benchmark && benchmarkData) {
    sections.push({
      id: "peer-comparison",
      title: "Peer financial comparison",
      body: buildBenchmarkSummaryForDocument(
        city.name,
        profile.financial.annualIncome,
        benchmark,
        benchmarkData,
        profile.identity.ethnicity
      ),
    });
  }

  if (summary) {
    sections.push({
      id: "community-fit",
      title: "Community and cultural fit",
      body: summary.cultural.narrative,
    });

    if (summary.cultural.neighborhoods.length > 0) {
      const nhoodLines = summary.cultural.neighborhoods
        .map(
          (n) =>
            `${n.name} (${n.pressure} pressure): ${n.narrative}`
        )
        .join("\n\n");
      sections.push({
        id: "neighborhoods",
        title: "Neighborhood context",
        body: nhoodLines,
      });
    }

    sections.push({
      id: "displacement",
      title: "Displacement awareness",
      body: summary.displacement.narrative,
    });

    sections.push({
      id: "conscious-move",
      title: "Conscious move assessment",
      body: `${summary.consciousMove.label} (score: ${summary.consciousMove.score}/100)\n\n${summary.consciousMove.narrative}`,
      tone:
        summary.consciousMove.score >= 65
          ? "positive"
          : summary.consciousMove.score >= 50
            ? "neutral"
            : "caution",
    });
  }

  if (livingHistory.nodes.length > 0) {
    const historyLines = livingHistory.nodes
      .map((n) => {
        const parts = [n.place, n.relationship];
        if (n.startYear) parts.push(`from ${n.startYear}`);
        if (n.endYear) parts.push(`to ${n.endYear}`);
        return parts.join(" — ");
      })
      .join("\n");
    sections.push({
      id: "living-history",
      title: "Your living history",
      body: historyLines,
    });
  }

  const contributionSection: DocumentSection = {
    id: "community-contribution",
    title: "Contributing to your new community",
    body: profile.identity.communityTies
      ? `You mentioned existing ties: ${profile.identity.communityTies}. Building on these connections can help you integrate thoughtfully and contribute to the community rather than displacing existing social fabric.`
      : "Consider how you can contribute to the social and economic fabric of the community you are joining. Support local businesses, learn about neighborhood history, and build genuine relationships before trying to change the place.",
  };
  sections.push(contributionSection);

  for (const cs of chatSections) {
    if (!sections.some((s) => s.id === cs.id)) {
      sections.push(cs);
    }
  }

  const positionality = profile.positionality;
  const riskFlags: string[] = [];
  if (positionality.financialBackup === "none") {
    riskFlags.push("No financial safety net identified.");
  }
  if (positionality.languageFluency === "learning") {
    riskFlags.push(
      "Language fluency is still developing, which may limit access to services and community."
    );
  }
  if (summary) {
    const gap = summary.financial.metrics.find(
      (m) => m.label === "Income gap"
    );
    if (gap?.tone === "caution") {
      riskFlags.push(`Income gap flagged: ${gap.value}.`);
    }
    const runway = summary.financial.metrics.find(
      (m) => m.label === "Savings runway"
    );
    if (runway?.tone === "caution") {
      riskFlags.push(`Savings runway is tight: ${runway.value}.`);
    }
  }

  if (riskFlags.length > 0) {
    sections.push({
      id: "risk-flags",
      title: "Risk flags",
      body: riskFlags.join("\n"),
      tone: "caution",
    });
  }

  if (summary?.resources) {
    const resourceLines = summary.resources.items
      .slice(0, 5)
      .map((r) => `${r.title}: ${r.description}`)
      .join("\n");
    sections.push({
      id: "next-steps",
      title: "Next steps and resources",
      body: resourceLines || "No specific resources identified yet.",
    });
  }

  return sections;
}
