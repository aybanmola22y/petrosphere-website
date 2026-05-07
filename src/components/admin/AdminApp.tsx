"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Clapperboard,
  FileText,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Newspaper,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import type { CompanyNewsItem } from "@/data/companyNews";
import type { StudentVideoTestimonial } from "@/data/siteMarketingDefaults";
import type { SiteContentSnapshot } from "@/types/site-content";
import { SITE_CONTENT_LOCAL_FILENAME } from "@/constants/site-content-file";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AdminTab = "overview" | "news" | "videos" | "stats";

const TAB_TITLE: Record<AdminTab, string> = {
  overview: "Overview",
  news: "Company posts",
  videos: "Video testimonials",
  stats: "Homepage stats",
};

const NEWS_CATEGORIES = ["CSR", "HSE NEWS", "NEWS", "PARTNERSHIP", "TRAINING"] as const;

function cloneSnapshot(s: SiteContentSnapshot): SiteContentSnapshot {
  return JSON.parse(JSON.stringify(s)) as SiteContentSnapshot;
}

function validateSnapshot(s: SiteContentSnapshot): string | null {
  const slugs = new Set<string>();
  for (const item of s.news) {
    if (slugs.has(item.slug)) return `Duplicate slug: ${item.slug}`;
    slugs.add(item.slug);
  }
  const ids = new Set<string>();
  for (const v of s.videoTestimonials) {
    if (ids.has(v.id)) return `Duplicate testimonial id: ${v.id}`;
    ids.add(v.id);
  }
  return null;
}

function blankNews(): CompanyNewsItem {
  const id = `news-${Date.now()}`;
  return {
    id,
    slug: id,
    category: "NEWS",
    title: "New story title",
    publishedAt: new Date().toISOString().slice(0, 10),
    summary: "Short summary for cards and SEO.",
    imageSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    body: ["Opening paragraph for the article body.", "Second paragraph—add detail, quotes, or outcomes."],
    external: false,
  };
}

function blankVideo(): StudentVideoTestimonial {
  return {
    id: `sv-${Date.now()}`,
    studentName: "Full name",
    credential: "Program · Location",
    summary: "Optional short quote shown next to the embed.",
    youtubeVideoId: "ScMzIvxBSi4",
    posterSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=960&q=80",
  };
}

export function AdminApp({ initial }: { initial: SiteContentSnapshot }) {
  const router = useRouter();

  const initialKey = JSON.stringify(initial);
  const [baseline, setBaseline] = useState<SiteContentSnapshot>(() => cloneSnapshot(initial));
  const [data, setData] = useState<SiteContentSnapshot>(() => cloneSnapshot(initial));
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [query, setQuery] = useState("");
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(() => initial.news[0]?.id ?? null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(() => initial.videoTestimonials[0]?.id ?? null);
  const [confirmDelete, setConfirmDelete] = useState<null | { kind: "news" | "video"; id: string }>(null);
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false);

  useEffect(() => {
    const snap = JSON.parse(initialKey) as SiteContentSnapshot;
    const c = cloneSnapshot(snap);
    setBaseline(c);
    setData(c);
  }, [initialKey]);

  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(baseline), [data, baseline]);

  useEffect(() => {
    if (!selectedNewsId && data.news.length) setSelectedNewsId(data.news[0]!.id);
    if (selectedNewsId && !data.news.some((n) => n.id === selectedNewsId)) {
      setSelectedNewsId(data.news[0]?.id ?? null);
    }
  }, [data.news, selectedNewsId]);

  useEffect(() => {
    if (!selectedVideoId && data.videoTestimonials.length) setSelectedVideoId(data.videoTestimonials[0]!.id);
    if (selectedVideoId && !data.videoTestimonials.some((v) => v.id === selectedVideoId)) {
      setSelectedVideoId(data.videoTestimonials[0]?.id ?? null);
    }
  }, [data.videoTestimonials, selectedVideoId]);

  const selectedNewsIndex = selectedNewsId ? data.news.findIndex((n) => n.id === selectedNewsId) : -1;
  const selectedNews = selectedNewsIndex >= 0 ? data.news[selectedNewsIndex] : null;
  const selectedVideoIndex = selectedVideoId ? data.videoTestimonials.findIndex((v) => v.id === selectedVideoId) : -1;
  const selectedVideo = selectedVideoIndex >= 0 ? data.videoTestimonials[selectedVideoIndex] : null;

  const filteredNews = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.news;
    return data.news.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.slug.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });
  }, [data.news, query]);

  const filteredVideos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.videoTestimonials;
    return data.videoTestimonials.filter((v) => {
      return (
        v.studentName.toLowerCase().includes(q) ||
        v.credential.toLowerCase().includes(q) ||
        v.youtubeVideoId.toLowerCase().includes(q)
      );
    });
  }, [data.videoTestimonials, query]);

  async function save() {
    const err = validateSnapshot(data);
    if (err) {
      toast({ title: "Fix before saving", description: err, variant: "destructive" });
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseline, data }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast({
          title: "Save failed",
          description: j.error ?? `HTTP ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      setBaseline(cloneSnapshot(data));
      toast({ title: "Saved", description: `Wrote ${SITE_CONTENT_LOCAL_FILENAME} at the project root.` });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function updateNews(i: number, patch: Partial<CompanyNewsItem>) {
    setData((d) => {
      const news = [...d.news];
      news[i] = { ...news[i], ...patch };
      return { ...d, news };
    });
  }

  function removeNews(i: number) {
    setData((d) => ({ ...d, news: d.news.filter((_, idx) => idx !== i) }));
  }

  function updateVideo(i: number, patch: Partial<StudentVideoTestimonial>) {
    setData((d) => {
      const videoTestimonials = [...d.videoTestimonials];
      videoTestimonials[i] = { ...videoTestimonials[i], ...patch };
      return { ...d, videoTestimonials };
    });
  }

  function removeVideo(i: number) {
    setData((d) => ({ ...d, videoTestimonials: d.videoTestimonials.filter((_, idx) => idx !== i) }));
  }

  function updateStat(i: number, patch: { value?: string; label?: string }) {
    setData((d) => {
      const stats = [...d.stats];
      stats[i] = { ...stats[i], ...patch };
      return { ...d, stats };
    });
  }

  function addPost() {
    const item = blankNews();
    setData((d) => ({ ...d, news: [item, ...d.news] }));
    setSelectedNewsId(item.id);
  }

  function addTestimonial() {
    const item = blankVideo();
    setData((d) => ({ ...d, videoTestimonials: [item, ...d.videoTestimonials] }));
    setSelectedVideoId(item.id);
  }

  function requestDelete(kind: "news" | "video", id: string) {
    setConfirmDelete({ kind, id });
  }

  function performDelete() {
    if (!confirmDelete) return;
    if (confirmDelete.kind === "news") {
      const idx = data.news.findIndex((n) => n.id === confirmDelete.id);
      if (idx >= 0) removeNews(idx);
    } else {
      const idx = data.videoTestimonials.findIndex((v) => v.id === confirmDelete.id);
      if (idx >= 0) removeVideo(idx);
    }
    setConfirmDelete(null);
  }

  async function uploadNewsImage(file: File) {
    setUploadingNewsImage(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast({
          title: "Upload failed",
          description: j.error ?? `HTTP ${res.status}`,
          variant: "destructive",
        });
        return null;
      }
      const j = (await res.json()) as { url?: string };
      if (!j.url) return null;
      toast({ title: "Uploaded", description: "Image added to /public/uploads/news/." });
      return j.url;
    } finally {
      setUploadingNewsImage(false);
    }
  }

  return (
    <div className="min-h-svh text-foreground admin-surface">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-5">
        <header className="flex items-center justify-between gap-4 p-3 min-h-[84px] backdrop-blur admin-card admin-card-strong overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid size-10 place-items-center rounded-2xl bg-[#00044a] shadow-sm overflow-hidden">
              <img
                src="/weblogo.ico"
                alt="Petrosphere"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold admin-title tracking-tight">Petrosphere</div>
              <div className="text-[11px] admin-muted">Admin dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end min-w-max">
            <nav className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {([
                { id: "overview", label: "Dashboard", icon: LayoutDashboard },
                { id: "news", label: "Posts", icon: Newspaper },
                { id: "videos", label: "Testimonials", icon: Clapperboard },
                { id: "stats", label: "Metrics", icon: BarChart3 },
              ] as const).map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "shrink-0 h-9 rounded-full px-3 shadow-none",
                      active
                        ? "bg-secondary text-foreground ring-1 ring-black/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-[220px] sm:w-[260px] md:w-[260px] lg:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === "news" ? "Search posts…" : tab === "videos" ? "Search testimonials…" : "Search…"}
                  className="h-10 rounded-full border-black/5 bg-white pl-9 shadow-sm"
                />
              </div>

              <Badge
                variant={dirty ? "outline" : "secondary"}
                className={cn(
                  "rounded-full px-3 py-2 text-xs shadow-sm",
                  dirty
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-800"
                    : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
                )}
              >
                {dirty ? "Unsaved" : "Saved"}
              </Badge>

              {tab === "news" ? (
              <Button variant="outline" size="sm" onClick={addPost} disabled={pending} className="shrink-0 rounded-full border-black/10 bg-white shadow-sm">
                  <Plus className="size-4" /> Add post
                </Button>
              ) : null}
              {tab === "videos" ? (
              <Button variant="outline" size="sm" onClick={addTestimonial} disabled={pending} className="shrink-0 rounded-full border-black/10 bg-white shadow-sm">
                  <Plus className="size-4" /> Add testimonial
                </Button>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setData(cloneSnapshot(baseline))}
                disabled={!dirty || pending}
                className="shrink-0 rounded-full"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={pending || !dirty}
                className="shrink-0 rounded-full shadow-sm"
              >
                {pending ? "Saving…" : "Save changes"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="shrink-0 rounded-full">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">View public site</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mt-6">
          <div className="flex w-full flex-1 flex-col gap-6">
            {tab === "overview" ? (
              <ScrollArea className="h-full">
                <div className="space-y-6 pr-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h2>
                      <p className="mt-1 text-sm text-muted-foreground">A clean view of content, status, and recent edits.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricTile
                      title="Company posts"
                      value={String(data.news.length)}
                      delta={+10}
                      icon={<Newspaper className="size-4" />}
                      onClick={() => setTab("news")}
                      cta="View posts"
                    />
                    <MetricTile
                      title="Video testimonials"
                      value={String(data.videoTestimonials.length)}
                      delta={+6}
                      icon={<Clapperboard className="size-4" />}
                      onClick={() => setTab("videos")}
                      cta="View testimonials"
                    />
                    <MetricTile
                      title="Homepage metrics"
                      value={String(data.stats.length)}
                      delta={0}
                      icon={<BarChart3 className="size-4" />}
                      onClick={() => setTab("stats")}
                      cta="Edit metrics"
                    />
                    <MetricTile
                      title="Draft state"
                      value={dirty ? "Unsaved" : "Saved"}
                      delta={dirty ? -8 : +4}
                      icon={<CheckCircle2 className="size-4" />}
                      onClick={() => {}}
                      cta="Review changes"
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                    <Card className="overflow-hidden rounded-3xl border-black/5 bg-white shadow-[0_10px_30px_-20px_rgba(16,24,40,0.35)]">
                      <CardHeader className="border-b border-black/5 pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-base tracking-tight">Recent posts</CardTitle>
                            <CardDescription>Keep track of your latest updates.</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="rounded-full border-black/10 bg-white shadow-sm" onClick={addPost}>
                              <Plus className="size-4" /> New post
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full">
                              View all →
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[420px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-4">Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="pr-4 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.news
                                .slice()
                                .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
                                .slice(0, 6)
                                .map((item) => (
                                  <TableRow key={item.id} className="cursor-pointer" onClick={() => setTab("news")}>
                                    <TableCell className="pl-4">
                                      <div className="font-medium text-foreground">{item.title}</div>
                                      <div className="mt-1 text-xs text-muted-foreground">/news/{item.slug}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground tabular-nums">{item.publishedAt}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className="rounded-full bg-black/5 text-foreground">
                                        {item.category}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="pr-4 text-right">
                                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setTab("news")}>
                                        Edit
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <div className="grid gap-4">
                      <Card className="overflow-hidden rounded-3xl border-black/5 bg-white shadow-[0_10px_30px_-20px_rgba(16,24,40,0.35)]">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base tracking-tight">Publishing health</CardTitle>
                              <CardDescription>Status of edits & content.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="rounded-full bg-black/5 text-foreground">
                              Weekly
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Saved content</span>
                              <span className="font-medium text-foreground">{dirty ? "92%" : "100%"}</span>
                            </div>
                            <Progress value={dirty ? 92 : 100} className="bg-black/5 [&>div]:bg-[#00044a]" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <MiniStat label="Unsaved" value={dirty ? "1" : "0"} tone="warn" />
                            <MiniStat label="Published" value={String(data.news.length)} tone="ok" />
                            <MiniStat label="Videos" value={String(data.videoTestimonials.length)} tone="neutral" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden rounded-3xl border-black/5 bg-[#2f6bff] text-white shadow-[0_20px_50px_-30px_rgba(47,107,255,0.75)]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base tracking-tight">Storage usage</CardTitle>
                          <CardDescription className="text-white/80">Dummy indicator for assets & embeds.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-[180px_1fr]">
                          <div className="relative grid aspect-square w-[180px] place-items-center rounded-3xl bg-white/10">
                            <div
                              className="absolute inset-4 rounded-full"
                              style={{
                                background:
                                  "conic-gradient(rgba(255,255,255,0.95) 0 25%, rgba(255,255,255,0.18) 25% 100%)",
                              }}
                            />
                            <div className="relative grid size-[120px] place-items-center rounded-full bg-[#2f6bff] shadow-inner">
                              <div className="text-center">
                                <div className="text-3xl font-semibold tabular-nums">25%</div>
                                <div className="text-xs text-white/80">used</div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <StorageRow label="Posts" value="12%" />
                            <StorageRow label="Images" value="7%" />
                            <StorageRow label="Video links" value="6%" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : null}

            {tab === "news" ? (
              <div className="grid h-full min-h-[calc(100svh-10rem)] gap-4 lg:grid-cols-[420px_1fr]">
                <Card className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <CardHeader className="border-b bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">Posts</CardTitle>
                        <CardDescription>Pick a story to edit.</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Settings2 className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={addPost}>
                            <Plus className="size-4" /> Add post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQuery("")}>Clear search</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="relative mt-3">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, slug, category…" className="h-9 pl-9" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100svh-16.5rem)]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[1%] text-right"> </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNews.map((item) => {
                            const active = item.id === selectedNewsId;
                            return (
                              <TableRow key={item.id} data-state={active ? "selected" : undefined} className="cursor-pointer" onClick={() => setSelectedNewsId(item.id)}>
                                <TableCell className="py-3">
                                  <div className="min-w-0">
                                    <div className="whitespace-normal wrap-break-word font-medium text-foreground">
                                      {item.title || "Untitled"}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <Badge variant="secondary">{item.category}</Badge>
                                      <span className="text-xs text-muted-foreground tabular-nums">{item.publishedAt}</span>
                                    </div>
                                    <div className="mt-2 whitespace-normal break-all text-xs text-muted-foreground">
                                      /news/{item.slug}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <RowActions onDelete={() => requestDelete("news", item.id)} onSelect={() => setSelectedNewsId(item.id)} />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <CardHeader className="border-b bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base whitespace-normal wrap-break-word">
                          {selectedNews?.title || "Select a post"}
                        </CardTitle>
                        <CardDescription className="whitespace-normal break-all">
                          {selectedNews
                            ? `Editing /news/${selectedNews.slug}`
                            : "Choose a post from the list."}
                        </CardDescription>
                      </div>
                      {selectedNews ? (
                        <Button variant="destructive" size="sm" onClick={() => requestDelete("news", selectedNews.id)}>
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {selectedNews ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Title" hint="Shown on cards and the article page.">
                              <Input value={selectedNews.title} onChange={(e) => updateNews(selectedNewsIndex, { title: e.target.value })} />
                            </Field>
                            <Field label="Slug" hint="Used in the URL. Must be unique.">
                              <Input value={selectedNews.slug} onChange={(e) => updateNews(selectedNewsIndex, { slug: e.target.value })} />
                            </Field>
                            <Field label="Category">
                              <select
                                className={cn(
                                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm",
                                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                                )}
                                value={selectedNews.category}
                                onChange={(e) => updateNews(selectedNewsIndex, { category: e.target.value as CompanyNewsItem["category"] })}
                              >
                                {NEWS_CATEGORIES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Published date" hint="Format: YYYY-MM-DD">
                              <Input value={selectedNews.publishedAt} onChange={(e) => updateNews(selectedNewsIndex, { publishedAt: e.target.value })} />
                            </Field>
                            <Field label="Card image URL" className="sm:col-span-2" hint="Use a full image URL or /public path later.">
                              <Input value={selectedNews.imageSrc} onChange={(e) => updateNews(selectedNewsIndex, { imageSrc: e.target.value })} />
                              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs text-muted-foreground">
                                  Or upload from your computer (PNG/JPG/WebP/GIF/SVG up to 6MB).
                                </div>
                                <label className="inline-flex">
                                  <input
                                    type="file"
                                    accept="image/*,.ico"
                                    className="hidden"
                                    disabled={uploadingNewsImage}
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0];
                                      e.currentTarget.value = "";
                                      if (!f) return;
                                      const url = await uploadNewsImage(f);
                                      if (url) updateNews(selectedNewsIndex, { imageSrc: url });
                                    }}
                                  />
                                  <span
                                    className={cn(
                                      "inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-black/5 cursor-pointer",
                                      uploadingNewsImage && "opacity-60 cursor-not-allowed",
                                    )}
                                  >
                                    {uploadingNewsImage ? "Uploading…" : "Upload image"}
                                  </span>
                                </label>
                              </div>
                            </Field>
                            <Field label="Summary" className="sm:col-span-2" hint="Used on the grid card and metadata.">
                              <Textarea rows={3} value={selectedNews.summary} onChange={(e) => updateNews(selectedNewsIndex, { summary: e.target.value })} />
                            </Field>
                            <Field label="Article body" className="sm:col-span-2" hint="Separate paragraphs with a blank line.">
                              <Textarea
                                rows={10}
                                value={selectedNews.body.join("\n\n")}
                                onChange={(e) =>
                                  updateNews(selectedNewsIndex, {
                                    body: e.target.value
                                      .split(/\n\n+/)
                                      .map((p) => p.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </Field>

                            <div className="sm:col-span-2 rounded-xl border bg-card p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-foreground">External link</div>
                                  <div className="text-xs text-muted-foreground">If enabled, the card opens an outbound URL instead of /news.</div>
                                </div>
                                <input type="checkbox" className="size-4 rounded border-input" checked={Boolean(selectedNews.external)} onChange={(e) => updateNews(selectedNewsIndex, { external: e.target.checked })} />
                              </div>
                              {selectedNews.external ? (
                                <div className="mt-3">
                                  <Label className="text-xs font-medium text-muted-foreground">Outbound URL</Label>
                                  <Input className="mt-2" value={selectedNews.externalHref ?? ""} onChange={(e) => updateNews(selectedNewsIndex, { externalHref: e.target.value })} placeholder="https://" />
                                </div>
                              ) : null}
                            </div>

                            <Field label="Article CTA label (optional)">
                              <Input
                                value={selectedNews.cta?.label ?? ""}
                                onChange={(e) => updateNews(selectedNewsIndex, { cta: e.target.value ? { label: e.target.value, href: selectedNews.cta?.href ?? "/" } : undefined })}
                              />
                            </Field>
                            <Field label="Article CTA link (optional)">
                              <Input
                                value={selectedNews.cta?.href ?? ""}
                                onChange={(e) =>
                                  updateNews(selectedNewsIndex, {
                                    cta: selectedNews.cta?.label
                                      ? { label: selectedNews.cta.label, href: e.target.value || "/" }
                                      : e.target.value
                                        ? { label: "Learn more", href: e.target.value }
                                        : undefined,
                                  })
                                }
                              />
                            </Field>
                        </div>
                      ) : (
                        <EmptyState title="Select a post" description="Choose a story from the left panel, or create a new post." actionLabel="Add post" onAction={addPost} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {tab === "videos" ? (
              <div className="grid h-full min-h-[calc(100svh-10rem)] gap-4 lg:grid-cols-[420px_1fr]">
                <Card className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <CardHeader className="border-b bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">Testimonials</CardTitle>
                        <CardDescription>Homepage embed list.</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Settings2 className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={addTestimonial}>
                            <Plus className="size-4" /> Add testimonial
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQuery("")}>Clear search</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="relative mt-3">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, credential, YouTube ID…" className="h-9 pl-9" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100svh-16.5rem)]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-[1%] text-right"> </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVideos.map((item) => {
                            const active = item.id === selectedVideoId;
                            return (
                              <TableRow key={item.id} data-state={active ? "selected" : undefined} className="cursor-pointer" onClick={() => setSelectedVideoId(item.id)}>
                                <TableCell className="py-3">
                                  <div className="min-w-0">
                                    <div className="whitespace-normal wrap-break-word font-medium text-foreground">
                                      {item.studentName || "Untitled"}
                                    </div>
                                    <div className="mt-1 whitespace-normal wrap-break-word text-xs text-muted-foreground">
                                      {item.credential}
                                    </div>
                                    <div className="mt-2 whitespace-normal break-all text-xs text-muted-foreground">
                                      ID: {item.youtubeVideoId}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <RowActions onDelete={() => requestDelete("video", item.id)} onSelect={() => setSelectedVideoId(item.id)} />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl bg-white shadow-sm">
                  <CardHeader className="border-b bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base whitespace-normal wrap-break-word">
                          {selectedVideo?.studentName || "Select a testimonial"}
                        </CardTitle>
                        <CardDescription className="whitespace-normal break-all">
                          {selectedVideo
                            ? `YouTube ID: ${selectedVideo.youtubeVideoId}`
                            : "Choose one from the list."}
                        </CardDescription>
                      </div>
                      {selectedVideo ? (
                        <Button variant="destructive" size="sm" onClick={() => requestDelete("video", selectedVideo.id)}>
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {selectedVideo ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name">
                              <Input value={selectedVideo.studentName} onChange={(e) => updateVideo(selectedVideoIndex, { studentName: e.target.value })} />
                            </Field>
                            <Field label="Credential line">
                              <Input value={selectedVideo.credential} onChange={(e) => updateVideo(selectedVideoIndex, { credential: e.target.value })} />
                            </Field>
                            <Field label="YouTube video ID" className="sm:col-span-2" hint="From Share → Embed, e.g. ScMzIvxBSi4">
                              <Input value={selectedVideo.youtubeVideoId} onChange={(e) => updateVideo(selectedVideoIndex, { youtubeVideoId: e.target.value })} />
                            </Field>
                            <Field label="Poster image URL" className="sm:col-span-2">
                              <Input value={selectedVideo.posterSrc} onChange={(e) => updateVideo(selectedVideoIndex, { posterSrc: e.target.value })} />
                            </Field>
                            <Field label="Short summary / quote" className="sm:col-span-2">
                              <Textarea rows={4} value={selectedVideo.summary} onChange={(e) => updateVideo(selectedVideoIndex, { summary: e.target.value })} />
                            </Field>
                        </div>
                      ) : (
                        <EmptyState title="Select a testimonial" description="Choose an item from the left panel, or add a new testimonial." actionLabel="Add testimonial" onAction={addTestimonial} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {tab === "stats" ? (
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  <Card className="overflow-hidden rounded-3xl bg-white shadow-sm">
                    <CardHeader className="border-b bg-white">
                      <CardTitle className="text-base">Homepage KPI row</CardTitle>
                      <CardDescription>Displayed beneath featured programs.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
                      {data.stats.map((s, i) => (
                        <div key={`${s.label}-${i}`} className="rounded-2xl border bg-white p-4 shadow-xs ring-1 ring-black/5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Metric {i + 1}</span>
                            <Badge variant="outline" className="text-[10px]">
                              Home
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-3">
                            <Field label="Value">
                              <Input value={s.value} onChange={(e) => updateStat(i, { value: e.target.value })} />
                            </Field>
                            <Field label="Label">
                              <Input value={s.label} onChange={(e) => updateStat(i, { label: e.target.value })} />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            ) : null}
          </div>
        </main>

      <Dialog open={Boolean(confirmDelete)} onOpenChange={(o) => (!o ? setConfirmDelete(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              This will remove it from the public site after you click <strong>Save changes</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={performDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint ? <span className="text-[11px] text-muted-foreground/80">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  title,
  value,
  delta,
  icon,
  footerLabel,
  onFooterClick,
}: {
  title: string;
  value: string;
  delta?: number;
  icon: React.ReactNode;
  footerLabel?: string;
  onFooterClick?: () => void;
}) {
  const up = typeof delta === "number" ? delta >= 0 : null;
  return (
    <Card className="overflow-hidden rounded-3xl border-black/5 bg-white shadow-[0_10px_30px_-20px_rgba(16,24,40,0.35)]">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm text-muted-foreground">{title}</CardDescription>
          <span className="grid size-9 place-items-center rounded-2xl bg-black/5 text-foreground">
            {icon}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <CardTitle className="text-4xl font-semibold tracking-tight tabular-nums">{value}</CardTitle>
          {typeof delta === "number" ? (
            <Badge
              className={cn(
                "rounded-full px-2.5 py-1 text-xs shadow-sm",
                up ? "bg-lime-400/30 text-lime-700 border-lime-500/20" : "bg-red-400/20 text-red-700 border-red-500/20",
              )}
              variant="outline"
            >
              {up ? `+${delta}%` : `${delta}%`}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      {footerLabel ? (
        <button
          type="button"
          onClick={onFooterClick}
          className="flex w-full items-center justify-between border-t border-black/5 bg-black/2 px-5 py-3 text-sm font-medium text-foreground hover:bg-black/4"
        >
          <span>{footerLabel}</span>
          <span className="text-muted-foreground">→</span>
        </button>
      ) : null}
    </Card>
  );
}

const DONUT_COLORS = ["#111827", "rgba(17,24,39,0.20)", "rgba(17,24,39,0.35)", "rgba(17,24,39,0.10)"];

function overviewBars() {
  // Keep deterministic dummy values so the chart is stable.
  return [
    { name: "Jan", a: 3400, b: 5800 },
    { name: "Feb", a: 2900, b: 5200 },
    { name: "Mar", a: 4100, b: 6000 },
    { name: "Apr", a: 2500, b: 4800 },
    { name: "May", a: 3200, b: 5600 },
    { name: "Jun", a: 4500, b: 6400 },
  ];
}

function categoryDonut(items: CompanyNewsItem[]) {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
  const rows = Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  return rows.length ? rows : [{ name: "NEWS", value: 0 }];
}

function MetricTile({
  title,
  value,
  delta,
  icon,
  cta,
  onClick,
}: {
  title: string;
  value: string;
  delta: number;
  icon: React.ReactNode;
  cta: string;
  onClick: () => void;
}) {
  const up = delta >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full flex-col gap-3 rounded-3xl border border-black/5 bg-white p-5 text-left shadow-[0_10px_30px_-20px_rgba(16,24,40,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-28px_rgba(16,24,40,0.45)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">{value}</div>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm",
                up
                  ? "border-lime-500/20 bg-lime-400/30 text-lime-700"
                  : "border-red-500/20 bg-red-400/20 text-red-700",
              )}
            >
              {up ? `+${delta}%` : `${delta}%`}
            </span>
          </div>
        </div>
        <span className="grid size-10 place-items-center rounded-2xl bg-black/5 text-foreground">
          {icon}
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 text-sm font-medium text-foreground">
        <span className="text-muted-foreground group-hover:text-foreground">{cta}</span>
        <span className="text-muted-foreground">→</span>
      </div>
    </button>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "neutral";
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-black/0 px-3 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          tone === "ok" && "text-emerald-700",
          tone === "warn" && "text-amber-800",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function StorageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-sm tabular-nums text-white/80">{value}</div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-16 text-center shadow-xs ring-1 ring-black/5">
      <div className="grid size-12 place-items-center rounded-2xl border bg-muted/30 text-foreground">
        <FileText className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">
        <Button onClick={onAction}>
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

function RowActions({ onDelete, onSelect }: { onDelete: () => void; onSelect: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
