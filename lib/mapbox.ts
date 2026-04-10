import { INITIAL_MAP_PRESET } from "@/lib/cities";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  streets: "mapbox://styles/mapbox/streets-v12",
  outdoors: "mapbox://styles/mapbox/outdoors-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const MAP_STYLE = MAP_STYLES.dark;

export const INITIAL_VIEW = {
  center: INITIAL_MAP_PRESET.center,
  zoom: INITIAL_MAP_PRESET.zoom,
};
