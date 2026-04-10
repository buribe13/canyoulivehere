import type { City, CityCostData } from "./types";

export const CITIES: City[] = [
  {
    name: "Los Angeles",
    shortName: "LA",
    slug: "los-angeles",
    state: "California",
    tagline: "The City of Angels",
    coords: [-118.2437, 34.0522],
    accent: "var(--accent-brand)",
    available: true,
    statusLabel: "Beta dossier",
    statusTone: "info",
    mapView: {
      center: [-118.324, 34.0522],
      zoom: 9.2,
      bearing: -8,
      pitch: 18,
    },
  },
  {
    name: "New York City",
    shortName: "NYC",
    slug: "new-york",
    state: "New York",
    tagline: "The City That Never Sleeps",
    coords: [-74.006, 40.7128],
    accent: "var(--accent-brand)",
    available: true,
    statusLabel: "Beta dossier",
    statusTone: "info",
    mapView: {
      center: [-73.9851, 40.7589],
      zoom: 10.7,
      bearing: 6,
      pitch: 24,
    },
  },
  {
    name: "Chicago",
    shortName: "Chicago",
    slug: "chicago",
    state: "Illinois",
    tagline: "The Windy City",
    coords: [-87.6298, 41.8781],
    accent: "var(--accent-brand)",
    available: true,
    statusLabel: "Beta dossier",
    statusTone: "info",
    mapView: {
      center: [-87.6298, 41.8815],
      zoom: 10.8,
      bearing: -10,
      pitch: 20,
    },
  },
  {
    name: "San Francisco",
    shortName: "SF",
    slug: "san-francisco",
    state: "California",
    tagline: "The Golden Gate City",
    coords: [-122.4194, 37.7749],
    accent: "var(--accent-brand)",
    available: true,
    statusLabel: "Beta dossier",
    statusTone: "info",
    mapView: {
      center: [-122.4315, 37.7749],
      zoom: 10.8,
      bearing: -18,
      pitch: 24,
    },
  },
  {
    name: "Boston",
    shortName: "Boston",
    slug: "boston",
    state: "Massachusetts",
    tagline: "The Cradle of Liberty",
    coords: [-71.0589, 42.3601],
    accent: "var(--accent-brand)",
    available: true,
    statusLabel: "Beta dossier",
    statusTone: "info",
    mapView: {
      center: [-71.079, 42.3495],
      zoom: 11.3,
      bearing: -12,
      pitch: 18,
    },
  },
];

export const DEFAULT_CITY_SLUG = "los-angeles";
export const INITIAL_MAP_PRESET = {
  center: [-98.5, 39.5] as [number, number],
  zoom: 3.55,
  bearing: 0,
  pitch: 0,
};

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
