import { CITIES, getCityBySlug } from "./cities";
import type { City } from "./types";

export interface MoveIntent {
  destination: City | null;
  originText: string | null;
}

const CITY_ALIASES: Record<string, string> = {};
for (const city of CITIES) {
  const slug = city.slug;
  CITY_ALIASES[city.name.toLowerCase()] = slug;
  CITY_ALIASES[city.shortName.toLowerCase()] = slug;
  CITY_ALIASES[slug] = slug;
  // common variations
  if (city.slug === "new-york") {
    CITY_ALIASES["nyc"] = slug;
    CITY_ALIASES["new york"] = slug;
    CITY_ALIASES["new york city"] = slug;
    CITY_ALIASES["manhattan"] = slug;
    CITY_ALIASES["brooklyn"] = slug;
  }
  if (city.slug === "los-angeles") {
    CITY_ALIASES["la"] = slug;
    CITY_ALIASES["los angeles"] = slug;
  }
  if (city.slug === "san-francisco") {
    CITY_ALIASES["sf"] = slug;
    CITY_ALIASES["san francisco"] = slug;
    CITY_ALIASES["san fran"] = slug;
  }
}

const SORTED_ALIASES = Object.keys(CITY_ALIASES).sort(
  (a, b) => b.length - a.length
);

function findCityInText(text: string): { slug: string; match: string; index: number } | null {
  const lower = text.toLowerCase();
  for (const alias of SORTED_ALIASES) {
    const idx = lower.indexOf(alias);
    if (idx === -1) continue;
    const before = idx > 0 ? lower[idx - 1] : " ";
    const after = idx + alias.length < lower.length ? lower[idx + alias.length] : " ";
    if (/\w/.test(before) || /\w/.test(after)) continue;
    return { slug: CITY_ALIASES[alias], match: alias, index: idx };
  }
  return null;
}

/**
 * Parse free-text input like "move to boston from riverside" and extract
 * a destination city (from the supported CITIES list) and an origin place name.
 */
export function parseMoveIntent(input: string): MoveIntent {
  const text = input.trim();
  if (!text) return { destination: null, originText: null };

  const lower = text.toLowerCase();

  let destination: City | null = null;
  let originText: string | null = null;

  // "to <city>" pattern — destination
  const toMatch = lower.match(/\bto\s+(.+?)(?:\s+from\s+|\s*$)/);
  // "from <place>" pattern — origin
  const fromMatch = lower.match(/\bfrom\s+(.+?)(?:\s+to\s+|\s*$)/);

  if (toMatch) {
    const cityHit = findCityInText(toMatch[1]);
    if (cityHit) destination = getCityBySlug(cityHit.slug) ?? null;
  }

  if (fromMatch) {
    const rawOrigin = fromMatch[1].trim();
    // if the origin itself matches a supported city, still store it as text
    originText = rawOrigin
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // fallback: if no "to" keyword, check if any supported city appears
  if (!destination) {
    const hit = findCityInText(lower);
    if (hit) destination = getCityBySlug(hit.slug) ?? null;
  }

  return { destination, originText };
}
