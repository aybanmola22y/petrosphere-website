import type { Course } from "@/data/mockData";

export type CourseVisual = { src: string; alt: string };

type Topic =
  | "classroom"
  | "construction"
  | "industrial"
  | "medical"
  | "study"
  | "documents"
  | "meeting"
  | "environment"
  | "maritime"
  | "skills";

type ImageRule = {
  priority: number;
  topic: Topic;
  match: (b: string) => boolean;
  ids: string[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

function upgradeUnsplashSrc(src: string): string {
  try {
    const url = new URL(src);
    if (url.hostname !== "images.unsplash.com") return src;
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", "3840");
    url.searchParams.set("q", "90");
    return url.toString();
  } catch {
    return src;
  }
}

const FIRE_FIGHTING_TRAINING_IMAGE = "/images/courses/basic-fire-fighting-training.png";
const BASIC_FIRST_AID_TRAINING_IMAGE = "/images/courses/basic-first-aid-training.png";
const ACLS_TRAINING_IMAGE = "/images/courses/acls-training.png";
const BLS_TRAINING_IMAGE = "/images/courses/bls-training.png";
const CIVIL_SERVICE_TRAINING_IMAGE = "/images/courses/civil-service-training.png";
const BOSH_SO1_TRAINING_IMAGE = "/images/courses/bosh-so1-training.png";
const BOSH_SO2_TRAINING_IMAGE = "/images/courses/bosh-so2-training.png";
const CHEMICAL_SAFETY_TRAINING_IMAGE = "/images/courses/chemical-safety-training.png";
const EMS_TRAINING_IMAGE = "/images/courses/emergency-medical-services-training.png";
const MESH_TRAINING_IMAGE = "/images/courses/mesh-training.png";
const FOOD_SAFETY_TRAINING_IMAGE = "/images/courses/food-safety-training.png";
const LOTO_TRAINING_IMAGE = "/images/courses/loto-lockout-tagout.png";
const LOTO_ELEARNING_TRAINING_IMAGE = "/images/courses/loto-elearning-training.jpg";
const PCO_CATEGORY_A_TRAINING_IMAGE = "/images/courses/pco-category-a-training.png";
const PCO_CATEGORY_B_TRAINING_IMAGE = "/images/courses/pco-category-b-training.png";
const COSH_TRAINING_IMAGE = "/images/courses/cosh-training.jpg";
const IV_TRAINING_IMAGE = "/images/courses/iv-training.png";
const NEBOSH_TRAINING_IMAGE = "/images/courses/nebosh-training.png";

function resolveImageSrc(id: string): string {
  if (id.startsWith("/") || /^https?:\/\//i.test(id)) return id;
  return unsplash(id);
}

/**
 * Course-specific rules — each course type maps to training-relevant photos only.
 * No headshots, microphones, diving, or stock "business" portraits.
 */
const RULES: ImageRule[] = [
  {
    priority: 110,
    topic: "medical",
    match: (b) => b.includes("efat") || b.includes("emergency first aid"),
    ids: ["photo-1576091160550-2173dba999ef"],
  },
  {
    priority: 109,
    topic: "medical",
    match: (b) => b.includes("ofat") || b.includes("occupational first aid"),
    ids: ["photo-1582750433449-648ed127bb54"],
  },
  {
    priority: 108,
    topic: "medical",
    match: (b) => b.includes("sfat") || b.includes("standard first aid"),
    ids: ["photo-1631815588090-d4bfec5b1ccb"],
  },
  {
    priority: 107,
    topic: "medical",
    match: (b) => b.includes("basic first aid") || b.includes("bfat"),
    ids: [BASIC_FIRST_AID_TRAINING_IMAGE],
  },
  {
    priority: 106,
    topic: "medical",
    match: (b) =>
      (b.includes("first aid") || b.includes("first-aid")) &&
      !b.includes("efat") &&
      !b.includes("ofat") &&
      !b.includes("sfat") &&
      !b.includes("bfat") &&
      !b.includes("basic first aid") &&
      !b.includes("occupational first aid") &&
      !b.includes("emergency first aid") &&
      !b.includes("standard first aid"),
    ids: ["photo-1666214280557-f1b5022eb634"],
  },
  {
    priority: 105,
    topic: "medical",
    match: (b) =>
      b.includes("pals") ||
      b.includes("pediatric advance") ||
      b.includes("pediatric advanced") ||
      b.includes("pediatric life"),
    ids: ["photo-1551076805-e1869033e561"],
  },
  {
    priority: 104,
    topic: "medical",
    match: (b) => b.includes("acls") || b.includes("advanced cardiac"),
    ids: [ACLS_TRAINING_IMAGE],
  },
  {
    priority: 103,
    topic: "medical",
    match: (b) =>
      (b.includes("bls") || b.includes("basic life support")) &&
      !b.includes("acls") &&
      !b.includes("pals"),
    ids: [BLS_TRAINING_IMAGE],
  },
  {
    priority: 101,
    topic: "medical",
    match: (b) =>
      b.includes("emergency medical services") ||
      b.includes("ems nc") ||
      b.includes("ems-nc"),
    ids: [EMS_TRAINING_IMAGE],
  },
  {
    priority: 103,
    topic: "medical",
    match: (b) =>
      b.includes("intravenous") ||
      b.includes("iv therapy") ||
      b.includes("iv training") ||
      b.includes("iv-therapy"),
    ids: [IV_TRAINING_IMAGE],
  },
  {
    priority: 102,
    topic: "medical",
    match: (b) => b.includes("rig medic") || b.includes("emt"),
    ids: ["photo-1584515933487-779824d29309", "photo-1530026405186-ed1f139313f8"],
  },
  {
    priority: 102,
    topic: "classroom",
    match: (b) => (b.includes("behavior") && b.includes("safety")) || b.includes("bbs"),
    ids: ["photo-1523580494863-6f3031224c94", "photo-1552664730-d307ca884978"],
  },
  {
    priority: 100,
    topic: "classroom",
    match: (b) =>
      b.includes("bosh") && (b.includes("so2") || b.includes("officer 2") || b.includes("bosh002")),
    ids: [BOSH_SO2_TRAINING_IMAGE],
  },
  {
    priority: 99,
    topic: "classroom",
    match: (b) =>
      b.includes("bosh") && (b.includes("so1") || b.includes("officer 1") || b.includes("bosh001")),
    ids: [BOSH_SO1_TRAINING_IMAGE],
  },
  {
    priority: 98,
    topic: "construction",
    match: (b) => b.includes("cosh") || b.includes("construction occupational"),
    ids: [COSH_TRAINING_IMAGE],
  },
  {
    priority: 97,
    topic: "construction",
    match: (b) =>
      b.includes("working at height") ||
      b.includes("work at height") ||
      b.includes("working at heights") ||
      b.includes(" lirt") ||
      b.startsWith("lirt") ||
      (b.includes("height") && (b.includes("fall") || b.includes("scaffold"))),
    ids: ["photo-1504307651254-35680f356dfd"],
  },
  {
    priority: 97,
    topic: "industrial",
    match: (b) =>
      (b.includes("loto") ||
        b.includes("lock out") ||
        b.includes("lock-out") ||
        b.includes("lockout") ||
        b.includes("tag out") ||
        b.includes("tag-out")) &&
      (b.includes("elearning") || b.includes("e-learning") || b.includes("e learning")),
    ids: [LOTO_ELEARNING_TRAINING_IMAGE],
  },
  {
    priority: 96,
    topic: "industrial",
    match: (b) =>
      (b.includes("lock out") ||
        b.includes("lock-out") ||
        b.includes("lockout") ||
        b.includes("tag out") ||
        b.includes("tag-out") ||
        b.includes(" loto") ||
        b.startsWith("loto")) &&
      !b.includes("elearning") &&
      !b.includes("e-learning") &&
      !b.includes("e learning"),
    ids: [LOTO_TRAINING_IMAGE],
  },
  {
    priority: 95,
    topic: "industrial",
    match: (b) => b.includes("chemical") || b.includes("hazmat") || b.includes("hzmt"),
    ids: [CHEMICAL_SAFETY_TRAINING_IMAGE],
  },
  {
    priority: 94,
    topic: "industrial",
    match: (b) => b.includes("confined space") || b.includes("confined-space") || b.includes(" cosp"),
    ids: ["photo-1504328345606-18bbc8c9d7d1"],
  },
  {
    priority: 94,
    topic: "industrial",
    match: (b) =>
      b.includes("fire fighting") ||
      b.includes("fire fighter") ||
      b.includes("firefighter") ||
      b.includes("bfft"),
    ids: [FIRE_FIGHTING_TRAINING_IMAGE],
  },
  {
    priority: 93,
    topic: "industrial",
    match: (b) =>
      b.includes("fire watch") ||
      b.includes("fire warden") ||
      b.includes("fire safety") ||
      b.includes("hot work") ||
      b.includes("hot-work"),
    ids: ["photo-1558618666-fcd25c85cd64", "photo-1489515217757-5fd1be406fef"],
  },
  {
    priority: 92,
    topic: "classroom",
    match: (b) =>
      (b.includes("mesh") ||
        b.includes("mandatory eight") ||
        b.includes("mandatory eight-hour") ||
        (b.includes("8-hour") && b.includes("mandatory"))) &&
      !b.includes("height"),
    ids: [MESH_TRAINING_IMAGE],
  },
  {
    priority: 91,
    topic: "classroom",
    match: (b) => b.includes("train the trainer") || b.includes("ttt"),
    ids: ["photo-1521737604893-d14cc237f11d"],
  },
  {
    priority: 90,
    topic: "industrial",
    match: (b) => b.includes("loss control") || b.includes(" lcm"),
    ids: ["photo-1473341304170-971dccb5ac1e"],
  },
  {
    priority: 88,
    topic: "documents",
    match: (b) => b.includes("safety audit") || b.includes("spat"),
    ids: ["photo-1454165804606-c3d57bc86b40"],
  },
  {
    priority: 87,
    topic: "industrial",
    match: (b) => b.includes("food safety") || b.includes("haccp") || b.includes("food hygiene"),
    ids: [FOOD_SAFETY_TRAINING_IMAGE],
  },
  {
    priority: 83,
    topic: "study",
    match: (b) => b.includes("nebosh") || b.includes("national examination board"),
    ids: [NEBOSH_TRAINING_IMAGE],
  },
  {
    priority: 82,
    topic: "study",
    match: (b) =>
      b.includes("civil service") || (b.includes("csc") && b.includes("review")),
    ids: [CIVIL_SERVICE_TRAINING_IMAGE],
  },
  {
    priority: 81,
    topic: "study",
    match: (b) => b.includes("ielts") || b.includes("nclex") || b.includes("oet"),
    ids: ["photo-1488190211105-8b0e65b80b4e"],
  },
  {
    priority: 80,
    topic: "industrial",
    match: (b) => b.includes("rigpass") || b.includes("iadc") || b.includes("well control"),
    ids: ["photo-1581094794329-c8112a89af12"],
  },
  {
    priority: 79,
    topic: "documents",
    match: (b) =>
      b.includes("iso 9001") ||
      b.includes("iso 14001") ||
      b.includes("iso 45001") ||
      b.includes("lead auditor"),
    ids: ["photo-1450101499163-c8848c66ca85"],
  },
  {
    priority: 80,
    topic: "environment",
    match: (b) => b.includes("pco-a") || (b.includes("pco") && b.includes("category a")),
    ids: [PCO_CATEGORY_A_TRAINING_IMAGE],
  },
  {
    priority: 79,
    topic: "environment",
    match: (b) => b.includes("pco-b") || (b.includes("pco") && b.includes("category b")),
    ids: [PCO_CATEGORY_B_TRAINING_IMAGE],
  },
  {
    priority: 78,
    topic: "environment",
    match: (b) =>
      (b.includes("pco") || b.includes("pollution control") || b.includes("managing head")) &&
      !b.includes("pco-a") &&
      !b.includes("pco-b") &&
      !b.includes("category a") &&
      !b.includes("category b"),
    ids: ["photo-1441974231531-c6227db76b6e"],
  },
  {
    priority: 77,
    topic: "maritime",
    match: (b) => b.includes("maritime") || b.includes("stcw") || b.includes("seafarer"),
    ids: ["photo-1559827260-dc66d52bef19"],
  },
  {
    priority: 76,
    topic: "skills",
    match: (b) => b.includes("bookkeeping") || b.includes("caregiving") || b.includes("tesda"),
    ids: ["photo-1517245386807-bb43f82c33c4"],
  },
  {
    priority: 75,
    topic: "meeting",
    match: (b) => b.includes("consult") || b.includes(" eia") || b.includes("environmental impact"),
    ids: ["photo-1556761175-5973dc0f32e7"],
  },
];

/** Training-relevant pools only — no portraits, diving (except maritime), mics, or laptop cafes. */
const TOPIC_POOL: Record<Topic, string[]> = {
  classroom: [
    "photo-1524178232363-1fb2b075b655",
    "photo-1544531586-fde5298cdd40",
    "photo-1552664730-d307ca884978",
    "photo-1522202176988-66273c2fd55f",
    "photo-1509062522246-3755977927d7",
    "photo-1580582932707-520aed937b7b",
    "photo-1577896851231-70ef18881754",
    "photo-1531482615713-2afd69097998",
    "photo-1523580494863-6f3031224c94",
    "photo-1522071820081-009f0129c71c",
    "photo-1521737604893-d14cc237f11d",
    "photo-1540555700478-4be289fbecef",
  ],
  construction: [
    "photo-1504307651254-35680f356dfd",
    "photo-1503387762-592deb58ef4e",
    "photo-1541888946425-d81bb19240f5",
    "photo-1504917595217-d4dc5ebe6122",
    "photo-1558591710-4b4a1ae0f04d",
  ],
  industrial: [
    "photo-1558618666-fcd25c85cd64",
    "photo-1544197150-94e23c7e8b69",
    "photo-1581092160562-40aa08e78837",
    "photo-1504328345606-18bbc8c9d7d1",
    "photo-1581094794329-c8112a89af12",
    "photo-1581091226825-a6a2a5aee158",
    "photo-1581092162384-8987c1d64718",
    "photo-1553413077-190dd305871c",
    "photo-1565793298595-6a879b1d9492",
    "photo-1473341304170-971dccb5ac1e",
    "photo-1586528116311-ad8dd3c8310d",
    "photo-1553877522-43269d4ea984",
    "photo-1489515217757-5fd1be406fef",
  ],
  medical: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1551076805-e1869033e561",
    "photo-1576091160550-2173dba999ef",
    "photo-1579684385127-1ef15d508118",
    "photo-1584515933487-779824d29309",
    "photo-1582750433449-648ed127bb54",
    "photo-1631815588090-d4bfec5b1ccb",
    "photo-1666214280557-f1b5022eb634",
    "photo-1516549655169-df83a0774514",
    "photo-1530026405186-ed1f139313f8",
  ],
  study: [
    "photo-1503676260728-1c00da094a0b",
    "photo-1434030216411-0b793f4b4173",
    "photo-1488190211105-8b0e65b80b4e",
    "photo-1606326608606-aa0b62935f2b",
    "photo-1501504905252-473c47e087f8",
    "photo-1471107340929-a87cd0f5b5f3",
    "photo-1481627834876-b7833e8f5570",
    "photo-1497633762265-9d179a990aa6",
    "photo-1524995997946-a1c2e315a42f",
    "photo-1457369804613-52c61a468e7d",
    "photo-1512820790803-83ca734da794",
    "photo-1517842645767-c639042777db",
  ],
  documents: [
    "photo-1454165804606-c3d57bc86b40",
    "photo-1450101499163-c8848c66ca85",
    "photo-1486312338219-ce68d2c6f44d",
    "photo-1554224155-6726b3ff858f",
    "photo-1554224154-26032ffc0d07",
    "photo-1579621970563-ebec7560ff3e",
  ],
  meeting: [
    "photo-1556761175-5973dc0f32e7",
    "photo-1542744173-8e7e53415bb0",
    "photo-1557804506-669a67965ba0",
    "photo-1515187029135-18ee286d815b",
    "photo-1573164574572-cb89e39749b4",
    "photo-1556761175-b413da4baf72",
  ],
  environment: [
    "photo-1441974231531-c6227db76b6e",
    "photo-1416879595882-3373a0480b5b",
    "photo-1611273426858-450d8e3c9fce",
  ],
  maritime: [
    "photo-1559827260-dc66d52bef19",
    "photo-1544551763-46a013bb70d5",
    "photo-1464037866556-6812c9d1c72e",
    "photo-1578575437130-527eed3abbec",
  ],
  skills: [
    "photo-1517245386807-bb43f82c33c4",
    "photo-1588196749597-9ff075ee6b5b",
    "photo-1551650975-87deedd944c3",
  ],
};

const SORTED_RULES = [...RULES].sort((a, b) => b.priority - a.priority);

function blob(course: Course): string {
  return `${course.title} ${course.slug} ${course.categorySlug} ${course.category}`.toLowerCase();
}

function visualKey(course: Course): string {
  return `${course.slug}|${course.id}`;
}

function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function matchRule(course: Course): ImageRule | undefined {
  const b = blob(course);
  return SORTED_RULES.find((rule) => rule.match(b));
}

function courseTopic(course: Course): Topic {
  const matched = matchRule(course);
  if (matched) return matched.topic;

  const b = blob(course);
  if (course.categorySlug === "ems") return "medical";
  if (course.categorySlug === "tesda") return "skills";
  if (course.categorySlug === "pecb") return "documents";
  if (course.categorySlug === "consultancy") return "meeting";
  if (course.categorySlug === "denr") return "environment";
  if (course.categorySlug === "maritime") return "maritime";
  if (course.categorySlug === "cpd") return "study";
  if (course.categorySlug === "iadc") return "industrial";
  if (
    b.includes("civil service") ||
    (b.includes("csc") && b.includes("review")) ||
    b.includes("ielts")
  ) {
    return "study";
  }
  if (
    b.includes("cosh") ||
    b.includes("construction") ||
    b.includes("scaffold") ||
    b.includes("height")
  ) {
    return "construction";
  }
  if (
    b.includes("confined") ||
    b.includes("chemical") ||
    b.includes("hazmat") ||
    b.includes("lock out") ||
    b.includes("lockout") ||
    b.includes("loto") ||
    b.includes("fire fighting") ||
    b.includes("fire fighter") ||
    b.includes("firefighter") ||
    b.includes("bfft") ||
    b.includes("fire watch") ||
    b.includes("fire warden") ||
    b.includes("fire safety") ||
    b.includes("hot work") ||
    b.includes("hot-work")
  ) {
    return "industrial";
  }
  if (
    b.includes("first aid") ||
    b.includes("bls") ||
    b.includes("acls") ||
    b.includes("pals") ||
    b.includes("emt") ||
    b.includes("efat") ||
    b.includes("ofat") ||
    b.includes("sfat")
  ) {
    return "medical";
  }
  return "classroom";
}

function isUsableSrc(src: string): boolean {
  if (!(/^https?:\/\//i.test(src) || src.startsWith("/"))) return false;
  if (src.includes("background.jpg")) return false;
  if (/header-?\.jpe?g$/i.test(src)) return false;
  return true;
}

/** Curated local photos always beat catalog/Unsplash covers. */
function localCourseOverride(course: Course): string | undefined {
  const matched = matchRule(course);
  if (!matched) return undefined;
  const localId = matched.ids.find((id) => id.startsWith("/images/courses/"));
  return localId ? resolveImageSrc(localId) : undefined;
}

/** Prefer rule-specific photos, then same-topic pool — never unrelated stock shots. */
function pickForCourse(used: Set<string>, course: Course): string | undefined {
  const topic = courseTopic(course);
  const matched = matchRule(course);
  const start = hashKey(visualKey(course));

  // Shared local assets (e.g. Lock Out Tag Out + LOTO eLearning) may repeat.
  const local = localCourseOverride(course);
  if (local) return local;

  if (matched) {
    for (let i = 0; i < matched.ids.length; i++) {
      const src = resolveImageSrc(matched.ids[(start + i) % matched.ids.length]);
      if (!used.has(src)) return src;
    }
  }

  const topicPool = TOPIC_POOL[topic];
  for (let i = 0; i < topicPool.length; i++) {
    const src = resolveImageSrc(topicPool[(start + i) % topicPool.length]);
    if (!used.has(src)) return src;
  }

  if (matched && matched.ids.length > 0) {
    return resolveImageSrc(matched.ids[start % matched.ids.length]);
  }
  if (topicPool.length > 0) {
    return resolveImageSrc(topicPool[start % topicPool.length]);
  }

  return undefined;
}

export function assignCourseVisuals(courses: Course[]): Map<string, string> {
  const used = new Set<string>();
  const out = new Map<string, string>();
  const sorted = [...courses].sort((a, b) => visualKey(a).localeCompare(visualKey(b)));

  for (const course of sorted) {
    // Both "Lock Out Tag Out" and "LOTO eLearning" share the same curated photo.
    const local = localCourseOverride(course);
    if (local) {
      out.set(course.id, local);
      continue;
    }

    const uploaded = course.imageSrc?.trim();
    if (uploaded && isUsableSrc(uploaded) && !used.has(uploaded)) {
      out.set(course.id, uploaded);
      used.add(uploaded);
      continue;
    }

    const src = pickForCourse(used, course);
    if (src) {
      out.set(course.id, src);
      used.add(src);
    }
  }

  return out;
}

export function courseCardVisual(course: Course, assignedSrc?: string): CourseVisual {
  if (assignedSrc?.trim()) {
    return { src: assignedSrc.trim(), alt: course.title };
  }
  const local = localCourseOverride(course);
  if (local) {
    return { src: local, alt: course.title };
  }
  const uploaded = course.imageSrc?.trim();
  if (uploaded && isUsableSrc(uploaded)) {
    return { src: uploaded, alt: course.title };
  }
  const fallback = pickForCourse(new Set(), course);
  if (!fallback) {
    return { src: resolveImageSrc(TOPIC_POOL[courseTopic(course)][0]), alt: course.title };
  }
  return { src: fallback, alt: course.title };
}

/**
 * Same course-matched visual as the card (local override / rule / catalog).
 * Only Unsplash URLs are upgraded to 4K — never swap in an unrelated topic photo.
 */
export function courseDetailVisual(course: Course, assignedSrc?: string): CourseVisual {
  const card = courseCardVisual(course, assignedSrc);
  if (card.src.includes("images.unsplash.com")) {
    return { src: upgradeUnsplashSrc(card.src), alt: card.alt };
  }
  return card;
}
