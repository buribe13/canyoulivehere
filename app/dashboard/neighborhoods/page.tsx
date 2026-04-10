"use client";

import { useMemo, useState } from "react";
import { ArticleMentionSection } from "@/components/dashboard/article-mention-card";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { DetailLightbox } from "@/components/dashboard/detail-lightbox";
import PageAgentPanel from "@/components/dashboard/page-agent-panel";
import { PillRow } from "@/components/dashboard/dashboard-primitives";
import SummaryGuard from "@/components/dashboard/summary-guard";
import { usePageAgentChat } from "@/lib/use-page-agent-chat";
import { useRotatingPlaceholder } from "@/lib/use-rotating-placeholder";
import { useLiveContent } from "@/lib/use-live-content";
import type { CityDashboardSummary } from "@/lib/types";

const STARTERS = [
  "Why is this neighborhood the best fit for me?",
  "What should I understand before moving there?",
  "How does this compare to the runner-up neighborhood?",
  "What pressure signals should I take seriously?",
];

function NeighborhoodsContent({ summary }: { summary: CityDashboardSummary }) {
  const {
    city,
    citySlug,
    mapFocus,
    pageAgents,
    profile,
    setMapFocus,
    setPageAgentMessages,
    addPageAgentMessage,
  } = useDashboard();

  const placeholder = useRotatingPlaceholder(STARTERS);
  const recommendation = summary.cultural.recommendedNeighborhood;
  const recommendationCard = summary.cultural.neighborhoods.find(
    (item) => item.name === recommendation.name
  );
  const alternatives = summary.cultural.neighborhoods.filter(
    (item) => item.name !== recommendation.name
  );
  const { sections, loading: liveLoading } = useLiveContent({
    page: "neighborhoods",
    citySlug,
    topics: recommendation.topics,
    limit: 3,
  });
  const { loading: chatLoading, sendMessage } = usePageAgentChat({
    page: "neighborhoods",
    citySlug,
    profile,
    summary,
    liveContent: sections,
    messages: pageAgents.neighborhoods.messages,
    setMessages: (messages) => setPageAgentMessages("neighborhoods", messages),
    addMessage: (message) => addPageAgentMessage("neighborhoods", message),
    ready: !liveLoading,
  });

  const isRecommendedFocused = mapFocus?.neighborhoodName === recommendation.name;
  const [cautionOpen, setCautionOpen] = useState(false);

  const neighborhoodCards = useMemo(
    () =>
      alternatives.map((item) => {
        const focused = mapFocus?.neighborhoodName === item.name;

        return (
          <div
            key={item.name}
            className="rounded-[14px] bg-[rgba(255,255,255,0.035)] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-[14px] leading-[18px] font-medium text-ink">
                {item.name}
              </p>
              <button
                type="button"
                onClick={() =>
                  setMapFocus({
                    label: item.name,
                    neighborhoodName: item.name,
                    preset: item.mapView,
                    source: "neighborhoods",
                  })
                }
                className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] leading-[16px] transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] ${
                  focused
                    ? "bg-accent text-white"
                    : "bg-[rgba(255,255,255,0.08)] text-ink-secondary hover:bg-[rgba(255,255,255,0.12)]"
                }`}
              >
                {focused ? "On map" : "View"}
              </button>
            </div>
            <p className="mt-1 text-[13px] leading-[17px] text-ink-muted">
              {item.narrative}
            </p>
          </div>
        );
      }),
    [alternatives, mapFocus?.neighborhoodName, setMapFocus]
  );

  const focusMapButton = (
    <button
      type="button"
      onClick={() =>
        setMapFocus({
          label: recommendation.name,
          neighborhoodName: recommendation.name,
          preset: recommendation.mapView,
          source: "neighborhoods",
        })
      }
      className="rounded-full bg-accent px-3 py-1.5 text-[12px] leading-[16px] text-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
    >
      {isRecommendedFocused ? "Focused on map" : "Focus map"}
    </button>
  );

  return (
    <DashboardWorkspace
      leftHeader={
        <button
          type="button"
          onClick={() => setCautionOpen(true)}
          className="rounded-full px-3 py-1.5 text-[12px] leading-[16px] text-negative transition-[opacity,transform] duration-150 ease-out hover:opacity-80 active:scale-[0.96]"
        >
          Caution
        </button>
      }
      leftChildren={
        <div className="space-y-12">
          <section>
            <div className="flex items-baseline gap-3">
              <h1 className="text-heading text-ink">{recommendation.name}</h1>
              <h1
                className="text-heading tabular-nums"
                style={{
                  color: `hsl(${(recommendation.score / 100) * 120}, 60%, 55%)`,
                }}
              >
                {recommendation.score}/100
              </h1>
            </div>

            <p className="mt-3 text-[14px] leading-[18px] text-ink-light">
              {recommendation.reason}
            </p>

            {recommendationCard ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-[12px] leading-[16px] text-ink-muted">
                    Languages
                  </p>
                  <div className="mt-1.5">
                    <PillRow items={recommendationCard.languages} />
                  </div>
                </div>
                <div>
                  <p className="text-[12px] leading-[16px] text-ink-muted">
                    Cultural anchors
                  </p>
                  <div className="mt-1.5">
                    <PillRow items={recommendationCard.anchors} />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <DetailLightbox
            open={cautionOpen}
            onClose={() => setCautionOpen(false)}
            title="Caution"
          >
            <div className="space-y-3">
              <p className="text-[13px] leading-[18px] text-ink-secondary">
                {recommendation.caution}
              </p>
              <p className="text-[13px] leading-[18px] text-ink-muted">
                {summary.cultural.historicalContext}
              </p>
            </div>
          </DetailLightbox>

          <div className="space-y-5">
            {liveLoading ? (
              <div className="text-[13px] leading-[17px] text-ink-muted">
                Loading live neighborhood coverage...
              </div>
            ) : (
              sections.map((section) => (
                <ArticleMentionSection key={section.id} section={section} />
              ))
            )}
          </div>

          <section className="space-y-3">
            <p className="text-[14px] leading-[18px] font-medium text-ink">
              Also worth comparing
            </p>
            <div className="space-y-3">{neighborhoodCards}</div>
          </section>
        </div>
      }
      rightChildren={
        <PageAgentPanel
          title={`Neighborhood guide · ${city.shortName}`}
          placeholder={placeholder}
          messages={pageAgents.neighborhoods.messages}
          loading={chatLoading}
          onSend={sendMessage}
          headerAction={focusMapButton}
        />
      }
    />
  );
}

export default function NeighborhoodsPage() {
  return (
    <SummaryGuard>
      {(summary) => <NeighborhoodsContent summary={summary} />}
    </SummaryGuard>
  );
}
