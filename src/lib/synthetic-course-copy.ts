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
  // Category-fallback boilerplate — replace with title-aware copy.
  if (lower.includes("dole-relevant safety and health program designed for philippine workplaces")) {
    return true;
  }
  if (lower.includes("focuses on clinical and pre-hospital skills for healthcare")) return true;
  if (lower.includes("contributes toward continuing professional development for licensed")) {
    return true;
  }
  if (lower.includes("nebosh-aligned occupational safety and health program")) return true;
  if (lower.includes("sits within the dole (dole) curriculum family")) return true;
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

function topicSummary(blob: string): string | undefined {
  const online =
    blob.includes("elearning") || blob.includes("e-learning") || blob.includes("e learning");

  if (blob.includes("civil service") || (blob.includes("csc") && blob.includes("review"))) {
    const track = blob.includes("non-professional") || blob.includes("sub-professional")
      ? "non-professional"
      : blob.includes("professional")
        ? "professional"
        : "civil service";
    return `Structured Civil Service ${track} exam review—verbal, numerical, and clerical practice with timed drills and coaching.`;
  }
  if (blob.includes("confined space")) {
    return `Permit-required confined space awareness: atmospheric hazards, gas testing, attendants, and safe entry procedures for industrial sites.`;
  }
  if (blob.includes("work at height") || blob.includes("working at height")) {
    return `Fall-protection training covering hazard assessment, harness and anchorage use, and rescue awareness for elevated work.`;
  }
  if (blob.includes("fire watch") || blob.includes("fire warden")) {
    return `Fire watch and hot-work standby: extinguisher selection, watch duties, alarms, and evacuation coordination.`;
  }
  if (blob.includes("food safety") || blob.includes("food hygiene") || blob.includes("haccp")) {
    return `Food safety and hygiene covering contamination routes, personal hygiene, temperature control, and prerequisite programs.`;
  }
  if (
    blob.includes("intravenous") ||
    blob.includes("iv therapy") ||
    blob.includes("iv training") ||
    blob.includes("iv-therapy") ||
    blob.includes("ivtt") ||
    /\bivt\b/.test(blob)
  ) {
    return `PRC- and ANSAP-aligned intravenous therapy training for nurses—venipuncture, infusion devices, fluid balance, complications, and documentation.`;
  }
  if (blob.includes("rig medic")) {
    return `Pre-hospital care competencies for offshore and remote-site medics, including BLS/ACLS foundations, trauma stabilization, and telemedicine workflows.`;
  }
  if (blob.includes("lock out") || blob.includes("lockout") || blob.includes("loto") || blob.includes("tag out")) {
    return online
      ? `Online Lock Out Tag Out program covering energy isolation, lock/tag application, verification, and release procedures for Philippine workplaces.`
      : `Hands-on Lock Out Tag Out training: energy isolation, lock and tag application, verification of zero energy, and safe release of equipment.`;
  }
  if (blob.includes("cosh") || blob.includes("construction occupational")) {
    return `DOLE-accredited construction safety program for Safety Officer 2 (Construction), covering site hazards, scaffolding, and construction OSH controls.`;
  }
  if (blob.includes("scaffold")) {
    return `Scaffolding safety covering erection, inspection, load limits, fall protection, and safe use on construction and industrial sites.`;
  }
  if (
    blob.includes("fire fighting") ||
    blob.includes("firefighting") ||
    blob.includes("fire fighter") ||
    /\bbfft\b/.test(blob)
  ) {
    return `Hands-on fire fighting skills: fire chemistry, extinguisher selection, hose lines, and coordinated response for workplace fire emergencies.`;
  }
  if (
    blob.includes("basic first aid") ||
    /\bbfat\b/.test(blob) ||
    (blob.includes("first aid") &&
      !blob.includes("emergency first") &&
      !blob.includes("occupational first") &&
      !blob.includes("standard first") &&
      !blob.includes("efat") &&
      !blob.includes("ofat") &&
      !blob.includes("sfat"))
  ) {
    return `Practical first aid for workplace responders—patient assessment, bleeding control, CPR basics, and emergency handover.`;
  }
  if (blob.includes("emergency first") || blob.includes("efat")) {
    return `Essential emergency response and first aid for all workers.`;
  }
  if (blob.includes("occupational first") || blob.includes("ofat")) {
    return `Mandatory occupational first aid for designated workplace responders.`;
  }
  if (blob.includes("standard first") || blob.includes("sfat")) {
    return `Comprehensive standard first aid certification recognised by Red Cross.`;
  }
  if (blob.includes("chemical") || blob.includes("hazmat") || blob.includes("hzmt")) {
    return `Chemical safety covering SDS interpretation, exposure controls, PPE selection, spill response, and safe storage/handling practices.`;
  }
  if (blob.includes("electrical safety") || blob.includes("electrical")) {
    return online
      ? `Online electrical safety program covering shock and arc hazards, safe work practices, PPE, and lockout awareness for non-electrician personnel.`
      : `Electrical safety covering shock and arc-flash hazards, safe approach limits, PPE, and isolation practices for workplace electrical tasks.`;
  }
  if (blob.includes("hirac") || (blob.includes("hazard identification") && blob.includes("risk"))) {
    return online
      ? `Online HIRAC program: hazard identification, risk assessment matrices, and selecting practical control measures for day-to-day operations.`
      : `Hazard Identification, Risk Assessment, and Control (HIRAC)—spot hazards, rate risk, and apply the hierarchy of controls on site.`;
  }
  if (blob.includes("industrial hygiene") || /\bih\b/.test(blob)) {
    return `Industrial hygiene fundamentals: workplace exposure recognition, evaluation, and control for chemical, physical, and biological agents.`;
  }
  if (blob.includes("nebosh") || blob.includes("national examination board")) {
    return `UK-awarded NEBOSH programme for health and safety professionals—risk management, workplace hazards, and internationally recognised OSH qualifications.`;
  }
  if (blob.includes("iosh")) {
    return `IOSH Managing Safely with behavioral-based safety—practical risk management, incident causation, and coaching safer workplace behaviors.`;
  }
  if (
    blob.includes("behavior based") ||
    blob.includes("behaviour based") ||
    blob.includes("behavioral based") ||
    blob.includes("behavioural based") ||
    /\bbbs\b/.test(blob)
  ) {
    return online
      ? `Online Behavior Based Safety program: observation techniques, feedback conversations, and building habit-level safe behaviors at work.`
      : `Influence at-risk behaviors through observation, feedback, and coaching.`;
  }
  if (blob.includes("mesh") || blob.includes("mandatory eight") || blob.includes("eight-hour")) {
    return online
      ? `Online Mandatory Eight-Hour Safety and Health (MESH) orientation covering worker rights, common hazards, and DOLE OSH basics.`
      : `DOLE-mandated 8-hour safety and health orientation for all workers.`;
  }
  if (
    blob.includes("train the trainer") ||
    blob.includes("training of trainers") ||
    blob.includes("training of trainer") ||
    /\btot\b/.test(blob) ||
    /\btott\b/.test(blob)
  ) {
    return `Facilitation skills for subject-matter experts—adult learning, session design, practice teaching, and learner assessment.`;
  }
  if (blob.includes("bosh") && (blob.includes("so2") || blob.includes("officer 2"))) {
    return `DOLE-accredited 40-hour BOSH program for Safety Officer 2 designations.`;
  }
  if (blob.includes("bosh") && (blob.includes("so1") || blob.includes("officer 1"))) {
    return `Foundational accreditation pathway for Safety Officer 1 designations.`;
  }
  if (blob.includes("loss control")) {
    return `Reduce incident frequency and severity through systematic loss control.`;
  }
  if (blob.includes("safety program audit") || blob.includes("spat")) {
    return `Audit your OSH program against DOLE and international benchmarks.`;
  }
  if (blob.includes("basic life support") || (/\bbls\b/.test(blob) && !blob.includes("acls"))) {
    return `AHA-aligned basic life support for healthcare and lay providers—CPR, AED use, and choking response.`;
  }
  if (blob.includes("acls") || blob.includes("advanced cardiac")) {
    return `Advanced cardiac arrest and peri-arrest management for clinicians, with team-based resuscitation protocols.`;
  }
  if (blob.includes("pals") || blob.includes("pediatric")) {
    return `Systematic approach to seriously ill and injured pediatric patients for clinicians and emergency responders.`;
  }
  return undefined;
}

export function buildSyntheticSummary(
  title: string,
  categoryLabel: string,
  categorySlug: string,
  slug: string,
  codeName?: string,
): string {
  const t = title.trim() || "This program";
  const cc = codeClause(codeName);
  const blob = `${title} ${slug}`.toLowerCase();
  const topic = topicSummary(blob);
  if (topic) return `${topic}${cc}`;

  switch (categorySlug) {
    case "dole":
      return `${t} builds practical OSH competence for Philippine workplaces—hazards, controls, and compliance expectations aligned with the topic of this program.${cc}`;
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
  const blob = `${title}`.toLowerCase();

  if (blob.includes("nebosh") || blob.includes("national examination board")) {
    return `${summary} NEBOSH (National Examination Board in Occupational Safety and Health) is a UK-based awarding body. This programme prepares learners for internationally recognised health and safety qualifications used by employers worldwide. Review duration, level, and schedule when published; use Enroll or Corporate booking to confirm the next cohort.${cc}`.trim();
  }

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

  if (
    blob.includes("intravenous") ||
    blob.includes("iv therapy") ||
    blob.includes("iv training") ||
    blob.includes("iv-therapy") ||
    blob.includes("ivtt")
  ) {
    return {
      objectives: [
        "Perform safe venipuncture and peripheral IV insertion using aseptic technique.",
        "Select infusion devices, calculate fluid rates, and monitor for complications.",
        "Document IV therapy per PRC/ANSAP expectations and escalate adverse reactions appropriately.",
      ],
      audience: ["Registered nurses", "Nurse specialists", "Clinical staff requiring IV competency"],
      duration: "3 Days",
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
