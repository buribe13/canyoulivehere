"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getCityBySlug, INITIAL_MAP_PRESET } from "@/lib/cities";
import { MAP_STYLE } from "@/lib/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

interface MapShellProps {
  citySlug?: string | null;
  focusPreset?: {
    center: [lng: number, lat: number];
    zoom: number;
    bearing?: number;
    pitch?: number;
  } | null;
}

function hideLabels(map: mapboxgl.Map) {
  const style = map.getStyle();
  for (const layer of style.layers ?? []) {
    if (layer.type === "symbol") {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  }
}

export default function MapShell({ citySlug, focusPreset }: MapShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INITIAL_MAP_PRESET.center,
      zoom: INITIAL_MAP_PRESET.zoom,
      bearing: INITIAL_MAP_PRESET.bearing,
      pitch: INITIAL_MAP_PRESET.pitch,
      attributionControl: false,
      interactive: false,
    });

    mapRef.current = map;
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      hideLabels(map);
      map.setFog({
        color: "rgb(10, 10, 12)",
        "high-color": "rgb(10, 10, 12)",
        "space-color": "rgb(6, 6, 8)",
        "horizon-blend": 0.04,
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const city = citySlug ? getCityBySlug(citySlug) : undefined;
    const target = focusPreset ?? city?.mapView ?? INITIAL_MAP_PRESET;

    map.flyTo({
      center: target.center,
      zoom: target.zoom,
      bearing: target.bearing ?? 0,
      pitch: target.pitch ?? 0,
      duration: 1800,
      essential: true,
    });
  }, [citySlug, focusPreset]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-raised">
        <p className="text-nav text-ink-muted">Map unavailable</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
