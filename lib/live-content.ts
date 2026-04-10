import type {
  DashboardAgentPage,
  LiveContentArticle,
  LiveContentSection,
  LiveContentTopic,
} from "@/lib/types";

interface GdeltResponse {
  articles?: Array<{
    title?: string;
    url?: string;
    domain?: string;
    seendate?: string;
    socialimage?: string;
  }>;
}

interface LiveContentRequest {
  page: DashboardAgentPage;
  citySlug: string;
  topics: LiveContentTopic[];
  limit?: number;
}

const CACHE_TTL_MS = 1000 * 60 * 20;
const PREVIEW_FETCH_TIMEOUT_MS = 4500;
const liveContentCache = new Map<
  string,
  { expiresAt: number; sections: LiveContentSection[] }
>();
const articlePreviewCache = new Map<
  string,
  {
    expiresAt: number;
    previewImageUrl?: string;
    description?: string;
  }
>();

function cacheKey(input: LiveContentRequest) {
  return JSON.stringify({
    page: input.page,
    citySlug: input.citySlug,
    limit: input.limit ?? 3,
    topics: input.topics,
  });
}

function normalizeSource(url: string, domain?: string) {
  if (domain) return domain.replace(/^www\./, "");

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getTagAttributeValue(tag: string, attribute: string) {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
  );

  return decodeXml(
    (match?.[2] ?? match?.[3] ?? match?.[4] ?? "").trim()
  );
}

function resolveUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function normalizePreviewImage(value: string | undefined, articleUrl: string) {
  if (!value) return undefined;

  const resolvedUrl = resolveUrl(value.trim(), articleUrl);
  if (!resolvedUrl) return undefined;

  try {
    const parsed = new URL(resolvedUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}

function extractPreviewMetadata(html: string, articleUrl: string) {
  const metadata = new Map<string, string>();

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const property = getTagAttributeValue(tag, "property");
    const name = getTagAttributeValue(tag, "name");
    const content = getTagAttributeValue(tag, "content");

    if (!content) continue;

    if (property) {
      metadata.set(property.toLowerCase(), content);
    }

    if (name) {
      metadata.set(name.toLowerCase(), content);
    }
  }

  const previewImageUrl = normalizePreviewImage(
    metadata.get("og:image:secure_url") ??
      metadata.get("og:image") ??
      metadata.get("twitter:image") ??
      metadata.get("twitter:image:src"),
    articleUrl
  );

  const description =
    metadata.get("og:description") ??
    metadata.get("twitter:description") ??
    metadata.get("description");

  return {
    previewImageUrl,
    description: description?.trim() || undefined,
  };
}

async function fetchArticlePreviewMetadata(articleUrl: string) {
  const cached = articlePreviewCache.get(articleUrl);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return {
      previewImageUrl: cached.previewImageUrl,
      description: cached.description,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PREVIEW_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(articleUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
      },
      next: { revalidate: 60 * 20 },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Preview metadata request failed: ${response.status}`);
    }

    const metadata = extractPreviewMetadata(await response.text(), articleUrl);
    articlePreviewCache.set(articleUrl, {
      expiresAt: now + CACHE_TTL_MS,
      previewImageUrl: metadata.previewImageUrl,
      description: metadata.description,
    });

    return metadata;
  } catch {
    articlePreviewCache.set(articleUrl, {
      expiresAt: now + CACHE_TTL_MS,
    });

    return {};
  } finally {
    clearTimeout(timeoutId);
  }
}

async function enrichArticles(articles: LiveContentArticle[]) {
  return Promise.all(
    articles.map(async (article) => {
      if (article.previewImageUrl && article.description) {
        return article;
      }

      const preview = await fetchArticlePreviewMetadata(article.url);

      return {
        ...article,
        description: article.description ?? preview.description,
        previewImageUrl: article.previewImageUrl ?? preview.previewImageUrl,
      };
    })
  );
}

function normalizeArticle(
  article: NonNullable<GdeltResponse["articles"]>[number]
): LiveContentArticle | null {
  if (!article.url || !article.title) return null;

  return {
    title: article.title.trim(),
    url: article.url,
    source: normalizeSource(article.url, article.domain),
    publishedAt: article.seendate,
    description: undefined,
    previewImageUrl: normalizePreviewImage(article.socialimage, article.url),
  };
}

function parseGoogleNewsItems(xml: string, limit: number) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const results: LiveContentArticle[] = [];

  for (const match of items) {
    const item = match[1];
    const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const url = item.match(/<link>([\s\S]*?)<\/link>/)?.[1];
    const publishedAt = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
    const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1];
    const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1];
    const mediaImage =
      item.match(/<media:content[^>]*url="([^"]+)"/i)?.[1] ??
      item.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] ??
      item.match(/<enclosure[^>]*url="([^"]+)"/i)?.[1];

    if (!title || !url) continue;

    results.push({
      title: decodeXml(title).replace(/\s+-\s+[^-]+$/, "").trim(),
      url: decodeXml(url).trim(),
      source: decodeXml(source ?? normalizeSource(url)).trim(),
      publishedAt: decodeXml(publishedAt ?? "").trim() || undefined,
      description: decodeXml(description ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() || undefined,
      previewImageUrl: normalizePreviewImage(mediaImage, decodeXml(url).trim()),
    });

    if (results.length >= limit) break;
  }

  return results;
}

async function fetchGoogleNewsArticles(topic: LiveContentTopic, limit: number) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", topic.query);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    next: { revalidate: 60 * 20 },
  });

  if (!response.ok) {
    throw new Error(`Google News RSS failed: ${response.status}`);
  }

  return parseGoogleNewsItems(await response.text(), limit);
}

async function fetchTopicArticles(topic: LiveContentTopic, limit: number) {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", topic.query);
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "HybridRel");
  url.searchParams.set("maxrecords", String(Math.max(limit * 2, 6)));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 * 20 },
  });

  if (!response.ok) {
    throw new Error(`Live content request failed: ${response.status}`);
  }

  const data = (await response.json()) as GdeltResponse;
  const deduped = new Map<string, LiveContentArticle>();

  for (const rawArticle of data.articles ?? []) {
    const article = normalizeArticle(rawArticle);
    if (!article) continue;
    if (!deduped.has(article.url)) {
      deduped.set(article.url, article);
    }
    if (deduped.size >= limit) break;
  }

  const gdeltResults = Array.from(deduped.values());
  if (gdeltResults.length > 0) {
    return enrichArticles(gdeltResults);
  }

  return enrichArticles(await fetchGoogleNewsArticles(topic, limit));
}

export async function getLiveContentSections(
  input: LiveContentRequest
): Promise<LiveContentSection[]> {
  const key = cacheKey(input);
  const cached = liveContentCache.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.sections;
  }

  const limit = input.limit ?? 3;
  const sections = await Promise.all(
    input.topics.map(async (topic) => {
      try {
        const articles = await fetchTopicArticles(topic, limit);
        return {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          articles,
        } satisfies LiveContentSection;
      } catch {
        return {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          articles: [],
        } satisfies LiveContentSection;
      }
    })
  );

  liveContentCache.set(key, {
    expiresAt: now + CACHE_TTL_MS,
    sections,
  });

  return sections;
}
