import type { Course } from "@/data/mockData";

const CATALOG_PLACEHOLDER =
  "View the full program outline and learning outcomes on the course page.";

const SCHEDULE_PLACEHOLDER =
  "View the full program outline, prerequisites, and learning outcomes on the course page.";

/** Exported so catalog can tell if a TMS “overview” field is real copy or filler. */
export function isTmsMarketingPlaceholder(text: string): boolean {
  const t = text.trim();
  if (t.length === 0) return true;
  const lower = t.toLowerCase();
  if (lower === CATALOG_PLACEHOLDER.toLowerCase()) return true;
  if (lower === SCHEDULE_PLACEHOLDER.toLowerCase()) return true;
  if (lower === "training program") return true;
  return false;
}

function isPlaceholderOrEmpty(text: string): boolean {
  return isTmsMarketingPlaceholder(text);
}

function codeClause(code: string | undefined): string {
  const c = code?.trim();
  if (!c || c.length > 48) return "";
  return ` This offering is listed in our training system under code ${c}.`;
}

export function buildSyntheticSummary(
  title: string,
  categoryLabel: string,
  categorySlug: string,
  _slug: string,
  codeName?: string,
): string {
  const t = title.trim() || "This program";
  const cc = codeClause(codeName);

  switch (categorySlug) {
    case "dole":
      return `${t} is a DOLE-relevant safety and health program designed for Philippine workplaces. Participants build practical competence in hazards, controls, and compliance expectations aligned with OSH regulations.${cc}`;
    case "ems":
      return `${t} focuses on clinical and pre-hospital skills for healthcare and allied responders. Sessions emphasize evidence-based protocols, teamwork, and safe patient care in time-critical situations.${cc}`;
    case "denr":
      return `${t} supports environmental compliance roles under Philippine regulations. Learners gain structured guidance on responsibilities, reporting, and stewardship relevant to DENR-accredited pathways.${cc}`;
    case "tesda":
      return `${t} follows a TESDA-oriented competency track suitable for NC-based qualifications and skills certification. Expect hands-on practice, assessment preparation, and workplace-ready outcomes.${cc}`;
    case "iadc":
      return `${t} targets upstream oil and gas personnel who need industry-standard orientation and hazard awareness. Content reflects rig-site realities, PPE use, and emergency response expectations.${cc}`;
    case "pecb":
      return `${t} supports management-system auditing and certification goals aligned with ISO frameworks. Learners practice planning, evidence gathering, and reporting against recognised standards.${cc}`;
    case "maritime":
      return `${t} is structured for seafarers and maritime support roles, with emphasis on STCW-aligned safety, survival, and on-board procedures.${cc}`;
    case "consultancy":
      return `${t} is delivered as an advisory or assessment-style engagement for organisations improving OSH or environmental performance. Scope and deliverables are agreed per client context.${cc}`;
    case "cpd":
      return `${t} contributes toward continuing professional development for licensed and regulated professionals. Sessions are modular and suited to topping up annual CPD requirements.${cc}`;
    default:
      return `${t} is offered under our ${categoryLabel} track. The session blends instruction with applied practice so teams can implement learning quickly on the job.${cc}`;
  }
}

export function buildSyntheticOverview(
  summary: string,
  title: string,
  categoryLabel: string,
  categorySlug: string,
  codeName?: string,
): string {
  const t = title.trim() || "This program";
  const cc = codeClause(codeName);

  return `${summary} On this page you can review duration, level, and schedule fields that sync from our training management system when available. ${t} sits within the ${categoryLabel} (${categorySlug}) curriculum family—ideal for supervisors, specialists, and practitioners who need consistent, audit-ready training records. For cohort dates, corporate delivery, or a detailed syllabus, use Enroll or Corporate booking and our admissions team will confirm the next available run.${cc}`.trim();
}

export type EnrichCopySourceFlags = {
  codeHint?: string;
  /** True when TMS/Supabase supplied its own non-empty overview/long-description (not merged from summary). */
  hadDedicatedOverview?: boolean;
};

/** When TMS/Supabase omits marketing copy, attach readable summary + overview without overwriting real DB text. */
export function enrichCourseCopyFromTms(course: Course, opts?: EnrichCopySourceFlags): Course {
  const needSummary = isPlaceholderOrEmpty(course.summary);

  const hasRealOverview =
    Boolean(opts?.hadDedicatedOverview) && !isPlaceholderOrEmpty(course.overview);

  const needOverview =
    isPlaceholderOrEmpty(course.overview) ||
    (!hasRealOverview && needSummary && course.overview.trim() === course.summary.trim());

  let summary = course.summary;
  let overview = course.overview;

  if (needSummary) {
    summary = buildSyntheticSummary(
      course.title,
      course.category,
      course.categorySlug,
      course.slug,
      opts?.codeHint,
    );
  }
  if (needOverview) {
    overview = buildSyntheticOverview(
      summary,
      course.title,
      course.category,
      course.categorySlug,
      opts?.codeHint,
    );
  }

  if (summary === course.summary && overview === course.overview) return course;
  return { ...course, summary, overview };
}

/** When no mock seed exists, replace generic catalog bullets with topic-aware copy from title/slug. */
export function syntheticPedagogyForOrphanTms(course: Course): {
  objectives: string[];
  audience: string[];
  duration: string;
} {
  const blob = `${course.title} ${course.slug}`.toLowerCase();

  if (blob.includes("food safety") || blob.includes("food hygiene") || blob.includes("haccp")) {
    return {
      objectives: [
        "Explain foodborne illness hazards, contamination routes, and the role of prerequisite programs.",
        "Apply good manufacturing practices, personal hygiene, and temperature control in food handling contexts.",
        "Support monitoring, record-keeping, and corrective actions aligned with regulatory expectations.",
      ],
      audience: [
        "Food handlers and production staff",
        "Kitchen supervisors and QA assistants",
        "Anyone requiring accredited food safety orientation",
      ],
      duration: "1–2 Days",
    };
  }

  if (blob.includes("civil service") || (blob.includes("csc") && blob.includes("review"))) {
    return {
      objectives: [
        "Strengthen verbal, analytical, and situational judgement skills common to professional-level CSC-style exams.",
        "Apply time-boxed drills, error analysis, and mock-test strategies to improve accuracy under pressure.",
        "Organise a personal review plan with resources and milestones suited to the examination calendar.",
      ],
      audience: [
        "Civil service examination candidates",
        "Professionals seeking structured review support",
        "Career entrants preparing for competitive exams",
      ],
      duration: "Multi-week (format dependent)",
    };
  }

  if (blob.includes("confined space")) {
    return {
      objectives: [
        "Identify permit-required confined spaces and common atmospheric, mechanical, and engulfment hazards.",
        "Apply safe entry preparation, ventilation, gas testing, communication, and attendant responsibilities.",
        "Plan for non-entry rescue concepts, emergency stops, and handover documentation aligned with site procedures.",
      ],
      audience: [
        "Workers who may enter or attend confined spaces",
        "Safety officers and supervisors issuing permits",
        "Maintenance and operations teams in industrial plants",
      ],
      duration: "1–2 Days",
    };
  }

  if (blob.includes("work at height") || blob.includes("working at height")) {
    return {
      objectives: [
        "Assess fall hazards and select appropriate fall protection systems for the task.",
        "Inspect harnesses, lanyards, and anchorages, and use them correctly during work at height.",
        "Apply rescue awareness and emergency response coordination for elevated work.",
      ],
      audience: ["Scaffolders", "Riggers", "Maintenance technicians", "Site safety personnel"],
      duration: "1–2 Days",
    };
  }

  if (blob.includes("fire watch") || blob.includes("fire warden")) {
    return {
      objectives: [
        "Understand combustion basics, classes of fire, and extinguisher selection.",
        "Perform effective fire watch duties during hot work and high-risk activities.",
        "Coordinate alarms, evacuation, and communication with emergency response teams.",
      ],
      audience: ["Fire watch personnel", "Hot-work crews", "Facility operators"],
      duration: "1 Day",
    };
  }

  const byCategory: Record<
    string,
    { objectives: string[]; audience: string[]; duration: string }
  > = {
    dole: {
      objectives: [
        "Interpret applicable OSH rules and site-specific safety requirements for the topic.",
        "Recognise hazards, apply the hierarchy of controls, and document key compliance steps.",
        "Demonstrate safe work practices through scenarios aligned with DOLE expectations.",
      ],
      audience: ["Frontline workers", "Supervisors", "Safety officers", "Contractor personnel"],
      duration: "1–3 Days",
    },
    ems: {
      objectives: [
        "Apply assessment and intervention steps appropriate to the clinical or pre-hospital context.",
        "Operate within team roles, communication protocols, and scope-of-practice boundaries.",
        "Prepare for skills verification or certification elements where applicable.",
      ],
      audience: ["Nurses", "Allied health staff", "Industrial medics", "Designated workplace responders"],
      duration: "1–3 Days",
    },
    tesda: {
      objectives: [
        "Meet core unit competencies for the qualification track and assessment criteria.",
        "Practice hands-on skills with coaching toward workplace-ready performance.",
        "Prepare for NC-style assessment or certification steps as applicable to the program.",
      ],
      audience: ["Trainees seeking NC certification", "Career entrants", "Upskilling workers"],
      duration: "5–20 Days",
    },
    pecb: {
      objectives: [
        "Plan and conduct management-system audits using recognised ISO frameworks.",
        "Gather objective evidence, evaluate findings, and report nonconformities clearly.",
        "Support continual improvement and follow-up verification activities.",
      ],
      audience: ["Lead auditors", "Internal auditors", "QHSE managers", "Compliance specialists"],
      duration: "5 Days",
    },
    default: {
      objectives: [
        "Understand the program scope, terminology, and intended outcomes.",
        "Apply core skills through guided practice and scenario-based learning.",
        "Prepare for workplace application, assessment, or certification follow-up as required.",
      ],
      audience: [
        "Professionals upgrading skills in this track",
        "Supervisors responsible for team competence",
        "Contractor and client personnel where applicable",
      ],
      duration: "1–3 Days",
    },
  };

  const pack = byCategory[course.categorySlug] ?? byCategory.default;
  return { ...pack };
}
