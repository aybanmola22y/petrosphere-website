import type { Course } from "@/data/mockData";

export type CourseDetailBlock =
  | { type: "paragraphs"; paragraphs: string[] }
  | { type: "bullets"; items: string[] };

export type CourseDetailSection = {
  id: string;
  title: string;
  body: CourseDetailBlock;
};

function courseNames(title: string): { full: string; short: string } {
  const trimmed = title.trim() || "this program";
  const paren = trimmed.match(/\(([^)]+)\)\s*$/);
  return { full: trimmed, short: paren?.[1]?.trim() || trimmed };
}

function blob(course: Course): string {
  return `${course.title} ${course.slug} ${course.categorySlug}`.toLowerCase();
}

function buildWhyTrain(course: Course): string {
  const { full } = courseNames(course.title);
  const b = blob(course);

  if (b.includes("acls")) {
    return `${full} prepares clinicians and senior responders to lead adult cardiac arrest and peri-arrest care. Training emphasizes high-performance team dynamics, timely defibrillation, and evidence-based pharmacology so your unit can stabilize patients before and after ROSC.`;
  }
  if (b.includes("bls") || b.includes("basic life support")) {
    return `${full} builds the foundation for high-quality CPR, AED use, and relief of choking in adult, child, and infant patients—skills every healthcare and workplace response team needs before advancing to ACLS or PALS.`;
  }
  if (b.includes("pals")) {
    return `${full} gives pediatric teams a structured approach to respiratory failure, shock, and cardiac arrest. Learners practice systematic assessment and team communication tailored to infants and children.`;
  }
  if (course.categorySlug === "dole" || b.includes("bosh") || b.includes("osh")) {
    return `${full} helps organizations meet Philippine OSH expectations, reduce incident severity, and build competent safety leaders. Participants leave with practical tools for hazard control, documentation, and continuous improvement aligned with DOLE-relevant practice.`;
  }
  if (course.categorySlug === "pecb" || b.includes("iso")) {
    return `${full} supports auditors and management-system owners who need consistent, evidence-based audit practice against ISO frameworks. Teams gain confidence planning audits, evaluating findings, and driving corrective action.`;
  }
  if (course.categorySlug === "denr") {
    return `${full} strengthens environmental compliance roles with clear guidance on legal duties, permitting concepts, and stewardship practices expected of pollution control and environmental officers in the Philippines.`;
  }
  if (course.categorySlug === "tesda") {
    return `${full} aligns with competency-based training and assessment pathways so learners can demonstrate job-ready skills and progress toward NC-style certification where applicable.`;
  }
  if (course.categorySlug === "maritime") {
    return `${full} addresses STCW-aligned safety, survival, and emergency competencies required of seafarers and maritime support personnel operating in high-risk environments.`;
  }
  return `${full} combines structured instruction with applied practice so participants can implement learning quickly—whether you are upskilling individuals, preparing for assessment, or standardizing team competence across sites.`;
}

function buildWhoNeeds(course: Course): string[] {
  const b = blob(course);
  if (course.audience.length && !usesGenericAudience(course)) {
    return course.audience.map((a) => `${a} seeking structured, accredited-style training for this competency.`);
  }

  if (b.includes("acls") || b.includes("advanced cardiac")) {
    return [
      "Physicians, nurses, and paramedics who manage adult cardiac emergencies.",
      "Critical care, emergency, and peri-operative teams requiring ACLS provider or refresher credentials.",
      "Senior EMS providers and resuscitation team leaders.",
    ];
  }
  if (b.includes("food safety") || b.includes("haccp")) {
    return [
      "Food handlers, kitchen staff, and production operators.",
      "QA assistants and supervisors responsible for hygiene monitoring.",
      "Establishments preparing for regulatory inspection or supplier audits.",
    ];
  }

  const byCategory: Record<string, string[]> = {
    dole: [
      "Workers, supervisors, and safety officers covered by workplace OSH rules.",
      "Contractor personnel required to complete orientation before site access.",
      "Organizations building or refreshing their safety officer pipeline.",
    ],
    ems: [
      "Nurses, allied health professionals, and industrial medics.",
      "Hospital, clinic, and pre-hospital teams upgrading resuscitation skills.",
      "Designated workplace emergency responders.",
    ],
    denr: [
      "Pollution control officers and environmental compliance staff.",
      "EHS managers supporting permitting and monitoring programs.",
      "Facility representatives accountable for DENR reporting.",
    ],
    tesda: [
      "Trainees pursuing NC qualifications or skills certification.",
      "Career entrants and workers upskilling for regulated trades.",
      "Employers sponsoring cohort-based competency programs.",
    ],
    pecb: [
      "Lead and internal auditors pursuing ISO-aligned credentials.",
      "QHSE managers responsible for management-system performance.",
      "Consultants supporting certification and surveillance audits.",
    ],
    maritime: [
      "Seafarers and marine crew requiring STCW-aligned training.",
      "Manning agencies and vessel operators scheduling mandatory refreshers.",
      "Offshore and port-support personnel with survival competencies.",
    ],
    cpd: [
      "Licensed professionals accumulating continuing education units.",
      "Practitioners maintaining board or regulatory renewal requirements.",
      "Employers sponsoring modular professional development.",
    ],
    default: [
      "Professionals responsible for implementing this competency at work.",
      "Supervisors standardizing team practice and documentation.",
      "Organizations planning public cohort or corporate delivery.",
    ],
  };

  return byCategory[course.categorySlug] ?? byCategory.default;
}

function usesGenericAudience(course: Course): boolean {
  const generic = ["Professionals upgrading skills in this track", "Supervisors responsible for team competence"];
  return course.audience.every((a) => generic.some((g) => a.includes(g.split(" ")[0]!)));
}

function buildKeyComponents(course: Course): string[] {
  const b = blob(course);

  if (b.includes("acls")) {
    return [
      "High-quality CPR, defibrillation, and team roles during cardiac arrest.",
      "Rhythm recognition and electrical/pharmacologic management of peri-arrest rhythms.",
      "Airway management, vascular access, and medication algorithms.",
      "Post-cardiac arrest care, debriefing, and systems-of-care considerations.",
      "Megacode simulations with instructor feedback.",
    ];
  }
  if (b.includes("bls")) {
    return [
      "Single-rescuer and team-based CPR for adult, child, and infant patients.",
      "AED operation and safe scene management.",
      "Relief of foreign-body airway obstruction.",
      "Team communication and high-performance CPR concepts.",
    ];
  }
  if (b.includes("confined space")) {
    return [
      "Hazard identification, atmospheric testing, and permit systems.",
      "Entry roles: entrant, attendant, and entry supervisor responsibilities.",
      "Ventilation, communication, and emergency stop procedures.",
      "Non-entry rescue awareness and documentation.",
    ];
  }
  if (b.includes("fire")) {
    return [
      "Fire chemistry, classes of fire, and extinguisher selection.",
      "Hot-work controls, fire watch duties, and evacuation coordination.",
      "Practical drills using appropriate extinguishing agents where applicable.",
    ];
  }

  const byCategory: Record<string, string[]> = {
    dole: [
      "Legal and regulatory context for Philippine OSH practice.",
      "Hazard identification, risk assessment, and hierarchy of controls.",
      "Safe work procedures, PPE, and incident reporting expectations.",
      "Scenario-based exercises and competency checks.",
    ],
    ems: [
      "Structured assessment frameworks for time-critical patients.",
      "Skills stations with instructor coaching and verification.",
      "Team roles, communication, and equipment familiarization.",
      "Certification or refresher preparation where applicable.",
    ],
    denr: [
      "Environmental legal duties and permitting concepts.",
      "Monitoring, reporting, and pollution prevention measures.",
      "Case examples relevant to PCO and compliance roles.",
    ],
    tesda: [
      "Competency standards and performance criteria for the qualification.",
      "Hands-on practice toward workplace-ready skills.",
      "Assessment preparation and documentation support.",
    ],
    pecb: [
      "Audit planning, evidence gathering, and sampling techniques.",
      "Nonconformity classification, reporting, and follow-up.",
      "ISO clause interpretation workshops and case studies.",
    ],
    maritime: [
      "STCW-aligned safety, survival, and emergency drills.",
      "On-board procedures, PPE, and muster responsibilities.",
      "Regulatory documentation and refresher requirements.",
    ],
    default: [
      "Foundational concepts, terminology, and regulatory context.",
      "Guided practice and scenario-based application.",
      "Assessment or certification preparation where required.",
      "Take-home resources for workplace implementation.",
    ],
  };

  return byCategory[course.categorySlug] ?? byCategory.default;
}

function buildWhereToTrain(course: Course): string {
  const { short } = courseNames(course.title);
  return `Public runs for ${short} are scheduled through Petrosphere when cohorts are confirmed—check the Training Calendar for open dates in Puerto Princesa and other venues as published. Corporate and on-site delivery is available for teams that need aligned schedules, dedicated instructors, or location-specific drills. Use Enroll for the next public intake or Corporate Booking to request a proposal for your organization.`;
}

function buildCertification(course: Course): string {
  const { full, short } = courseNames(course.title);
  const b = blob(course);

  if (b.includes("acls") || b.includes("bls") || b.includes("pals")) {
    return `Successful completion of ${full} results in a provider course completion record suitable for hospital credentialing and renewal cycles, subject to your institution's requirements. Participants should arrive prepared for skills testing; bring current provider manuals or digital resources if your accrediting body requires them.`;
  }
  if (course.categorySlug === "dole" || b.includes("bosh")) {
    return `${full} is delivered in line with DOLE-relevant occupational safety and health practice. Certificates of completion support employer training records, safety officer accreditation pathways, and audit evidence—confirm specific accreditation requirements with your HR or compliance team before enrolling.`;
  }
  if (course.categorySlug === "pecb") {
    return `${short} training supports PECB certification examination preparation. Exam registration, eligibility, and certificate issuance are governed by PECB; Petrosphere provides the instructional program aligned to the standard.`;
  }
  if (course.categorySlug === "tesda") {
    return `${full} may contribute toward TESDA unit competencies and assessment when delivered under an accredited qualification arrangement. Confirm NC mapping and assessment scheduling with admissions for your cohort.`;
  }
  return `Participants who meet attendance and assessment requirements receive a Petrosphere certificate of completion for ${full}. Licensing, professional board, or third-party certification rules vary by role—verify acceptance with your employer or regulator before enrolling.`;
}

function buildComplianceBenefits(course: Course): string {
  const { short } = courseNames(course.title);
  const b = blob(course);

  if (course.categorySlug === "dole" || b.includes("osh") || b.includes("safety")) {
    return `Documented ${short} training strengthens OSH program evidence for DOLE inspections, client audits, and ISO 45001-aligned management systems. Teams reduce repeat incidents, improve induction consistency, and demonstrate due diligence for contractors and visitors.`;
  }
  if (course.categorySlug === "denr") {
    return `${short} training supports environmental permit conditions, self-monitoring reports, and management review inputs. Organizations show proactive stewardship and clearer accountability for PCO roles.`;
  }
  if (course.categorySlug === "pecb") {
    return `Auditor-ready teams improve surveillance outcomes, reduce major nonconformities, and accelerate corrective action closure across quality, environmental, and OH&S management systems.`;
  }
  return `Structured ${short} training creates consistent competence across sites, improves audit readiness, and gives HR and operations traceable records for onboarding, refreshers, and contractor management.`;
}

function buildCpdAnswer(course: Course): string | null {
  const { short } = courseNames(course.title);
  const b = blob(course);

  if (course.categorySlug === "cpd") {
    return `Yes—${short} is designed as continuing professional development. Bring your PRC or professional-board CPD requirements to admissions so we can confirm unit credits, attendance proof, and documentation format for your license renewal cycle.`;
  }
  if (
    b.includes("acls") ||
    b.includes("bls") ||
    b.includes("pals") ||
    b.includes("iv therapy") ||
    b.includes("nurse")
  ) {
    return `Many healthcare employers and professional boards accept ${short} training toward CPD or credentialing maintenance, but credit rules differ by specialty and issuer. Contact admissions with your license type so we can advise on certificates, hours, and supporting documents.`;
  }
  if (course.categorySlug === "pecb" || course.categorySlug === "tesda") {
    return `This program primarily supports certification or competency pathways rather than PRC CPD units. If you need CPD credit for a licensed profession, ask admissions whether a related CPD module is scheduled or if your board accepts the completion certificate.`;
  }
  return `CPD applicability depends on your professional regulator. If you are a licensed engineer, nurse, or other regulated professional, email admissions with your license details—we will confirm whether ${short} completion can support your renewal documentation.`;
}

export function buildCourseDetailSections(course: Course): CourseDetailSection[] {
  const { full, short } = courseNames(course.title);

  const sections: CourseDetailSection[] = [
    {
      id: "why-train",
      title: `Why Train in ${full}?`,
      body: { type: "paragraphs", paragraphs: [buildWhyTrain(course)] },
    },
    {
      id: "who-needs",
      title: `Who Needs ${full} Training?`,
      body: { type: "bullets", items: buildWhoNeeds(course) },
    },
    {
      id: "objectives",
      title: `Objectives of ${short} Training:`,
      body: { type: "bullets", items: course.objectives },
    },
    {
      id: "key-components",
      title: `Key Components of ${short} Training:`,
      body: { type: "bullets", items: buildKeyComponents(course) },
    },
    {
      id: "where",
      title: `Where can I take ${short} training?`,
      body: { type: "paragraphs", paragraphs: [buildWhereToTrain(course)] },
    },
    {
      id: "certification",
      title: "Certification and Compliance:",
      body: { type: "paragraphs", paragraphs: [buildCertification(course)] },
    },
    {
      id: "compliance-benefits",
      title: "Compliance Benefits:",
      body: { type: "paragraphs", paragraphs: [buildComplianceBenefits(course)] },
    },
  ];

  const cpd = buildCpdAnswer(course);
  if (cpd) {
    sections.push({
      id: "cpd",
      title: `Can I use ${short} training certificate for CPD?`,
      body: { type: "paragraphs", paragraphs: [cpd] },
    });
  }

  return sections;
}
