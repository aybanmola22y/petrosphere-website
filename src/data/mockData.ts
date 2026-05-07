export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;          // Display label, e.g. "DOLE", "EMS"
  categorySlug: string;      // URL slug, e.g. "dole", "ems"
  programGroup?: string;     // e.g. "Basic Safety Programs"
  summary: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  schedule: string;
  objectives: string[];
  audience: string[];
  overview: string;
}

type CourseSeed = Omit<Course, "id" | "category" | "categorySlug">;

const objectivesSafety = [
  "Identify regulatory requirements and applicable standards.",
  "Recognize and assess workplace hazards and exposures.",
  "Implement controls, procedures, and incident response measures.",
  "Document compliance and lead continuous improvement.",
];

const objectivesMedical = [
  "Apply evidence-based assessment and treatment protocols.",
  "Operate emergency equipment with confidence and accuracy.",
  "Coordinate within a clinical or pre-hospital response team.",
  "Document care and hand off patients to advanced providers.",
];

const objectivesGeneric = [
  "Understand the program's core competencies and outcomes.",
  "Apply best-practice frameworks within your operating context.",
  "Demonstrate proficiency through guided exercises and assessment.",
  "Translate learnings into a workplace implementation plan.",
];

const dole: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "Basic Safety Programs",
    courses: [
      {
        title: "MESH — Mandatory Eight-Hour Safety & Health",
        slug: "mesh",
        summary: "DOLE-mandated 8-hour safety and health orientation for all workers.",
        duration: "1 Day",
        level: "All Levels",
        schedule: "Weekly",
        objectives: objectivesSafety,
        audience: ["All Workers", "New Hires", "Site Personnel"],
        overview:
          "MESH satisfies the DOLE-mandated minimum eight hours of safety and health orientation required of every worker before deployment to the workplace.",
      },
      {
        title: "BOSH SO1 — Basic Occupational Safety & Health (Safety Officer 1)",
        slug: "bosh-so1",
        summary: "Foundational accreditation pathway for Safety Officer 1 designations.",
        duration: "2 Days",
        level: "Beginner",
        schedule: "Monthly",
        objectives: objectivesSafety,
        audience: ["Safety Officer 1", "Line Supervisors", "Workforce Reps"],
        overview:
          "Covers the legal basis, OSH terminology, hazard identification, and reporting duties expected of an accredited Safety Officer 1 under DO 198-18.",
      },
      {
        title: "BOSH SO2 — Basic Occupational Safety & Health (Safety Officer 2)",
        slug: "bosh-so2",
        summary: "DOLE-accredited 40-hour BOSH program for Safety Officer 2 designations.",
        duration: "5 Days",
        level: "Intermediate",
        schedule: "Monthly",
        objectives: objectivesSafety,
        audience: ["Safety Officer 2", "OSH Practitioners", "Site Coordinators"],
        overview:
          "The full 40-hour BOSH curriculum required for Safety Officer 2 accreditation. Includes risk assessment, control hierarchy, OSH program design, and reporting workflows.",
      },
      {
        title: "COSH — Construction Occupational Safety & Health",
        slug: "cosh",
        summary: "DOLE-accredited construction safety program for Safety Officer 2 (Construction).",
        duration: "5 Days",
        level: "Intermediate",
        schedule: "Monthly",
        objectives: objectivesSafety,
        audience: ["Construction Safety Officers", "Project Engineers", "Site Foremen"],
        overview:
          "Tailored to the construction sector under DO 13. Focuses on construction hazards, scaffolding, excavation, and the Construction Safety and Health Program (CSHP).",
      },
    ],
  },
  {
    group: "Advanced Safety Training",
    courses: [
      {
        title: "Loss Control Management",
        slug: "loss-control",
        summary: "Reduce incident frequency and severity through systematic loss control.",
        duration: "3 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesSafety,
        audience: ["HSE Managers", "Safety Officers 3", "Operations Leads"],
        overview:
          "Equips senior safety practitioners to design and operate a loss control program: cause analysis, control selection, performance measurement, and audit cycles.",
      },
      {
        title: "Behavior Based Safety",
        slug: "bbs",
        summary: "Influence at-risk behaviors through observation, feedback, and coaching.",
        duration: "2 Days",
        level: "Intermediate",
        schedule: "Quarterly",
        objectives: objectivesSafety,
        audience: ["Safety Officers", "Line Supervisors", "BBS Observers"],
        overview:
          "Introduces behavioral observation methods, feedback techniques, and the data systems needed to sustain a credible BBS program on the operating floor.",
      },
      {
        title: "Safety Program Audit",
        slug: "safety-audit",
        summary: "Audit your OSH program against DOLE and international benchmarks.",
        duration: "2 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesSafety,
        audience: ["Internal Auditors", "Safety Managers", "Compliance Leads"],
        overview:
          "Walks practitioners through the audit cycle: scoping, evidence gathering, scoring, non-conformance handling, and corrective action verification.",
      },
    ],
  },
  {
    group: "Train the Trainer",
    courses: [
      {
        title: "Train the Trainer — 2 Hours",
        slug: "ttt-2",
        summary: "Compact orientation to adult-learning principles for subject experts.",
        duration: "2 Hours",
        level: "All Levels",
        schedule: "On Demand",
        objectives: objectivesGeneric,
        audience: ["Subject Matter Experts", "Toolbox Talk Leads"],
        overview:
          "A short-form session for experts who deliver brief safety briefings and need a baseline in adult learning, facilitation, and engagement.",
      },
      {
        title: "Train the Trainer — 8 Hours",
        slug: "ttt-8",
        summary: "Full-day facilitation skills program for in-house instructors.",
        duration: "1 Day",
        level: "Intermediate",
        schedule: "Monthly",
        objectives: objectivesGeneric,
        audience: ["In-House Trainers", "Department Coaches"],
        overview:
          "Covers session design, facilitation techniques, learner assessment, and lesson plan development across a single intensive day.",
      },
      {
        title: "Train the Trainer — 24 Hours",
        slug: "ttt-24",
        summary: "Three-day immersive instructor certification program.",
        duration: "3 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Senior Trainers", "Learning & Development Leads"],
        overview:
          "The full instructor certification track. Includes microteaching, instructional design, evaluation methods, and accreditation-ready course documentation.",
      },
    ],
  },
  {
    group: "First Aid Training",
    courses: [
      {
        title: "EFAT — Emergency First Aid Training",
        slug: "efat",
        summary: "Essential emergency response and first aid for all workers.",
        duration: "1 Day",
        level: "Beginner",
        schedule: "Weekly",
        objectives: objectivesMedical,
        audience: ["All Employees", "Designated First Aiders"],
        overview:
          "An entry-level first aid course covering the most common workplace injuries, rescue breathing, bleeding control, and emergency activation.",
      },
      {
        title: "OFAT — Occupational First Aid Training",
        slug: "ofat",
        summary: "Mandatory occupational first aid for designated workplace responders.",
        duration: "2 Days",
        level: "Beginner",
        schedule: "Monthly",
        objectives: objectivesMedical,
        audience: ["First Aid Providers", "Safety Officers"],
        overview:
          "Aligned with DOLE requirements for first aid providers in industrial workplaces. Includes CPR, AED, fracture management, and patient handover.",
      },
      {
        title: "SFAT — Standard First Aid Training",
        slug: "sfat",
        summary: "Comprehensive standard first aid certification recognised by Red Cross.",
        duration: "3 Days",
        level: "Intermediate",
        schedule: "Monthly",
        objectives: objectivesMedical,
        audience: ["Workplace Responders", "HSE Staff", "Site Medics"],
        overview:
          "The standard first aid syllabus. Builds on EFAT and OFAT with extended trauma management, environmental emergencies, and prolonged care scenarios.",
      },
    ],
  },
];

const ems: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "Cardiac & Resuscitation",
    courses: [
      {
        title: "BLS — Basic Life Support",
        slug: "bls",
        summary: "AHA-aligned basic life support for healthcare and lay providers.",
        duration: "1 Day",
        level: "All Levels",
        schedule: "Weekly",
        objectives: objectivesMedical,
        audience: ["Nurses", "EMTs", "Workplace Responders"],
        overview:
          "Covers high-quality CPR, AED operation, choking management, and team-based resuscitation for adult, child, and infant patients.",
      },
      {
        title: "ACLS — Advanced Cardiac Life Support",
        slug: "acls",
        summary: "Advanced cardiac arrest and peri-arrest management for clinicians.",
        duration: "2 Days",
        level: "Advanced",
        schedule: "Monthly",
        objectives: objectivesMedical,
        audience: ["Physicians", "Critical Care Nurses", "Senior EMS Providers"],
        overview:
          "Focuses on rhythm recognition, advanced airway management, pharmacology, and team leadership during adult cardiac emergencies.",
      },
      {
        title: "PALS — Pediatric Advanced Life Support",
        slug: "pals",
        summary: "Systematic approach to seriously ill and injured pediatric patients.",
        duration: "2 Days",
        level: "Advanced",
        schedule: "Monthly",
        objectives: objectivesMedical,
        audience: ["Pediatric Clinicians", "ED Staff", "Critical Care Teams"],
        overview:
          "Equips clinicians with the assessment framework and resuscitation skills for pediatric respiratory failure, shock, and cardiac arrest.",
      },
    ],
  },
  {
    group: "Specialized Programs",
    courses: [
      {
        title: "IV Therapy Course",
        slug: "iv-therapy",
        summary: "PRC- and ANSAP-aligned intravenous therapy training for nurses.",
        duration: "3 Days",
        level: "Intermediate",
        schedule: "Monthly",
        objectives: objectivesMedical,
        audience: ["Registered Nurses", "Nurse Specialists"],
        overview:
          "Theoretical and skills-based IV therapy program. Covers fluid and electrolyte balance, infusion devices, complications, and documentation.",
      },
      {
        title: "Rig Medic Course",
        slug: "rig-medic",
        summary: "Pre-hospital care competencies for offshore and remote-site medics.",
        duration: "5 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesMedical,
        audience: ["Offshore Medics", "Remote-Site Nurses", "Industrial Paramedics"],
        overview:
          "Designed for medics deployed to rigs and remote operations. Combines BLS, ACLS, trauma stabilization, and tele-medicine workflows.",
      },
    ],
  },
];

const denr: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "Managing Heads",
    courses: [
      {
        title: "Managing Heads — DENR Accreditation",
        slug: "managing-heads",
        summary: "Accreditation course for managing heads of pollution control.",
        duration: "3 Days",
        level: "Intermediate",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Plant Managers", "Operations Heads", "Department Leads"],
        overview:
          "Required course for managing heads under DAO 2014-02. Covers environmental compliance responsibilities, reporting, and sanctions.",
      },
    ],
  },
  {
    group: "PCO Program",
    courses: [
      {
        title: "PCO — Category A",
        slug: "pco-a",
        summary: "Pollution Control Officer accreditation for Category A establishments.",
        duration: "5 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Senior Environmental Officers", "Plant PCOs"],
        overview:
          "Advanced PCO training for Category A establishments with significant environmental aspects. Includes environmental management systems and DENR reporting.",
      },
      {
        title: "PCO — Category B",
        slug: "pco-b",
        summary: "Pollution Control Officer accreditation for Category B establishments.",
        duration: "3 Days",
        level: "Intermediate",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Environmental Officers", "Compliance Staff"],
        overview:
          "PCO training for Category B establishments. Covers basic environmental laws, monitoring requirements, and compliance documentation.",
      },
    ],
  },
];

const tesda: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "TESDA Programs",
    courses: [
      {
        title: "Bookkeeping NC III",
        slug: "bookkeeping-nc3",
        summary: "TESDA-registered NC III qualification in bookkeeping.",
        duration: "10 Days",
        level: "Intermediate",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Bookkeepers", "Accounting Clerks", "Career Shifters"],
        overview:
          "TESDA-aligned NC III competency program covering journals, ledgers, financial statements, and basic taxation.",
      },
      {
        title: "Caregiving NC II",
        slug: "caregiving-nc2",
        summary: "TESDA NC II qualification for institutional and home-based caregiving.",
        duration: "20 Days",
        level: "Beginner",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Aspiring Caregivers", "Healthcare Aides"],
        overview:
          "Covers care for elderly, children, and people with special needs. Includes hygiene, nutrition, basic nursing assistance, and emergency response.",
      },
      {
        title: "EMS NC II — Emergency Medical Services",
        slug: "ems-nc2",
        summary: "TESDA NC II qualification for emergency medical service providers.",
        duration: "20 Days",
        level: "Intermediate",
        schedule: "Quarterly",
        objectives: objectivesMedical,
        audience: ["Aspiring EMS Providers", "Industrial Responders"],
        overview:
          "Pre-hospital emergency care competencies including patient assessment, BLS, trauma management, and ambulance operations.",
      },
      {
        title: "Healthcare Services II",
        slug: "healthcare-services-2",
        summary: "TESDA-registered healthcare services qualification.",
        duration: "15 Days",
        level: "Beginner",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Healthcare Aides", "Allied Health Workers"],
        overview:
          "Foundational healthcare support skills including infection control, patient comfort, vital signs, and basic clinical procedures.",
      },
    ],
  },
];

const iadc: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "IADC Programs",
    courses: [
      {
        title: "IADC RigPass",
        slug: "rigpass",
        summary: "IADC-accredited orientation for new and transferring rig personnel.",
        duration: "2 Days",
        level: "Beginner",
        schedule: "Monthly",
        objectives: objectivesSafety,
        audience: ["New Rig Hires", "Transferring Personnel", "Visiting Contractors"],
        overview:
          "The industry-standard IADC RigPass orientation covering rig terminology, hazards, PPE, and emergency response for the upstream drilling sector.",
      },
    ],
  },
];

const pecb: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "ISO Standards",
    courses: [
      {
        title: "PECB ISO 9001 Lead Auditor",
        slug: "iso-9001",
        summary: "PECB-certified lead auditor program for quality management systems.",
        duration: "5 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["Quality Managers", "Internal Auditors", "Compliance Leads"],
        overview:
          "Develops the competence to plan, conduct, and report on a Quality Management System audit aligned with ISO 9001 and ISO 19011.",
      },
      {
        title: "PECB ISO 14001 Lead Auditor",
        slug: "iso-14001",
        summary: "PECB-certified lead auditor program for environmental management systems.",
        duration: "5 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesGeneric,
        audience: ["EMS Managers", "Environmental Officers", "Auditors"],
        overview:
          "Equips auditors to evaluate Environmental Management Systems against ISO 14001, including aspects, impacts, and compliance obligations.",
      },
      {
        title: "PECB ISO 45001 Lead Auditor",
        slug: "iso-45001",
        summary: "PECB-certified lead auditor program for OH&S management systems.",
        duration: "5 Days",
        level: "Advanced",
        schedule: "Quarterly",
        objectives: objectivesSafety,
        audience: ["HSE Managers", "OSH Auditors", "Safety Practitioners"],
        overview:
          "Trains auditors to assess Occupational Health & Safety Management Systems against ISO 45001 with practical case work and a certification exam.",
      },
    ],
  },
];

const consultancyPrograms: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "Advisory Services",
    courses: [
      {
        title: "OSH Consultancy",
        slug: "osh-consultancy",
        summary: "End-to-end occupational safety and health advisory engagement.",
        duration: "Engagement-based",
        level: "All Levels",
        schedule: "On Request",
        objectives: objectivesSafety,
        audience: ["Executive Sponsors", "HSE Leadership", "Operations Heads"],
        overview:
          "Our OSH advisory team helps you build, mature, or audit your occupational safety program. Includes baseline diagnostic, roadmap, and quarterly review.",
      },
      {
        title: "Environmental Impact Assessment",
        slug: "eia",
        summary: "DENR-aligned EIA preparation, scoping, and stakeholder facilitation.",
        duration: "Engagement-based",
        level: "All Levels",
        schedule: "On Request",
        objectives: objectivesGeneric,
        audience: ["Project Sponsors", "Permitting Teams", "Sustainability Leads"],
        overview:
          "Full EIA support from screening through ECC issuance, including baseline studies, impact analysis, mitigation planning, and public consultation.",
      },
    ],
  },
];

// Categories that exist in the dropdown but for which we have no real programs yet.
const cpd: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "CPD Programs",
    courses: [
      {
        title: "CPD Refresher — Professional Practice",
        slug: "cpd-refresher",
        summary: "CPD-accredited refresher units for licensed professionals.",
        duration: "1 Day",
        level: "All Levels",
        schedule: "Monthly",
        objectives: objectivesGeneric,
        audience: ["Licensed Professionals", "PRC Registrants"],
        overview:
          "A modular CPD refresher built for licensed professionals who need to top up their CPD units across the year. Sessions are PRC-accredited.",
      },
    ],
  },
];

const maritime: { group: string; courses: CourseSeed[] }[] = [
  {
    group: "Maritime Programs",
    courses: [
      {
        title: "Basic Maritime Safety",
        slug: "maritime-safety",
        summary: "STCW-aligned basic safety training for maritime personnel.",
        duration: "5 Days",
        level: "Beginner",
        schedule: "Monthly",
        objectives: objectivesSafety,
        audience: ["Seafarers", "Port Workers", "Maritime Cadets"],
        overview:
          "Covers personal survival techniques, fire prevention, elementary first aid, and personal safety and social responsibilities aligned with STCW.",
      },
    ],
  },
];

type Section = {
  category: string;
  categorySlug: string;
  groups: { group: string; courses: CourseSeed[] }[];
};

const sections: Section[] = [
  { category: "DOLE", categorySlug: "dole", groups: dole },
  { category: "CPD", categorySlug: "cpd", groups: cpd },
  { category: "EMS", categorySlug: "ems", groups: ems },
  { category: "DENR", categorySlug: "denr", groups: denr },
  { category: "TESDA", categorySlug: "tesda", groups: tesda },
  { category: "IADC", categorySlug: "iadc", groups: iadc },
  { category: "PECB", categorySlug: "pecb", groups: pecb },
  { category: "Maritime", categorySlug: "maritime", groups: maritime },
  { category: "Consultancy", categorySlug: "consultancy", groups: consultancyPrograms },
];

let counter = 0;
export const courses: Course[] = sections.flatMap(({ category, categorySlug, groups }) =>
  groups.flatMap(({ group, courses: list }) =>
    list.map((seed) => {
      counter += 1;
      return {
        ...seed,
        id: `${categorySlug}-${String(counter).padStart(3, "0")}`,
        category,
        categorySlug,
        programGroup: group,
      };
    })
  )
);

export const courseCategories: { label: string; slug: string }[] = sections.map((s) => ({
  label: s.category,
  slug: s.categorySlug,
}));

/** Canonical program groups + seed slugs per category (used to bucket live TMS courses). */
export type CurriculumNavGroup = { label: string; refSlugs: string[] };
export type CurriculumNavSection = { slug: string; label: string; groups: CurriculumNavGroup[] };

export const curriculumNavigation: CurriculumNavSection[] = sections.map((s) => ({
  slug: s.categorySlug,
  label: s.category,
  groups: s.groups.map((g) => ({
    label: g.group,
    refSlugs: g.courses.map((c) => c.slug),
  })),
}));

/** Public training calendar rows (schedule page). */
export interface TrainingSession {
  id: string;
  courseTitle: string;
  courseSlug: string;
  categorySlug: string;
  /** e.g. STAGGERED DAYS — shown under title */
  formatNote: string;
  dateRange: string;
  year: number;
  /** First month of the run; used for month filter (YYYY-MM). */
  monthKey: string;
  /** ISO date string for sorting */
  startDate: string;
  location: string;
  status: "finished" | "cancelled" | "open" | "closed";
  actionLabel: string;
  price?: string;
  /** Direct link to TMS enrollment form for this schedule run */
  enrollmentUrl?: string;
}



export const services = [
  {
    title: "Safety Consultancy",
    description: "Expert audits, risk assessments, and safety management system development tailored to your industry.",
    icon: "Shield",
  },
  {
    title: "Environmental Compliance",
    description: "Ensure your operations meet environmental regulations and sustainability standards.",
    icon: "Globe",
  },
  {
    title: "Corporate Training",
    description: "Customized training programs delivered on-site or at our state-of-the-art facilities.",
    icon: "BookOpen",
  },
];

export type { StudentVideoTestimonial } from "./siteMarketingDefaults";
export { stats, studentVideoTestimonials } from "./siteMarketingDefaults";

export const milestones = [
  { year: "2013", title: "Company Founded", description: "Established with a mission to elevate workplace safety." },
  { year: "2015", title: "Regional Expansion", description: "Opened three new training centers across the region." },
  { year: "2018", title: "International Accreditation", description: "Received prestigious international certifications for our course offerings." },
  { year: "2023", title: "Digital Transformation", description: "Launched our comprehensive e-learning platform." },
];
