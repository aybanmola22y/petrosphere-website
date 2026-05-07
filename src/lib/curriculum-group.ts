import type { Course } from "@/data/mockData";
import { curriculumNavigation } from "@/data/mockData";
import { courseSlugFromTms } from "@/lib/tms";

function inferDoleProgramGroupFromBlob(blob: string): string | null {
  const b = blob.toLowerCase();
  if (b.includes("mesh") || /\b8[-\s]?hour\b/.test(b) || b.includes("eight-hour") || b.includes("mandatory eight")) {
    return "Basic Safety Programs";
  }
  if (
    b.includes("cosh") ||
    b.includes("construction occupational") ||
    (b.includes("construction") && b.includes("safety"))
  ) {
    return "Basic Safety Programs";
  }
  if (b.includes("bosh001") || (b.includes("bosh") && (b.includes("so1") || b.includes("safety officer 1")))) {
    return "Basic Safety Programs";
  }
  if (
    b.includes("bosh002") ||
    (b.includes("bosh") && (b.includes("so2") || b.includes("safety officer 2"))) ||
    (b.includes("basic occupational safety") && !b.includes("construction"))
  ) {
    return "Basic Safety Programs";
  }
  if (b.includes("loss control") || /\blcm\b/.test(b)) return "Advanced Safety Training";
  if (b.includes("safety program audit") || b.includes("spat")) return "Advanced Safety Training";
  if ((b.includes("behavior") && b.includes("safety")) || b.includes("behavioral based") || /\bbbs\b/.test(b)) {
    return "Advanced Safety Training";
  }
  if (b.includes("train the trainer") || b.includes("tott") || /\bttt[-\s]/.test(b)) {
    return "Train the Trainer";
  }
  if (b.includes("efat") || b.includes("emergency first aid")) return "First Aid Training";
  if (b.includes("ofat") || b.includes("occupational first aid")) return "First Aid Training";
  if (b.includes("sfat") || b.includes("standard first aid")) return "First Aid Training";
  return null;
}

/**
 * Buckets a course into the same program-group headings as the curriculum nav.
 * Order: DB `program_group` (if valid) → seed slug / `courseSlugFromTms` → DOLE title heuristics
 * → EMS & DENR title heuristics → single-group categories use their only group.
 */
export function resolveCurriculumProgramGroup(course: Course): string {
  const nav = curriculumNavigation.find((n) => n.slug === course.categorySlug);
  if (!nav) return "Programs";

  const pg = course.programGroup?.trim();
  if (pg) {
    const match = nav.groups.find((g) => g.label.toLowerCase() === pg.toLowerCase());
    if (match) return match.label;
  }

  const blob = `${course.title} ${course.slug}`.toLowerCase();
  const slugRoot = course.slug.split("--")[0];

  const candidates = new Set<string>();
  if (course.slug) candidates.add(course.slug);
  if (slugRoot) candidates.add(slugRoot);
  try {
    candidates.add(courseSlugFromTms(course.title, slugRoot || ""));
    candidates.add(courseSlugFromTms(course.title, course.slug));
  } catch {
    /* ignore */
  }

  for (const cand of candidates) {
    if (!cand) continue;
    for (const g of nav.groups) {
      for (const ref of g.refSlugs) {
        if (cand === ref || cand.startsWith(`${ref}--`)) return g.label;
      }
    }
  }

  if (nav.slug === "dole") {
    const inferred = inferDoleProgramGroupFromBlob(blob);
    if (inferred) return inferred;
  } else {
    const inferred = inferEmsDenrProgramGroup(nav.slug, blob);
    if (inferred) return inferred;
  }

  /** Categories with a single program group: any course in that tab belongs in that group. */
  if (nav.groups.length === 1) {
    return nav.groups[0].label;
  }

  return "Other Programs";
}

/** EMS + DENR have multiple groups; match TMS titles/slugs when seed slugs differ (e.g. bls-ashi, BLST001). */
function inferEmsDenrProgramGroup(navSlug: string, blob: string): string | null {
  const b = blob.toLowerCase();
  if (navSlug === "ems") {
    if (
      b.includes("iv therapy") ||
      b.includes("ivtt") ||
      b.includes("rig medic") ||
      b.includes("rig-medic") ||
      b.includes("intravenous")
    ) {
      return "Specialized Programs";
    }
    if (
      b.includes("basic life support") ||
      b.includes("advanced cardiac") ||
      b.includes("advanced cardiac life") ||
      b.includes("pediatric advanced") ||
      b.includes("pediatric life support") ||
      /\bacls\b/.test(b) ||
      /\bpals\b/.test(b) ||
      /\bbls\b/.test(b) ||
      b.includes("blst") ||
      b.includes("bls-ashi") ||
      b.includes("acls-ashi") ||
      b.includes("pals-ashi") ||
      b.includes("healthcare worker") ||
      b.includes("oshw") ||
      b.includes("infection control")
    ) {
      return "Cardiac & Resuscitation";
    }
    return null;
  }
  if (navSlug === "denr") {
    if (b.includes("managing head") || (b.includes("denr") && b.includes("managing"))) {
      return "Managing Heads";
    }
    if (
      b.includes("pco") ||
      b.includes("pollution control officer") ||
      b.includes("category a") ||
      b.includes("category b") ||
      b.includes("pollution control")
    ) {
      return "PCO Program";
    }
    return null;
  }
  return null;
}

/** Allowed program-group headings for a category tab (excludes "Other Programs" from strict lists). */
export function canonicalGroupLabelsForCategory(categorySlug: string): Set<string> | null {
  const nav = curriculumNavigation.find((n) => n.slug === categorySlug);
  if (!nav) return null;
  return new Set(nav.groups.map((g) => g.label));
}
