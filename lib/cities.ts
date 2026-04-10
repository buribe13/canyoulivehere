import type { City, CityCostData } from "./types";

export const CITIES: City[] = [
  {
    name: "Los Angeles",
    slug: "los-angeles",
    tagline: "The City of Angels",
    coords: [-118.2437, 34.0522],
    accent: "var(--accent-brand)",
    available: true,
  },
  {
    name: "New York",
    slug: "new-york",
    tagline: "The City That Never Sleeps",
    coords: [-74.006, 40.7128],
    accent: "var(--accent-brand)",
    available: false,
  },
  {
    name: "Chicago",
    slug: "chicago",
    tagline: "The Windy City",
    coords: [-87.6298, 41.8781],
    accent: "var(--accent-brand)",
    available: false,
  },
  {
    name: "San Francisco",
    slug: "san-francisco",
    tagline: "The Golden Gate City",
    coords: [-122.4194, 37.7749],
    accent: "var(--accent-brand)",
    available: false,
  },
  {
    name: "Boston",
    slug: "boston",
    tagline: "The Cradle of Liberty",
    coords: [-71.0589, 42.3601],
    accent: "var(--accent-brand)",
    available: false,
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

const costDataCache = new Map<string, CityCostData>();

export async function loadCityCostData(
  slug: string
): Promise<CityCostData | null> {
  if (costDataCache.has(slug)) return costDataCache.get(slug)!;
  try {
    const data = (await import(`@/data/cities/${slug}.json`)).default;
    costDataCache.set(slug, data);
    return data;
  } catch {
    return null;
  }
}
