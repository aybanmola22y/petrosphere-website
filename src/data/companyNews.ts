/**
 * Company PR / CSR / news items for the home page.
 * Replace imageSrc with paths under /public when assets are ready.
 * Internal items open `/news/[slug]`; use `external` + `externalHref` for outbound URLs.
 */
export type CompanyNewsCategory = "CSR" | "HSE NEWS" | "NEWS" | "PARTNERSHIP" | "TRAINING";

export type CompanyNewsItem = {
  id: string;
  /** URL segment for `/news/[slug]` */
  slug: string;
  category: CompanyNewsCategory;
  title: string;
  /** ISO `YYYY-MM-DD` — shown on cards */
  publishedAt: string;
  summary: string;
  imageSrc: string;
  /** Paragraphs rendered on the article page (placeholder copy until CMS) */
  body: string[];
  external?: boolean;
  externalHref?: string;
  /** Optional footer CTA on article page */
  cta?: { label: string; href: string };
};

/** Locale-friendly date line for cards (local calendar day). */
export function formatCompanyNewsDate(isoDate: string): string {
  const parts = isoDate.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return isoDate;
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

export function newsReferenceLabel(index: number): string {
  return `NEWS-${String(index + 1).padStart(3, "0")}`;
}

/** Resolve articles (including overrides from `site-content.local.json`) via `@/lib/site-content`. */

export const companyNewsItems: CompanyNewsItem[] = [
  {
    id: "csr-coastal-puerto-princesa",
    slug: "csr-coastal-puerto-princesa",
    category: "CSR",
    title: "Beyond the shoreline: Petrosphere champions coastal protection in Puerto Princesa",
    publishedAt: "2026-01-18",
    summary:
      "Team-led coastal stewardship initiative supporting shoreline preservation and community education in Puerto Princesa.",
    imageSrc:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Petrosphere volunteers joined local partners in Puerto Princesa for a coastal stewardship day focused on shoreline preservation and practical environmental education. Activities included litter removal along priority stretches, sorting for recycling where facilities allow, and short briefings for residents on how everyday choices reduce plastic reaching the water.",
      "The initiative aligns with our broader CSR commitment to operate responsibly in the communities where we train and consult. By pairing hands-on work with dialogue, we aim to reinforce long-term habits—not one-off photo opportunities.",
      "Plans are underway for follow-up sessions with schools and barangay leaders so coastal protection stays part of the conversation after our teams depart. Organizations interested in sponsoring similar programs may reach out through our contact page.",
    ],
  },
  {
    id: "love-affair-nature",
    slug: "love-affair-nature",
    category: "CSR",
    title: "Rooted in responsibility: Petrosphere at Love Affair with Nature 2026",
    publishedAt: "2026-02-03",
    summary:
      "Annual environmental volunteering reaffirms our commitment to reforestation and sustainable land stewardship.",
    imageSrc:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Petrosphere participated in Love Affair with Nature 2026, supporting native-tree planting and maintenance in coordination with municipal organisers and volunteer groups. Teams reviewed species selection for soil stability and biodiversity before planting, then documented watering and monitoring responsibilities with local stewards.",
      "Our HSE culture treats environmental care as inseparable from workplace safety: healthy ecosystems support resilient communities and clearer regulatory expectations for industry partners.",
      "We extend thanks to everyone who donated time and materials. Future editions will expand skills-sharing on erosion control basics for smallholders adjacent to project sites.",
    ],
  },
  {
    id: "moa-spe-psu",
    slug: "moa-spe-psu",
    category: "PARTNERSHIP",
    title: "Partnership continues: Petrosphere Incorporated signs MOA with SPE PSU Student Chapter",
    publishedAt: "2025-11-22",
    summary:
      "Formal collaboration strengthens pathways for petroleum engineering students and shared HSE education outreach.",
    imageSrc:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Petrosphere Incorporated and the SPE Palawan State University Student Chapter have renewed their memorandum of agreement to deepen collaboration on technical seminars, career readiness, and occupational safety awareness for petroleum engineering students.",
      "Under the MOA, Petrosphere will provide guest lecturers on topics such as process safety fundamentals, permit-to-work concepts aligned with industry practice, and pathways into certified HSE roles. Student officers will co-organise at least two outreach events per academic year with mentorship from our training leads.",
      "Both parties emphasised measurable outcomes: attendance tracking, participant feedback, and annual review of curriculum gaps versus hiring managers’ expectations. Interested faculty or student chapters elsewhere may inquire about similar partnerships.",
    ],
  },
  {
    id: "safety-leadership-webinar",
    slug: "safety-leadership-webinar",
    category: "HSE NEWS",
    title: "Safety leadership and planning webinar",
    publishedAt: "2025-10-14",
    summary:
      "Executive-facing session on safety leadership expectations, program governance, and planning cadence for supervisors.",
    imageSrc:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Petrosphere hosted an executive-facing webinar on safety leadership and program planning, tailored for supervisors and managers responsible for crew welfare and regulatory alignment. The agenda covered visible commitment from leadership, meaningful involvement of frontline workers in hazard identification, and how to avoid “paper programs” that never reach the field.",
      "Participants reviewed case patterns where lagging indicators improved only after leading indicators—near-miss reporting, observation quality, and closure rates—were tied to governance forums with accountable owners.",
      "Slides and a suggested 90-day planning checklist were shared with registrants. For organisations wanting a private cohort session with customised scenarios, our consultancy team can scope delivery format and duration.",
    ],
  },
  {
    id: "environmental-health-awareness",
    slug: "environmental-health-awareness",
    category: "NEWS",
    title: "Empowering communities through environmental health awareness",
    publishedAt: "2025-09-08",
    summary:
      "Community outreach session highlighting occupational hygiene basics and practical workplace environmental controls.",
    imageSrc:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Our outreach team delivered an environmental health awareness session for community leaders and small-business operators, focusing on ventilation basics, noise exposure mindfulness, chemical storage hygiene, and when to escalate concerns to competent authorities.",
      "Sessions used bilingual printed summaries and live demonstrations of simple monitoring concepts—without replacing accredited industrial hygiene surveys where those are required by law or contract.",
      "Feedback forms highlighted demand for repeat workshops in adjacent barangays. Petrosphere will prioritise two additional dates pending coordination with local health offices.",
    ],
  },
  {
    id: "bosh-65-trainees",
    slug: "bosh-65-trainees",
    category: "TRAINING",
    title: "Building safer workplaces: 65 trainees complete BOSH training milestone",
    publishedAt: "2025-08-26",
    summary:
      "Latest cohort milestone reinforces foundational occupational safety competencies ahead of certification audits.",
    imageSrc:
      "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Sixty-five trainees completed Bureau of Working Conditions–aligned Basic Occupational Safety and Health (BOSH) training with Petrosphere this intake, marking a steady climb in participation compared with our prior public calendar.",
      "The program emphasised hazard recognition, risk assessment communication, emergency preparedness, and documentation habits that hold up during DOLE-style audits. Practical drills complemented classroom modules so concepts translated to behaviour—not just examination answers.",
      "Congratulations to every participant and to employers who invested scheduled release time. Our next public runs and corporate-exclusive batches are listed on the courses catalogue.",
    ],
    cta: { label: "View DOLE-aligned courses", href: "/courses?category=dole" },
  },
];
