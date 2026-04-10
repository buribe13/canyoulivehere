"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DashboardAgentPage,
  LiveContentSection,
  LiveContentTopic,
} from "@/lib/types";

interface UseLiveContentArgs {
  page: DashboardAgentPage;
  citySlug: string;
  topics: LiveContentTopic[];
  limit?: number;
}

export function useLiveContent({
  page,
  citySlug,
  topics,
  limit,
}: UseLiveContentArgs) {
  const [sections, setSections] = useState<LiveContentSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicKey = useMemo(() => JSON.stringify(topics), [topics]);

  useEffect(() => {
    if (!citySlug || topics.length === 0) {
      return;
    }

    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/live-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page, citySlug, topics, limit }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load live content");
        }

        const data = (await response.json()) as {
          sections?: LiveContentSection[];
        };
        setSections(data.sections ?? []);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setError((error as Error).message);
        setSections([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [citySlug, limit, page, topicKey, topics]);

  return {
    sections: citySlug && topics.length > 0 ? sections : [],
    loading: citySlug && topics.length > 0 ? loading : false,
    error: citySlug && topics.length > 0 ? error : null,
  };
}
