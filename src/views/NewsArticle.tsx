import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Facebook,
  Home,
  Linkedin,
  Mail,
  Share2,
} from "lucide-react";
import { FiChevronRight } from "react-icons/fi";
import type { CompanyNewsItem, NewsBodyBlock } from "@/data/companyNews";
import {
  formatCompanyNewsDate,
  newsReferenceLabel,
  normalizeNewsBody,
  newsBodyPlainText,
  stripEmbeddedRelatedPosts,
} from "@/data/companyNews";
import { cn } from "@/lib/utils";

function estimateReadingMinutes(body: NewsBodyBlock[]): number {
  const words = newsBodyPlainText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function FullArticleDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden>
      <span className="h-px flex-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Full article
      </span>
      <span className="h-px flex-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}

function isSkippableBodyBlock(block: NewsBodyBlock): boolean {
  if (block.type === "paragraph") {
    const text = block.text.trim();
    if (!text) return true;
    if (text.toLowerCase() === "full article") return true;
  }
  if (block.type === "heading" && block.text.trim().toLowerCase() === "full article") return true;
  return false;
}

function NewsBodyBlockView({ block }: { block: NewsBodyBlock }) {
  if (block.type === "heading") {
    return (
      <h2 className="mt-10 scroll-mt-28 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {block.text}
      </h2>
    );
  }
  if (block.type === "image") {
    return (
      <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
        <Image
          src={block.src}
          alt={block.alt ?? ""}
          width={1200}
          height={800}
          className="h-auto w-full"
          sizes="(max-width: 1280px) 100vw, 920px"
        />
      </figure>
    );
  }
  return <p className="text-[17px] leading-[1.75] text-muted-foreground">{block.text}</p>;
}

function shareTargets(title: string, url: string) {
  const encUrl = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    email: `mailto:?subject=${encTitle}&body=${encUrl}`,
  };
}

type Props = {
  article: CompanyNewsItem;
  shareUrl: string;
  related: CompanyNewsItem[];
  referenceIndex: number;
};

export default function NewsArticle({ article, shareUrl, related, referenceIndex }: Props) {
  const body = stripEmbeddedRelatedPosts(normalizeNewsBody(article.body)).filter(
    (block) => !isSkippableBodyBlock(block),
  );
  const readingMinutes = estimateReadingMinutes(body);
  const heroInBody = body.some((b) => b.type === "image" && b.src === article.imageSrc);
  const showStandaloneHero = Boolean(article.imageSrc) && !heroInBody;
  const referenceCode = referenceIndex >= 0 ? newsReferenceLabel(referenceIndex + 1) : "";
  const shares = shareTargets(article.title, shareUrl);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero band */}
      <div className="border-b border-border bg-secondary/40 pb-12 pt-28 md:pb-16 md:pt-36">
        <div className="container mx-auto max-w-7xl px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <FiChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <Link href="/#latest-updates" className="transition-colors hover:text-foreground">
              Latest updates
            </Link>
            <FiChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <span className="line-clamp-2 font-medium text-foreground">{article.title}</span>
          </nav>

          <header className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-3">
              <span className="h-px w-10 bg-linear-to-r from-primary to-primary/20" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{article.category}</span>
            </div>
            <h1 className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[clamp(2rem,4.2vw,3rem)]">
              {article.title}
            </h1>

            {article.summary.trim() ? (
              <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                {article.summary}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <time dateTime={article.publishedAt}>{formatCompanyNewsDate(article.publishedAt)}</time>
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{readingMinutes} min read</span>
              </span>
              {referenceCode ? (
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {referenceCode}
                </span>
              ) : null}
            </div>

          </header>
        </div>
      </div>

      {/* Article + sidebar */}
      <section className="relative pt-10 md:pt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" aria-hidden />

        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-12 xl:gap-16">
            <article className="min-w-0 xl:col-span-8">
              {body.length > 0 || showStandaloneHero ? (
                <div className="space-y-6">
                  <FullArticleDivider />

                  {showStandaloneHero ? (
                    <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                      <Image
                        src={article.imageSrc}
                        alt={article.title}
                        width={1200}
                        height={630}
                        className="h-auto w-full"
                        sizes="(max-width: 1280px) 100vw, 920px"
                        priority
                      />
                    </div>
                  ) : null}

                  {body.map((block, index) => (
                    <NewsBodyBlockView key={index} block={block} />
                  ))}
                </div>
              ) : null}

              {article.cta ? (
                <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
                  <p className="text-sm font-medium text-muted-foreground">Recommended next step</p>
                  <Link
                    href={article.cta.href}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {article.cta.label}
                  </Link>
                </div>
              ) : null}

              <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-border pt-10">
                <Link
                  href="/#latest-updates"
                  className={cn(
                    "group relative inline-flex min-h-[48px] items-center gap-3 overflow-hidden rounded-full pl-2 pr-6",
                    "bg-linear-to-br from-primary via-[hsl(43_78%_50%)] to-[hsl(38_72%_44%)]",
                    "text-sm font-bold tracking-tight text-primary-foreground shadow-[0_8px_28px_-6px_hsl(42_72%_40%/0.65)]",
                    "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
                    "transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_hsl(42_72%_38%/0.55)] hover:brightness-[1.03] active:translate-y-0 active:brightness-100",
                  )}
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/15 shadow-inner ring-1 ring-white/25">
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
                  </span>
                  <span className="relative whitespace-nowrap">Latest updates</span>
                  <ArrowRight
                    className="relative h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/"
                  className={cn(
                    "inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-foreground/10 bg-card px-6 py-2.5",
                    "text-sm font-semibold text-foreground shadow-sm",
                    "transition-all duration-200 hover:border-primary/35 hover:bg-primary/6 hover:text-primary hover:shadow-md",
                  )}
                >
                  <Home className="h-4 w-4 opacity-80" aria-hidden />
                  Home
                </Link>
              </div>
            </article>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:col-span-4 xl:self-start">
              <div className="relative overflow-hidden rounded-2xl border border-border/90 bg-card shadow-[0_14px_44px_-18px_rgba(15,23,42,0.14)] ring-1 ring-black/4">
                <div className="pointer-events-none absolute -left-6 -top-12 h-28 w-28 rounded-full bg-primary/9 blur-2xl" aria-hidden />
                <div className="relative space-y-5 p-6">
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/22 to-primary/8 shadow-inner ring-1 ring-primary/20">
                      <Share2 className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[15px] font-semibold tracking-tight text-foreground">Share this update</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Copy the buzz — send this story to your team or post it on social.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 rounded-xl bg-secondary/70 p-2 ring-1 ring-border/70">
                    <a
                      href={shares.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtnLinkedin}
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="h-[18px] w-[18px]" aria-hidden />
                    </a>
                    <a
                      href={shares.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtnX}
                      aria-label="Share on X"
                    >
                      <span className="text-[13px] font-bold leading-none tracking-tight">𝕏</span>
                    </a>
                    <a
                      href={shares.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={shareBtnFacebook}
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-[18px] w-[18px]" aria-hidden />
                    </a>
                    <a href={shares.email} className={shareBtnMail} aria-label="Share by email">
                      <Mail className="h-[18px] w-[18px]" aria-hidden />
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/90 bg-card p-6 shadow-[0_10px_36px_-16px_rgba(15,23,42,0.12)] ring-1 ring-black/3">
                <p className="text-sm font-semibold text-foreground">Related updates</p>
                <p className="mt-1 text-xs text-muted-foreground">More stories from Petrosphere</p>
                <ul className="mt-5 space-y-4">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/news/${item.slug}`}
                        className="group flex gap-4 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary/50"
                      >
                        <div className="relative aspect-16/10 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.imageSrc}
                            alt=""
                            role="presentation"
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="112px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatCompanyNewsDate(item.publishedAt)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

const shareBtnBase =
  "inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-lg border bg-card text-foreground shadow-sm transition-all hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm";

const shareBtnLinkedin =
  shareBtnBase +
  " border-[#0A66C2]/25 hover:border-[#0A66C2]/55 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]";

const shareBtnX =
  shareBtnBase + " border-border hover:border-foreground/25 hover:bg-foreground/[0.06] hover:text-foreground";

const shareBtnFacebook =
  shareBtnBase +
  " border-[#1877F2]/25 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-[#1877F2]";

const shareBtnMail =
  shareBtnBase + " border-primary/30 hover:border-primary/55 hover:bg-primary/12 hover:text-primary";
