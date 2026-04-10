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
  "Which section should I start with?",
  "What local voices matter most right now?",
  "Can you narrow this to housing and politics?",
  "What feels most connected to my likely neighborhood?",
];

function ResourcesContent({ summary }: { summary: CityDashboardSummary }) {
  const { citySlug, pageAgents, profile, setPageAgentMessages, addPageAgentMessage } =
    useDashboard();

  const placeholder = useRotatingPlaceholder(STARTERS);
  const { sections, loading: liveLoading } = useLiveContent({
    page: "resources",
    citySlug,
    topics: summary.resources.topics,
    limit: 3,
  });
  const { loading: chatLoading, sendMessage } = usePageAgentChat({
    page: "resources",
    citySlug,
    profile,
    summary,
    liveContent: sections,
    messages: pageAgents.resources.messages,
    setMessages: (messages) => setPageAgentMessages("resources", messages),
    addMessage: (message) => addPageAgentMessage("resources", message),
    ready: !liveLoading,
  });

  const lightbox = useDetailLightbox();
  const activeResource = summary.resources.items.find(
    (item) => item.title === lightbox.activeKey
  );

  return (
    <DashboardWorkspace
      leftHeader={null}
      leftChildren={
        <div className="space-y-12">
          <section>
            <h1 className="text-heading text-ink">{summary.resources.title}</h1>
            <p className="mt-2 text-[14px] leading-[22px] text-ink-light">
              {summary.resources.narrative}
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-[12px] leading-[16px] text-ink-muted">
              Practical anchors
            </p>
            {summary.resources.items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => lightbox.open(item.title)}
                className="flex w-full items-center justify-between gap-3 rounded-[12px] bg-[rgba(255,255,255,0.035)] px-3.5 py-2.5 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]"
              >
                <span className="text-[13px] leading-[17px] text-ink">
                  {item.title}
                </span>
                <span className="shrink-0 text-[12px] leading-[16px] text-ink-muted">
                  {item.category.replace("-", " ")}
                </span>
              </button>
            ))}
          </section>

          <div className="space-y-5">
            {liveLoading ? (
              <div className="text-[13px] leading-[17px] text-ink-muted">
                Loading live city resources...
              </div>
            ) : (
              sections.map((section) => (
                <ArticleMentionSection key={section.id} section={section} />
              ))
            )}
          </div>

          {activeResource ? (
            <DetailLightbox
              open
              onClose={lightbox.close}
              title={activeResource.title}
              badge={
                <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-0.5 text-[12px] leading-[16px] text-ink-muted">
                  {activeResource.category.replace("-", " ")}
                </span>
              }
            >
              <p className="text-[13px] leading-[18px] text-ink-secondary">
                {activeResource.description}
              </p>
            </DetailLightbox>
          ) : null}
        </div>
      }
      rightChildren={
        <PageAgentPanel
          title="Resource guide"
          placeholder={placeholder}
          messages={pageAgents.resources.messages}
          loading={chatLoading}
          onSend={sendMessage}
        />
      }
    />
  );
}

export default function ResourcesPage() {
  return (
    <SummaryGuard>
      {(summary) => <ResourcesContent summary={summary} />}
    </SummaryGuard>
  );
}
