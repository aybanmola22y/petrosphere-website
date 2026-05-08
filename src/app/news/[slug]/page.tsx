import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import NewsArticle from "@/views/NewsArticle";
import { getCompanyNewsForSite, getNewsArticleBySlugAsync, getRelatedCompanyNewsAsync } from "@/lib/site-content";
import { fetchPetrosphereNewsArticleBySlug } from "@/lib/petrosphere-latest-news";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCompanyNewsForSite().map((item) => ({ slug: item.slug }));
}

async function resolveArticle(slug: string) {
  const normalized = slug.toLowerCase();
  const local = (await getNewsArticleBySlugAsync(normalized)) ?? (await getNewsArticleBySlugAsync(slug));
  if (local) return local;
  return await fetchPetrosphereNewsArticleBySlug(normalized);
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
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  return "http://localhost:3000";
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) {
    notFound();
  }
  const related = await getRelatedCompanyNewsAsync(article.slug, 4);
  const origin = await resolveShareOrigin();
  const shareUrl = `${origin}/news/${article.slug}`;
  return <NewsArticle article={article} shareUrl={shareUrl} related={related} />;
}
