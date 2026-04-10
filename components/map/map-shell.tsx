"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CITIES } from "@/lib/cities";
import { MAP_STYLE, INITIAL_VIEW } from "@/lib/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
const DOT_COLOR = "#007aff";
const DOT_GLOW = "rgba(0, 122, 255, 0.35)";

interface MapShellProps {
  onCitySelect: (slug: string) => void;
  selectedCity: string | null;
}

export default function MapShell({ onCitySelect, selectedCity }: MapShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(new Map());
  const selectRef = useRef(onCitySelect);
  selectRef.current = onCitySelect;

  const flyToCity = useCallback((slug: string) => {
    const city = CITIES.find((c) => c.slug === slug);
    if (!city || !mapRef.current) return;
    mapRef.current.flyTo({ center: city.coords, zoom: 11, duration: 1400 });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      attributionControl: false,
    });

    mapRef.current = map;

    CITIES.forEach((city) => {
      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "40px",
        height: "40px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const dot = document.createElement("div");
      dot.dataset.dot = "true";
      Object.assign(dot.style, {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: DOT_COLOR,
        boxShadow: `0 0 0 2px ${DOT_GLOW}`,
        transitionProperty: "transform, box-shadow, width, height",
        transitionDuration: "150ms",
        transitionTimingFunction: "ease-out",
        pointerEvents: "none",
      });

      el.appendChild(dot);

      el.addEventListener("mouseenter", () => {
        dot.style.transform = "scale(1.4)";
        dot.style.boxShadow = `0 0 0 3px rgba(0,122,255,0.5), 0 0 12px rgba(0,122,255,0.2)`;
      });
      el.addEventListener("mouseleave", () => {
        dot.style.transform = "scale(1)";
        dot.style.boxShadow = `0 0 0 2px ${DOT_GLOW}`;
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectRef.current(city.slug);
      });

      el.title = city.name;

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(city.coords)
        .addTo(map);

      markersRef.current.set(city.slug, { marker, el });
    });

    return () => {
      map.remove();
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markersRef.current.forEach(({ el }, slug) => {
      const dot = el.querySelector("[data-dot]") as HTMLDivElement | null;
      if (!dot) return;
      const active = slug === selectedCity;
      dot.style.width = active ? "14px" : "10px";
      dot.style.height = active ? "14px" : "10px";
      dot.style.boxShadow = active
        ? `0 0 0 3px rgba(0,122,255,0.6), 0 0 16px rgba(0,122,255,0.25)`
        : `0 0 0 2px ${DOT_GLOW}`;
    });
    if (selectedCity) {
      flyToCity(selectedCity);
    } else if (mapRef.current) {
      mapRef.current.flyTo({
        center: INITIAL_VIEW.center,
        zoom: INITIAL_VIEW.zoom,
        duration: 1400,
      });
    }
  }, [selectedCity, flyToCity]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="glass max-w-sm rounded-2xl p-8 text-center">
          <p className="text-subheading text-ink mb-0">Map Setup</p>
          <p className="text-subline-md text-ink-muted mt-0">
            Add <code className="rounded-md bg-surface px-1.5 py-0.5 text-caption">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to
            your <code className="rounded-md bg-surface px-1.5 py-0.5 text-caption">.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
