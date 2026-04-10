import type { AgeBand, CityBenchmarkData, PeerBenchmark } from "@/lib/types";

const cache = new Map<string, CityBenchmarkData>();

export async function loadBenchmarkData(
  citySlug: string
): Promise<CityBenchmarkData | null> {
  if (cache.has(citySlug)) return cache.get(citySlug)!;
  try {
    const data = (await import(`@/data/benchmarks/${citySlug}.json`))
      .default as CityBenchmarkData;
    cache.set(citySlug, data);
    return data;
  } catch {
    return null;
  }
}

const ETHNICITY_ALIASES: Record<string, string> = {
  white: "white",
  caucasian: "white",
  european: "white",
  black: "black",
  "african american": "black",
  african: "black",
  hispanic: "hispanic/latino",
  latino: "hispanic/latino",
  latina: "hispanic/latino",
  latinx: "hispanic/latino",
  "hispanic/latino": "hispanic/latino",
  asian: "asian",
  "asian american": "asian",
  "east asian": "asian",
  "south asian": "asian",
  "southeast asian": "asian",
  "native american": "native american",
  indigenous: "native american",
  "pacific islander": "pacific islander",
  multiracial: "multiracial",
  "mixed race": "multiracial",
  mixed: "multiracial",
  biracial: "multiracial",
};

function normalizeEthnicity(raw: string): string | null {
  const lower = raw.toLowerCase().trim();
  return ETHNICITY_ALIASES[lower] ?? null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percentDiff(user: number, median: number): string {
  if (median <= 0) return "N/A";
  const pct = ((user - median) / median) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

export function resolvePeerBenchmark(
  data: CityBenchmarkData,
  userIncome: number,
  ageBand?: AgeBand,
  ethnicity?: string
): PeerBenchmark {
  let medianIncome = data.overall.medianIncome;
  let cohortLabel = "all residents";

  const ageBandData = ageBand ? data.byAgeBand[ageBand] : null;
  const normalizedEth = ethnicity ? normalizeEthnicity(ethnicity) : null;
  const ethData =
    normalizedEth ? data.byRaceEthnicity[normalizedEth] : null;

  if (ageBandData && ethData) {
    medianIncome = Math.round((ageBandData.medianIncome + ethData.medianIncome) / 2);
    cohortLabel = `${ageBand} year-old ${normalizedEth} residents`;
  } else if (ageBandData) {
    medianIncome = ageBandData.medianIncome;
    cohortLabel = `${ageBand} year-old residents`;
  } else if (ethData) {
    medianIncome = ethData.medianIncome;
    cohortLabel = `${normalizedEth} residents`;
  }

  const medianRent = data.overall.medianRent;
  const monthlyIncome = medianIncome / 12;
  const rentBurdenPct =
    monthlyIncome > 0
      ? Math.round((medianRent / monthlyIncome) * 100)
      : 0;

  return { medianIncome, medianRent, rentBurdenPct, cohortLabel };
}

export function buildBenchmarkNarrative(
  cityName: string,
  userIncome: number,
  benchmark: PeerBenchmark
): string {
  const diff = percentDiff(userIncome, benchmark.medianIncome);
  const userFormatted = formatCurrency(userIncome);
  const medianFormatted = formatCurrency(benchmark.medianIncome);

  const abovePeers = userIncome >= benchmark.medianIncome;
  const comparison = abovePeers
    ? `Your income of ${userFormatted} sits ${diff} above the median of ${medianFormatted} among ${benchmark.cohortLabel} in ${cityName}.`
    : `Your income of ${userFormatted} sits ${diff} relative to the median of ${medianFormatted} among ${benchmark.cohortLabel} in ${cityName}.`;

  const rentContext = `The typical rent burden for this cohort is around ${benchmark.rentBurdenPct}% of gross income.`;

  const positional = abovePeers
    ? "That positions you with more financial flexibility than many of your peers, though cost of living still matters."
    : "That means housing and essentials may take a larger share of your income than they do for the average person in your peer group.";

  return `${comparison} ${rentContext} ${positional}`;
}

export function buildBenchmarkSummaryForDocument(
  cityName: string,
  userIncome: number,
  benchmark: PeerBenchmark,
  data: CityBenchmarkData,
  ethnicity?: string
): string {
  const normalizedEth = ethnicity ? normalizeEthnicity(ethnicity) : null;
  const ethData = normalizedEth ? data.byRaceEthnicity[normalizedEth] : null;

  const lines: string[] = [];
  lines.push(
    `Peer comparison for ${cityName}: your ${formatCurrency(userIncome)}/yr income vs. ${formatCurrency(benchmark.medianIncome)}/yr median among ${benchmark.cohortLabel}.`
  );

  if (ethData) {
    lines.push(
      `${normalizedEth!.charAt(0).toUpperCase() + normalizedEth!.slice(1)} residents make up about ${ethData.populationPct}% of the city population with a median income of ${formatCurrency(ethData.medianIncome)}/yr.`
    );
  }

  lines.push(
    `City-wide median rent: ${formatCurrency(data.overall.medianRent)}/mo. Overall median income: ${formatCurrency(data.overall.medianIncome)}/yr.`
  );

  return lines.join(" ");
}
