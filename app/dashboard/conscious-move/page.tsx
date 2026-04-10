"use client";

import { ArticleMentionSection } from "@/components/dashboard/article-mention-card";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import {
  DetailLightbox,
  useDetailLightbox,
} from "@/components/dashboard/detail-lightbox";
import PageAgentPanel from "@/components/dashboard/page-agent-panel";
import SummaryGuard from "@/components/dashboard/summary-guard";
import { usePageAgentChat } from "@/lib/use-page-agent-chat";
import { useRotatingPlaceholder } from "@/lib/use-rotating-placeholder";
import { useLiveContent } from "@/lib/use-live-content";
import type { CityDashboardSummary } from "@/lib/types";

const STARTERS = [
  "What is hurting my score the most right now?",
  "What should I do before signing a lease?",
  "How can I improve this score responsibly?",
  "Which article on the left should I read first?",
];

function ConsciousMoveContent({ summary }: { summary: CityDashboardSummary }) {
  const { city, citySlug, pageAgents, profile, setPageAgentMessages, addPageAgentMessage } =
    useDashboard();

  const placeholder = useRotatingPlaceholder(STARTERS);
  const { sections, loading: liveLoading } = useLiveContent({
    page: "conscious-move",
    citySlug,
    topics: summary.consciousMove.topics,
    limit: 3,
  });
  const { loading: chatLoading, sendMessage } = usePageAgentChat({
    page: "conscious-move",
    citySlug,
    profile,
    summary,
    liveContent: sections,
    messages: pageAgents["conscious-move"].messages,
    setMessages: (messages) => setPageAgentMessages("conscious-move", messages),
    addMessage: (message) => addPageAgentMessage("conscious-move", message),
    ready: !liveLoading,
  });

  const lightbox = useDetailLightbox();

  const activeBreakdown = summary.consciousMove.breakdown.find(
    (item) => item.label === lightbox.activeKey
  );
  const activeDriverIndex = summary.consciousMove.drivers.findIndex(
    (_, i) => `driver-${i}` === lightbox.activeKey
  );
  const activeDriver =
    activeDriverIndex >= 0
      ? summary.consciousMove.drivers[activeDriverIndex]
      : undefined;
  const activeLever = summary.consciousMove.improvementLevers.find(
    (_, i) => `lever-${i}` === lightbox.activeKey
  );

  return (
    <DashboardWorkspace
      leftHeader={null}
      leftChildren={
        <div className="space-y-12">
          <section>
            <div className="flex items-end justify-between gap-4">
              <h1
                className="text-heading tabular-nums"
                style={{
                  color: `hsl(${(summary.consciousMove.score / 100) * 120}, 60%, 55%)`,
                }}
              >
                {summary.consciousMove.score}/100
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-[12px] leading-[16px] text-ink-secondary">
                  {city.shortName}
                </span>
                <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-[12px] leading-[16px] text-ink-secondary">
                  {summary.cultural.recommendedNeighborhood.name}
                </span>
              </div>
            </div>

            <p className="mt-2 text-[14px] leading-[18px] text-ink-light">
              {summary.consciousMove.oneLiner}
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-[12px] leading-[16px] text-ink-muted">
              Score breakdown
            </p>

            {summary.consciousMove.breakdown.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => lightbox.open(item.label)}
                className="flex w-full items-center justify-between gap-3 rounded-[12px] bg-[rgba(255,255,255,0.035)] px-3.5 py-2.5 transition-[background-color,transform] duration-150 ease-out hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]"
              >
                <span className="text-[13px] leading-[17px] text-ink">
                  {item.label}
                </span>
                <span
                  className={`text-[12px] leading-[16px] tabular-nums ${
                    item.tone === "positive"
                      ? "text-positive"
                      : item.tone === "caution"
                        ? "text-[#f6c26b]"
                        : "text-ink-secondary"
                  }`}
                >
                  {item.score}
                </span>
              </button>
            ))}
          </section>

          <section className="space-y-3">
            <p className="text-[12px] leading-[16px] text-ink-muted">
              Pushing the score
            </p>
            {summary.consciousMove.drivers.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => lightbox.open(`driver-${i}`)}
                className="flex w-full items-center gap-2 rounded-[12px] bg-[rgba(255,255,255,0.035)] px-3.5 py-2.5 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]"
              >
                <span className="line-clamp-1 text-[13px] leading-[17px] text-ink">
                  {item}
                </span>
              </button>
            ))}
          </section>

          <section className="space-y-3">
            <p className="text-[12px] leading-[16px] text-ink-muted">
              Improvement levers
            </p>
            {summary.consciousMove.improvementLevers.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => lightbox.open(`lever-${i}`)}
                className="flex w-full items-center gap-2 rounded-[12px] bg-[rgba(255,255,255,0.035)] px-3.5 py-2.5 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]"
              >
                <span className="line-clamp-1 text-[13px] leading-[17px] text-ink">
                  {item}
                </span>
              </button>
            ))}
          </section>

          <div className="space-y-5">
            {liveLoading ? (
              <div className="text-[13px] leading-[17px] text-ink-muted">
                Loading live reading suggestions...
              </div>
            ) : (
              sections.map((section) => (
                <ArticleMentionSection key={section.id} section={section} />
              ))
            )}
          </div>

          {activeBreakdown ? (
            <DetailLightbox
              open
              onClose={lightbox.close}
              title={activeBreakdown.label}
              badge={
                <span
                  className={`rounded-full px-2 py-0.5 text-[12px] leading-[16px] tabular-nums ${
                    activeBreakdown.tone === "positive"
                      ? "bg-[rgba(52,211,153,0.14)] text-positive"
                      : activeBreakdown.tone === "caution"
                        ? "bg-[rgba(246,194,107,0.14)] text-[#f6c26b]"
                        : "bg-[rgba(255,255,255,0.08)] text-ink-secondary"
                  }`}
                >
                  {activeBreakdown.score}
                </span>
              }
            >
              <p className="text-[13px] leading-[18px] text-ink-secondary">
                {activeBreakdown.detail}
              </p>
            </DetailLightbox>
          ) : null}

          {activeDriver != null ? (
            <DetailLightbox
              open
              onClose={lightbox.close}
              title={`Score driver ${activeDriverIndex + 1}`}
            >
              <p className="text-[13px] leading-[18px] text-ink-secondary">
                {activeDriver}
              </p>
            </DetailLightbox>
          ) : null}

          {activeLever != null ? (
            <DetailLightbox
              open
              onClose={lightbox.close}
              title="Improvement lever"
            >
              <p className="text-[13px] leading-[18px] text-ink-secondary">
                {activeLever}
              </p>
            </DetailLightbox>
          ) : null}
        </div>
      }
      rightChildren={
        <PageAgentPanel
          title={`Improve your approach · ${city.shortName}`}
          placeholder={placeholder}
          messages={pageAgents["conscious-move"].messages}
          loading={chatLoading}
          onSend={sendMessage}
        />
      }
    />
  );
}

export default function ConsciousMovePage() {
  return (
    <SummaryGuard>
      {(summary) => <ConsciousMoveContent summary={summary} />}
    </SummaryGuard>
  );
}
