"use client";

import type { LiveContentArticle, LiveContentSection } from "@/lib/types";

export function ArticleMentionCard({
  article,
}: {
  article: LiveContentArticle;
}) {
  const previewImage = article.previewImageUrl;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-3 overflow-hidden rounded-[14px] bg-[rgba(255,255,255,0.035)] p-2.5 transition-[transform,background-color] duration-150 ease-out hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.98]"
    >
      {previewImage ? (
        <div className="size-14 shrink-0 overflow-hidden rounded-[10px] bg-[rgba(255,255,255,0.04)]">
          <div
            aria-hidden="true"
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(previewImage)})` }}
          />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-[16px] text-ink-muted">
          {article.source}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-[17px] font-medium text-ink">
          {article.title}
        </p>
      </div>
    </a>
  );
}

export function ArticleMentionSection({
  section,
  emptyLabel = "No recent articles came back for this topic yet.",
}: {
  section: LiveContentSection;
  emptyLabel?: string;
}) {
  return (
    <section className="space-y-3">
      <p className="text-[13px] leading-[17px] text-ink-secondary">
        {section.title}
      </p>

      {section.articles.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {section.articles.map((article) => (
            <ArticleMentionCard key={article.url} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-[13px] leading-[17px] text-ink-muted">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}
