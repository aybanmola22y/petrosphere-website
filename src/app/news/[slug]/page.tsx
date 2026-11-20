import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import NewsArticle from "@/views/NewsArticle";
import { newsSlugsMatch, resolveNewsSlugParam } from "@/lib/news-slug";
import { resolveTrustedSiteOrigin } from "@/lib/security";
import {
  getCompanyNewsForSite,
  getCompanyNewsMergedAsync,
  getNewsArticleBySlugAsync,
  getRelatedCompanyNewsAsync,
} from "@/lib/site-content";
import {
  fetchPetrosphereNewsArticleBySlug,
  fetchPetrosphereNewsArticleByUrl,
  isPetrosphereWpNewsFetchEnabled,
} from "@/lib/petrosphere-latest-news";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCompanyNewsForSite().map((item) => ({ slug: item.slug }));
}

async function hydrateFromExternal(item: Awaited<ReturnType<typeof getNewsArticleBySlugAsync>>) {
  if (!item) return null;
  if (
    isPetrosphereWpNewsFetchEnabled() &&
    item.externalHref &&
    (!item.body?.length || item.body.length <= 1)
  ) {
    try {
      return await fetchPetrosphereNewsArticleByUrl(item.externalHref);
    } catch {
      return item;
    }
  }
  return item;
}

async function resolveArticle(slug: string) {
  const normalized = resolveNewsSlugParam(slug);
  if (!normalized) return null;

  const fromSite = await hydrateFromExternal(await getNewsArticleBySlugAsync(slug));
  if (fromSite) return fromSite;

  if (isPetrosphereWpNewsFetchEnabled()) {
    const fetched = await fetchPetrosphereNewsArticleBySlug(slug);
    if (fetched) return fetched;
  }

  const pool = await getCompanyNewsMergedAsync(100).catch(() => getCompanyNewsForSite());
  const hit = pool.find((item) => newsSlugsMatch(item.slug, normalized));
  if (hit) return hydrateFromExternal(hit);

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) {
    return { title: "News" };
  }
  return {
    title: article.title,
    description: article.summary,
  };
}

async function resolveShareOrigin(): Promise<string> {
  const h = await headers();
  return resolveTrustedSiteOrigin(
    h.get("x-forwarded-host") ?? h.get("host"),
    h.get("x-forwarded-proto"),
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) {
    notFound();
  }
  const origin = await resolveShareOrigin();
  const shareUrl = `${origin}/news/${article.slug}`;

  const [related, allNews] = await Promise.all([
    getRelatedCompanyNewsAsync(article.slug, 4),
    getCompanyNewsMergedAsync(24).catch(() => getCompanyNewsForSite()),
  ]);
  const referenceIndex = allNews.findIndex((n) => n.slug.toLowerCase() === article.slug.toLowerCase());

  return (
    <NewsArticle
      article={article}
      shareUrl={shareUrl}
      related={related}
      referenceIndex={referenceIndex}
    />
  );
}
