"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CityDashboardSummary,
  DashboardAgentPage,
  DashboardProfile,
  LiveContentSection,
  MovePlanMessage,
} from "@/lib/types";

interface UsePageAgentChatArgs {
  page: DashboardAgentPage;
  citySlug: string;
  profile: DashboardProfile;
  summary: CityDashboardSummary;
  liveContent: LiveContentSection[];
  messages: MovePlanMessage[];
  setMessages: (messages: MovePlanMessage[]) => void;
  addMessage: (message: MovePlanMessage) => void;
  ready?: boolean;
}

function buildFallbackError(page: DashboardAgentPage) {
  if (page === "neighborhoods") {
    return "I couldn't load the neighborhood guide just now. Start with the history and development sections on the left, and I can still help you compare the tradeoffs.";
  }

  if (page === "conscious-move") {
    return "I couldn't load the coaching thread just now. We can still work from the score breakdown and improvement levers on the left.";
  }

  return "I couldn't load the discovery guide just now. The live sections on the left should still give you a solid starting point.";
}

export function usePageAgentChat({
  page,
  citySlug,
  profile,
  summary,
  liveContent,
  messages,
  setMessages,
  addMessage,
  ready = true,
}: UsePageAgentChatArgs) {
  const [loading, setLoading] = useState(false);
  const sentInitial = useRef(false);

  const sendRequest = useCallback(
    async (nextMessages: MovePlanMessage[]) => {
      const response = await fetch("/api/page-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          citySlug,
          profile,
          summary,
          liveContent,
          messages: nextMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load page agent");
      }

      return (await response.json()) as { assistantMessage?: string };
    },
    [citySlug, liveContent, page, profile, summary]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      const userMessage: MovePlanMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setLoading(true);

      try {
        const data = await sendRequest(nextMessages);
        setMessages([
          ...nextMessages,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content:
              data.assistantMessage?.trim() || buildFallbackError(page),
          },
        ]);
      } catch {
        addMessage({
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: buildFallbackError(page),
        });
      } finally {
        setLoading(false);
      }
    },
    [addMessage, loading, messages, page, sendRequest, setMessages]
  );

  useEffect(() => {
    if (!ready || sentInitial.current || messages.length > 0) return;

    sentInitial.current = true;
    setLoading(true);

    sendRequest([])
      .then((data) => {
        setMessages([
          {
            id: `assistant-init-${Date.now()}`,
            role: "assistant",
            content: data.assistantMessage?.trim() || buildFallbackError(page),
          },
        ]);
      })
      .catch(() => {
        setMessages([
          {
            id: `assistant-init-error-${Date.now()}`,
            role: "assistant",
            content: buildFallbackError(page),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [messages.length, page, ready, sendRequest, setMessages]);

  return {
    loading,
    sendMessage,
  };
}
