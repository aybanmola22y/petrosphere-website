import type { Course, TrainingSession } from "@/data/mockData";
import { courseCategories, courses as mockCourses } from "@/data/mockData";
import {
  courseSlugFromTms,
  disambiguateCatalogCourseSlug,
  getEffectiveCatalogRowBaseSlug,
  inferCatalogCategorySlug,
} from "@/lib/tms";
import {
  enrichCourseCopyFromTms,
  isTmsMarketingPlaceholder,
  syntheticPedagogyForOrphanTms,
} from "@/lib/synthetic-course-copy";
import { normalizeCourseTitle } from "@/lib/course-title";

export { normalizeCourseTitle } from "@/lib/course-title";

/** DOLE first-aid programs: keep seed titles ("EFAT — …") so cards match nav branding. */
const FIRST_AID_CANONICAL_SLUGS = new Set(["efat", "ofat", "sfat"]);

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
  const title = normalizeCourseTitle(rowStr(row, "title", "name") ?? "Training program");
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
  const inferredCategory = inferCatalogCategorySlug(title, codeName, slug);
  // Prefer title/code inference when TMS stores a coarse/wrong category (e.g. IV as DOLE).
  const categorySlug =
    inferredCategory !== "dole"
      ? inferredCategory
      : categorySlugRaw && !categorySlugRaw.includes(" ")
        ? categorySlugRaw.toLowerCase()
        : inferredCategory;

  const programGroup =
    rowStr(row, "program_group", "programGroup", "program_group_name") ?? undefined;

  const duration = rowStr(row, "duration", "duration_label", "duration_text") ?? "—";
  const schedule = rowStr(row, "schedule", "schedule_label", "cohort", "intake") ?? "Rolling / TBA";
  const level = parseLevel(row["level"] ?? row["skill_level"]);

  const objectives = rowStringArray(row, "objectives", "learning_outcomes", "outcomes") ?? DEFAULT_OBJECTIVES;
  const audience = rowStringArray(row, "audience", "target_audience", "who_should_attend") ?? DEFAULT_AUDIENCE;

  const id = rowStr(row, "id") ?? codeName ?? slug;
  const coverRaw = rowStr(row, "cover_image", "coverImage", "image_src", "imageSrc", "image_url");
  const imageSrc =
    coverRaw && (/^https?:\/\//i.test(coverRaw) || coverRaw.startsWith("/")) ? coverRaw : undefined;

  return {
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
    imageSrc,
  };
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

function isGenericCategoryDump(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("dole-relevant safety and health program designed for philippine workplaces") ||
    t.includes("focuses on clinical and pre-hospital skills for healthcare") ||
    t.includes("contributes toward continuing professional development for licensed") ||
    t.includes("interpret applicable osh rules and site-specific safety requirements") ||
    t.includes("frontline workers") && t.includes("safety officers")
  );
}

function isGenericDolePedagogy(course: Course): boolean {
  const obj = course.objectives.join(" ").toLowerCase();
  const aud = course.audience.join(" ").toLowerCase();
  return (
    obj.includes("interpret applicable osh rules") ||
    obj.includes("scenarios aligned with dole expectations") ||
    (aud.includes("frontline workers") && aud.includes("safety officers"))
  );
}

function findMockSeedForCourse(course: Course): Course | undefined {
  const slugRoot = course.slug.split("--")[0] ?? course.slug;
  const mapped = courseSlugFromTms(course.title, slugRoot);
  return mockCourses.find((m) => {
    if (m.slug === course.slug) return true;
    if (m.slug === slugRoot) return true;
    if (m.slug === mapped) return true;
    if (course.slug.startsWith(`${m.slug}--`)) return true;
    return false;
  });
}

/**
 * Layer mock seeds + topic-aware pedagogy on TMS rows so cards and detail pages stay readable
 * when Supabase omits marketing fields.
 */
export function expandTmsCourseForUi(course: Course): Course {
  let out: Course = { ...course, title: normalizeCourseTitle(course.title) };
  const seed = findMockSeedForCourse(out);
  const titleBlob = `${out.title} ${out.slug}`.toLowerCase();

  if (seed) {
    if (isTmsMarketingPlaceholder(out.summary) || isGenericCategoryDump(out.summary))
      out = { ...out, summary: seed.summary };
    if (isTmsMarketingPlaceholder(out.overview) || isGenericCategoryDump(out.overview))
      out = { ...out, overview: seed.overview };
    if (usesDefaultObjectives(out.objectives) || isGenericDolePedagogy(out)) {
      out = { ...out, objectives: seed.objectives, audience: seed.audience };
    } else if (usesDefaultAudience(out.audience)) {
      out = { ...out, audience: seed.audience };
    }
    if (out.duration === "—" && seed.duration && seed.duration !== "—")
      out = { ...out, duration: seed.duration };
    // Canonical durations (override stale TMS values).
    // BOSH SO1 = 1 day; BOSH SO2 & COSH = 4 days.
    if (
      seed.duration &&
      (seed.slug === "bosh-so1" || seed.slug === "bosh-so2" || seed.slug === "cosh")
    ) {
      out = { ...out, duration: seed.duration };
    }
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
    // Don't leave EMS/medical programs sitting under a wrong DOLE category dump.
    if (seed.categorySlug && seed.categorySlug !== out.categorySlug) {
      out = {
        ...out,
        categorySlug: seed.categorySlug,
        category: seed.category || categoryLabelForSlug(seed.categorySlug),
      };
    }
  }

  // NEBOSH is a UK awarding body — never leave it under DOLE.
  if (titleBlob.includes("nebosh") || titleBlob.includes("national examination board")) {
    out = {
      ...out,
      categorySlug: "cpd",
      category: categoryLabelForSlug("cpd"),
      summary:
        isTmsMarketingPlaceholder(out.summary) ||
        isGenericCategoryDump(out.summary) ||
        out.summary.toLowerCase().includes("dole") ||
        out.summary.toLowerCase().includes("nebosh-aligned")
          ? ""
          : out.summary,
      overview: "",
    };
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
function isTemporarilyHiddenCatalogCourse(course: Course): boolean {
  const title = course.title.trim().toLowerCase();
  const slug = course.slug.trim().toLowerCase();
  if (title === "sample course") return true;
  // Temporarily hidden from public catalog — restore when ready to promote again.
  if (title.includes("nebosh") || title.includes("national examination board")) return true;
  if (slug === "nebosh" || slug.includes("nebosh")) return true;
  return false;
}

function filterExcludedCatalogCourses(courses: Course[]): Course[] {
  return courses.filter((c) => !isTemporarilyHiddenCatalogCourse(c));
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
  if (s === "bosh-so1" || s.includes("bosh-so1") || s.includes("boshso1") || s.includes("bosh001")) {
    return (
      list.find((c) => c.slug === "bosh-so1" || c.slug.startsWith("bosh-so1--")) ??
      list.find((c) => {
        const b = `${c.title} ${c.slug}`.toLowerCase();
        return (
          (b.includes("boshso1") || b.includes("safety officer 1") || (b.includes("bosh") && b.includes("officer 1"))) &&
          !b.includes("officer 2")
        );
      })
    );
  }
  if (s === "bosh-so2" || s.includes("bosh-so2") || s.includes("boshso2") || s.includes("bosh002")) {
    return (
      list.find((c) => c.slug === "bosh-so2" || c.slug.startsWith("bosh-so2--")) ??
      list.find((c) => {
        const b = `${c.title} ${c.slug}`.toLowerCase();
        return b.includes("boshso2") || b.includes("safety officer 2") || (b.includes("bosh") && b.includes("officer 2"));
      })
    );
  }
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

