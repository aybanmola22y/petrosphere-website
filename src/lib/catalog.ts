import type { Course, TrainingSession } from "@/data/mockData";
import { courseCategories, courses as mockCourses } from "@/data/mockData";
import {
  buildCollisionBaseSlugSet,
  courseSlugFromTms,
  disambiguateCatalogCourseSlug,
  getEffectiveCatalogRowBaseSlug,
  inferCatalogCategorySlug,
  isExcludedTmsTestCourseRow,
} from "@/lib/tms";
import {
  enrichCourseCopyFromTms,
  isTmsMarketingPlaceholder,
  syntheticPedagogyForOrphanTms,
} from "@/lib/synthetic-course-copy";

/** DOLE first-aid programs: keep seed titles ("EFAT — …") so cards match nav branding. */
const FIRST_AID_CANONICAL_SLUGS = new Set(["efat", "ofat", "sfat"]);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TMS_SCHEMA = process.env.NEXT_PUBLIC_TMS_SCHEMA || "tms";

const LEVELS: Course["level"][] = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const DEFAULT_OBJECTIVES = [
  "Understand the program scope and applicable requirements.",
  "Apply core concepts in practical workplace scenarios.",
  "Prepare for assessment or certification where applicable.",
];

const DEFAULT_AUDIENCE = [
  "Professionals seeking structured, accredited training.",
  "Teams responsible for compliance, safety, or operations.",
];

function rowStr(row: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function rowStringArray(row: Record<string, unknown>, ...keys: string[]): string[] | undefined {
  for (const k of keys) {
    const v = row[k];
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v as string[];
    if (typeof v === "string") {
      try {
        const j = JSON.parse(v) as unknown;
        if (Array.isArray(j) && j.every((x) => typeof x === "string")) return j as string[];
      } catch {
        /* ignore */
      }
    }
  }
  return undefined;
}

function parseLevel(v: unknown): Course["level"] {
  if (typeof v !== "string") return "All Levels";
  return LEVELS.includes(v as Course["level"]) ? (v as Course["level"]) : "All Levels";
}

function categoryLabelForSlug(categorySlug: string): string {
  return courseCategories.find((c) => c.slug === categorySlug)?.label ?? categorySlug.toUpperCase();
}

export function mapCourseRowToCourse(
  row: Record<string, unknown>,
  collisionBases: Set<string>,
): Course {
  const codeName = rowStr(row, "name", "code", "course_code") ?? "";
  const title = rowStr(row, "title", "name") ?? "Training program";
  const rawSummary = rowStr(row, "summary", "short_description", "description", "subtitle");
  const rawOverview = rowStr(row, "overview", "body", "long_description", "details");
  const rawSummaryTrim = rawSummary?.trim() ?? "";
  const rawOverviewTrim = rawOverview?.trim() ?? "";

  const catalogPlaceholder =
    "View the full program outline and learning outcomes on the course page.";
  const summary = rawSummaryTrim || catalogPlaceholder;
  const overview = rawOverviewTrim || rawSummaryTrim || catalogPlaceholder;

  const baseSlug = getEffectiveCatalogRowBaseSlug(row);
  const rowId = rowStr(row, "id");
  const slug = disambiguateCatalogCourseSlug(baseSlug, rowId, collisionBases);

  const categorySlugRaw = rowStr(row, "category_slug", "categorySlug", "category");
  const categorySlug =
    categorySlugRaw && !categorySlugRaw.includes(" ")
      ? categorySlugRaw.toLowerCase()
      : inferCatalogCategorySlug(title, codeName, slug);

  const programGroup =
    rowStr(row, "program_group", "programGroup", "program_group_name") ?? undefined;

  const duration = rowStr(row, "duration", "duration_label", "duration_text") ?? "—";
  const schedule = rowStr(row, "schedule", "schedule_label", "cohort", "intake") ?? "Rolling / TBA";
  const level = parseLevel(row["level"] ?? row["skill_level"]);

  const objectives = rowStringArray(row, "objectives", "learning_outcomes", "outcomes") ?? DEFAULT_OBJECTIVES;
  const audience = rowStringArray(row, "audience", "target_audience", "who_should_attend") ?? DEFAULT_AUDIENCE;

  const id = rowStr(row, "id") ?? codeName ?? slug;

  const hadDedicatedOverview =
    rawOverviewTrim.length > 0 && !isTmsMarketingPlaceholder(rawOverviewTrim);

  const base: Course = {
    id,
    title,
    slug,
    category: categoryLabelForSlug(categorySlug),
    categorySlug,
    programGroup,
    summary,
    duration,
    level,
    schedule,
    objectives,
    audience,
    overview,
  };

  return enrichCourseCopyFromTms(base, {
    codeHint: codeName || undefined,
    hadDedicatedOverview: hadDedicatedOverview,
  });
}

function usesDefaultObjectives(objectives: string[]): boolean {
  return (
    objectives.length === DEFAULT_OBJECTIVES.length &&
    objectives.every((line, i) => line === DEFAULT_OBJECTIVES[i])
  );
}

function usesDefaultAudience(audience: string[]): boolean {
  return (
    audience.length === DEFAULT_AUDIENCE.length &&
    audience.every((line, i) => line === DEFAULT_AUDIENCE[i])
  );
}

function findMockSeedForCourse(course: Course): Course | undefined {
  const slugRoot = course.slug.split("--")[0] ?? course.slug;
  return mockCourses.find((m) => {
    if (m.slug === course.slug) return true;
    if (m.slug === slugRoot) return true;
    if (course.slug.startsWith(`${m.slug}--`)) return true;
    return false;
  });
}

/**
 * Layer mock seeds + topic-aware pedagogy on TMS rows so cards and detail pages stay readable
 * when Supabase omits marketing fields.
 */
export function expandTmsCourseForUi(course: Course): Course {
  let out: Course = { ...course };
  const seed = findMockSeedForCourse(out);

  if (seed) {
    if (isTmsMarketingPlaceholder(out.summary)) out = { ...out, summary: seed.summary };
    if (isTmsMarketingPlaceholder(out.overview)) out = { ...out, overview: seed.overview };
    if (usesDefaultObjectives(out.objectives)) out = { ...out, objectives: seed.objectives };
    if (usesDefaultAudience(out.audience)) out = { ...out, audience: seed.audience };
    if (out.duration === "—" && seed.duration && seed.duration !== "—")
      out = { ...out, duration: seed.duration };
    if (out.level === "All Levels" && seed.level && seed.level !== "All Levels")
      out = { ...out, level: seed.level };
    if (!out.programGroup?.trim() && seed.programGroup?.trim())
      out = { ...out, programGroup: seed.programGroup };
    if (
      (out.schedule === "Rolling / TBA" || !out.schedule.trim()) &&
      seed.schedule &&
      seed.schedule !== "Rolling / TBA"
    ) {
      out = { ...out, schedule: seed.schedule };
    }
  }

  out = enrichCourseCopyFromTms(out);

  const ped = syntheticPedagogyForOrphanTms(out);
  if (usesDefaultObjectives(out.objectives)) {
    out = { ...out, objectives: ped.objectives, audience: ped.audience };
  }
  if (usesDefaultAudience(out.audience) && !usesDefaultObjectives(out.objectives)) {
    out = { ...out, audience: ped.audience };
  }
  if (out.duration === "—") {
    out = { ...out, duration: ped.duration };
  }

  const slugRoot = out.slug.split("--")[0] ?? out.slug;
  const seedForTitle = findMockSeedForCourse(out);
  if (seedForTitle && FIRST_AID_CANONICAL_SLUGS.has(slugRoot)) {
    out = { ...out, title: seedForTitle.title };
  }

  return out;
}

export async function fetchCatalogCourses(): Promise<Course[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?select=*&order=title.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "accept-profile": TMS_SCHEMA,
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.warn(`fetchCatalogCourses: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) return [];

    const rows = data
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .filter((row) => !isExcludedTmsTestCourseRow(row));
    const collisionBases = buildCollisionBaseSlugSet(rows);

    const seenIds = new Set<string>();
    const out: Course[] = [];
    for (const item of rows) {
      const course = mapCourseRowToCourse(item, collisionBases);
      if (seenIds.has(course.id)) continue;
      seenIds.add(course.id);
      out.push(course);
    }
    return out;
  } catch (e) {
    console.warn("fetchCatalogCourses failed", e);
    return [];
  }
}

/**
 * Programs offered outside TMS (no Supabase row): merge canonical seeds so /courses and nav links resolve.
 * Extend this set when similar gaps appear.
 */
const SUPPLEMENT_FROM_SEEDS_SLUGS = new Set(["efat", "ofat", "sfat"]);

function remoteHasSeedEquivalent(remote: Course[], seedSlug: string): boolean {
  return remote.some((r) => {
    const base = r.slug.split("--")[0] ?? r.slug;
    if (base === seedSlug || r.slug.startsWith(`${seedSlug}--`)) return true;
    return courseSlugFromTms(r.title, base) === seedSlug;
  });
}

/** Belt-and-suspenders: drop QA-only titles if they slip through (e.g. stale cache). */
function filterExcludedCatalogCourses(courses: Course[]): Course[] {
  return courses.filter((c) => c.title.trim().toLowerCase() !== "sample course");
}

/** Prefer Supabase list when non-empty; append seed-only rows TMS omits; else full mock catalog. */
export function resolveCatalogList(remote: Course[]): Course[] {
  let base: Course[];
  if (remote.length === 0) {
    base = [...mockCourses];
  } else {
    const extras = mockCourses.filter(
      (m) =>
        SUPPLEMENT_FROM_SEEDS_SLUGS.has(m.slug) &&
        !remoteHasSeedEquivalent(remote, m.slug),
    );
    base = filterExcludedCatalogCourses([...remote, ...extras]);
  }
  return base.map(expandTmsCourseForUi);
}

function normalizeCourseSlugParam(slug: string): string {
  const raw = slug.trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

/**
 * Resolve a course from the active catalog. Handles URL decoding, case, and TMS
 * `base--id` slugs when the request uses only the base segment (or vice versa).
 */
export function resolveCourseBySlug(slug: string, list: Course[]): Course | undefined {
  const n = normalizeCourseSlugParam(slug);
  if (!n) return undefined;

  let course = list.find((c) => c.slug === n || c.slug.toLowerCase() === n);
  if (course) return course;

  const base = n.split("--")[0] ?? n;
  if (base) {
    const candidates = list.filter((c) => {
      const cb = c.slug.split("--")[0] ?? c.slug;
      return c.slug === base || c.slug.startsWith(`${base}--`) || cb === base;
    });
    if (candidates.length === 1) return candidates[0];
    if (candidates.length > 1) {
      const exact = candidates.find((c) => c.slug === n);
      if (exact) return exact;
      if (n === base) return candidates[0];
    }
  }

  const s = n;
  if (s.includes("bosh001") || s.includes("so1")) return list.find((c) => c.slug === "bosh-so1");
  if (s.includes("bosh002") || s.includes("so2")) return list.find((c) => c.slug === "bosh-so2");
  if (s.includes("cosh")) return list.find((c) => c.slug === "cosh");
  if (s.includes("mesh") || s.includes("8-hour")) return list.find((c) => c.slug === "mesh");
  if (s.includes("efat")) return list.find((c) => c.slug === "efat");
  if (s.includes("ofat")) return list.find((c) => c.slug === "ofat");
  if (s.includes("sfat")) return list.find((c) => c.slug === "sfat");

  return undefined;
}

const SCHEDULE_CARD_STUB_SUMMARY =
  "View the full program outline and learning outcomes on the course page.";

/**
 * Schedule grid cards: always return display-ready copy (summary, duration, level).
 * Uses fuzzy catalog match, re-applies {@link expandTmsCourseForUi}, and falls back to a
 * session-only stub when the catalog row is missing so placeholders never leak to the UI.
 */
export function resolveCourseForScheduleCard(
  session: TrainingSession,
  catalogCourses: Course[],
): Course {
  const resolved = resolveCourseBySlug(session.courseSlug, catalogCourses);
  if (resolved) {
    return expandTmsCourseForUi({ ...resolved });
  }

  const stub: Course = {
    id: `run-${session.id}`,
    title: session.courseTitle,
    slug: session.courseSlug,
    category: categoryLabelForSlug(session.categorySlug),
    categorySlug: session.categorySlug,
    programGroup: undefined,
    summary: SCHEDULE_CARD_STUB_SUMMARY,
    duration: "—",
    level: "All Levels",
    schedule: "Rolling / TBA",
    objectives: [...DEFAULT_OBJECTIVES],
    audience: [...DEFAULT_AUDIENCE],
    overview: SCHEDULE_CARD_STUB_SUMMARY,
  };
  return expandTmsCourseForUi(stub);
}

export async function getCourseForSlug(slug: string): Promise<Course | undefined> {
  const remote = await fetchCatalogCourses();
  const list = resolveCatalogList(remote);
  return resolveCourseBySlug(slug, list);
}
