import { type TrainingSession } from "@/data/mockData";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TMS_SCHEMA = process.env.NEXT_PUBLIC_TMS_SCHEMA || "tms";

/** QA / smoke-test courses in TMS — hidden from catalog & schedule until deleted from the DB. */
export function isExcludedTmsTestCourseRow(row: Record<string, unknown>): boolean {
  const rawTitle = [row["title"], row["name"]].find((v) => typeof v === "string" && v.trim());
  const title = typeof rawTitle === "string" ? rawTitle.trim().toLowerCase() : "";
  if (title === "sample course") return true;

  const slugSource =
    (typeof row["slug"] === "string" && row["slug"].trim()
      ? row["slug"]
      : typeof row["url_slug"] === "string" && row["url_slug"].trim()
        ? row["url_slug"]
        : ""
    ).trim();
  const slugNorm = slugSource
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slugNorm === "sample-course" || slugNorm === "sample") return true;

  return false;
}

async function fetchCourseRowsForSlugCollisions(): Promise<Record<string, unknown>[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/courses?select=*&order=id.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "accept-profile": TMS_SCHEMA,
        },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];
    return (json as Record<string, unknown>[]).filter(
      (r) => r && typeof r === "object" && !isExcludedTmsTestCourseRow(r),
    );
  } catch {
    return [];
  }
}

export async function fetchTmsSchedules(): Promise<TrainingSession[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase credentials missing");
    return [];
  }

  const [scheduleResponse, courseRows] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/schedules?select=id,branch,status,schedule_type,courses(id,name,title,cover_image),schedule_ranges(start_date,end_date),schedule_dates(date)`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "accept-profile": TMS_SCHEMA,
        },
      }
    ),
    fetchCourseRowsForSlugCollisions(),
  ]);

  if (!scheduleResponse.ok) {
    throw new Error(`Failed to fetch TMS schedules: ${scheduleResponse.statusText}`);
  }

  const data = await scheduleResponse.json();
  const rows = Array.isArray(data) ? dedupeScheduleJsonRows(data) : [];
  const collisionBases = buildCollisionBaseSlugSet(courseRows);
  const courseById = new Map<string, Record<string, unknown>>();
  for (const row of courseRows) {
    const rid = row["id"];
    if (rid != null && String(rid).trim()) courseById.set(String(rid), row);
  }
  const sessions = mapTmsSchedules(rows, collisionBases, courseById);
  return dedupeTrainingSessionsForDisplay(sessions);
}

/** PostgREST can repeat the same schedule row when nested one-to-many embeds expand; keep one object per schedule `id`. */
function dedupeScheduleJsonRows(rows: unknown[]): unknown[] {
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const id = (row as Record<string, unknown>).id;
    const sid = id != null ? String(id).trim() : "";
    if (sid) {
      if (seen.has(sid)) continue;
      seen.add(sid);
    }
    out.push(row);
  }
  return out;
}

/**
 * TMS sometimes has two schedule records that render identically (same course, dates, branch, status).
 * Collapse to one row so the calendar stays readable; keep the numerically smallest schedule id for a stable enroll link.
 */
function dedupeTrainingSessionsForDisplay(sessions: TrainingSession[]): TrainingSession[] {
  const byKey = new Map<string, TrainingSession>();
  for (const s of sessions) {
    const k = [
      s.courseSlug,
      s.startDate,
      s.dateRange,
      s.location,
      s.status,
      s.formatNote,
      String(s.price ?? ""),
      s.courseTitle,
    ].join("\t");
    const prev = byKey.get(k);
    if (!prev) {
      byKey.set(k, s);
      continue;
    }
    const pickSmallerId = (a: TrainingSession, b: TrainingSession) => {
      const na = Number(a.id);
      const nb = Number(b.id);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na <= nb ? a : b;
      return String(a.id) <= String(b.id) ? a : b;
    };
    byKey.set(k, pickSmallerId(prev, s));
  }
  return [...byKey.values()].sort((a, b) => {
    const c = a.startDate.localeCompare(b.startDate);
    return c !== 0 ? c : String(a.id).localeCompare(String(b.id));
  });
}

function mapTmsSchedules(
  data: any[],
  collisionBases: Set<string>,
  courseById: Map<string, Record<string, unknown>>,
): TrainingSession[] {
  return data.flatMap((item) => {
    const raw = item.courses;
    const course = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
    const scheduleType = item.schedule_type;
    
    let dateRange = "TBA";
    let year = new Date().getFullYear();
    let monthKey = "unknown";
    let startDate = new Date().toISOString(); // Default

    if (scheduleType === "regular" && item.schedule_ranges?.[0]) {
      const { start_date, end_date } = item.schedule_ranges[0];
      dateRange = formatDateRange(start_date, end_date);
      const start = new Date(start_date);
      startDate = start.toISOString();
      year = start.getFullYear();
      monthKey = `${year}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    } else if (scheduleType === "staggered" && item.schedule_dates?.length > 0) {
      const dates = item.schedule_dates.map((d: any) => new Date(d.date)).sort((a: any, b: any) => a - b);
      const start = dates[0];
      const end = dates[dates.length - 1];
      dateRange = formatDateRange(start, end);
      startDate = start.toISOString();
      year = start.getFullYear();
      monthKey = `${year}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    }

    const idKey = course.id != null ? String(course.id) : "";
    const indexed = idKey ? courseById.get(idKey) : undefined;
    /** Prefer full `courses` row (parallel fetch) so slug/url/code match the catalog; schedule embed omits those to avoid PostgREST errors on missing columns. */
    const courseRow: Record<string, unknown> = indexed
      ? { ...indexed }
      : {
          id: course.id,
          name: course.name,
          title: course.title,
          slug: course.slug,
          url_slug: course.url_slug,
          code: course.code,
          course_code: course.course_code,
        };
    const baseSlug = getEffectiveCatalogRowBaseSlug(courseRow);
    const courseId =
      course.id != null && String(course.id).trim() ? String(course.id) : undefined;

    const titleStr = typeof courseRow.title === "string" ? courseRow.title : course.title;
    const nameStr = typeof courseRow.name === "string" ? courseRow.name : course.name;

    if (isExcludedTmsTestCourseRow(courseRow)) return [];

    return [
      {
      id: item.id,
      courseTitle: (typeof titleStr === "string" && titleStr.trim()) || "Unknown Course",
      courseSlug: disambiguateCatalogCourseSlug(baseSlug, courseId, collisionBases),
      categorySlug: inferCatalogCategorySlug(
        typeof titleStr === "string" ? titleStr : "",
        typeof nameStr === "string" ? nameStr : "",
        baseSlug,
      ),
      formatNote: scheduleType.toUpperCase(),
      dateRange,
      year,
      monthKey,
      startDate,
      location: item.branch ? formatBranch(item.branch) : "TBA",
      status: mapStatus(item.status),
      actionLabel: item.status === "planned" || item.status === "ongoing" ? "Enroll" : "Closed",
      price:
        registrationFeeFromCourseRow(courseRow) ??
        getPrice(
          typeof titleStr === "string" ? titleStr : "",
          typeof nameStr === "string" ? nameStr : "",
        ),
      enrollmentUrl: `https://tms.petros-global.com/guest-training-registration?schedule_id=${item.id}`,
      },
    ];
  });
}

function rowStrField(row: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

/** Prefer fee columns from Supabase `courses` when present (TMS may store real registration fees). */
function registrationFeeFromCourseRow(row: Record<string, unknown>): string | undefined {
  const raw = rowStrField(
    row,
    "registration_fee",
    "registration_fee_label",
    "price",
    "fee",
    "course_fee",
    "amount",
    "cost",
    "default_fee",
    "rate",
    "fee_php",
    "tuition",
    "tuition_fee",
  );
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/^php[\s\d]/i.test(trimmed) || trimmed.toLowerCase().startsWith("php ")) return trimmed;
  if (trimmed.startsWith("₱")) return `Php ${trimmed.slice(1).trim()}`;
  const asNum = Number(trimmed.replace(/,/g, ""));
  if (!Number.isNaN(asNum) && asNum > 0) {
    return `Php ${asNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return trimmed;
}

function getPrice(title: string, slug: string): string | undefined {
  const t = title.toLowerCase();
  const s = slug.toLowerCase();

  // DOLE — SO1 / MESH: titles spell out "Safety Officer 1" (no substring "so1")
  if (
    s.includes("bosh001") ||
    t.includes("safety officer 1") ||
    (t.includes("bosh") && t.includes("officer 1") && !t.includes("officer 2")) ||
    t.includes("mandatory eight-hour") ||
    t.includes("mesh") ||
    s.includes("mesh") ||
    (t.includes("8-hour") && (t.includes("safety") || t.includes("mesh") || t.includes("mandatory")))
  ) {
    return "Php 2,500.00";
  }
  if (
    s.includes("bosh002") ||
    t.includes("safety officer 2") ||
    (t.includes("bosh") && t.includes("officer 2")) ||
    t.includes("basic occupational safety and health training")
  ) {
    return "Php 7,000.00";
  }
  if (s.includes("cosh") || t.includes("construction occupational")) return "Php 7,000.00";
  if (s.includes("tott") || t.includes("train the trainer")) return "Php 5,500.00";
  if (s.includes("lcm") || t.includes("loss control")) return "Php 8,500.00";
  if (s.includes("spat") || t.includes("safety program audit")) return "Php 8,500.00";
  if (s.includes("iht003") || t.includes("industrial hygiene")) return "Php 8,500.00";
  if (s.includes("bbst") || t.includes("behavioral based") || t.includes("iosh")) return "Php 5,000.00";
  if (s.includes("efat") || t.includes("emergency first-aid") || t.includes("efat")) return "Php 3,000.00";
  if (s.includes("ofablst") || t.includes("occupational first aid")) return "Php 4,000.00";
  if (s.includes("sfablst") || t.includes("standard first aid")) return "Php 5,500.00";

  // PRC & ASHI
  if (s.includes("oshw") || t.includes("healthcare workers")) return "Php 5,500.00";
  if (s.includes("inct") || t.includes("infection control")) return "Php 2,800.00";
  if (s.includes("blst") || t.includes("basic life support")) return "Php 4,500.00";
  if (s.includes("acls") || t.includes("advanced cardiac")) return "Php 5,500.00";
  if (t.includes("pals") || s.includes("pals")) return "Php 5,000.00";
  if (t.includes("iv-therapy") || t.includes("ivtt")) return "Php 5,000.00";
  if (t.includes("joint commission") || s.includes("jcis")) return "Php 7,000.00";

  // Environmental
  if (s.includes("bpco") || t.includes("pollution control")) return "Php 8,500.00";
  if (s.includes("mhet") || t.includes("managing head")) return "Php 4,500.00";
  if (s.includes("eiat") || t.includes("environmental impact")) return "Php 4,500.00";
  if (s.includes("enmt") || t.includes("environmental management")) return "Php 5,500.00";

  // Oil & Gas
  if (s.includes("rigp001") || (t.includes("rigpass") && !t.includes("package"))) return "Php 8,500.00";
  if (s.includes("rigp002") || (t.includes("rigpass") && t.includes("package"))) return "Php 12,000.00";
  if (s.includes("hsog") || t.includes("technical course for oil and gas")) return "Php 12,500.00";
  if (s.includes("hspr001")) return "Php 3,000.00";
  if (s.includes("hspr002")) return "Php 4,500.00";
  if (s.includes("rstc") || t.includes("rig safety")) return "Php 15,000.00";
  if (s.includes("bbso") || t.includes("offshore operations")) return "Php 9,500.00";
  if (s.includes("irov") || t.includes("rov operations")) return "Php 8,500.00";
  if (s.includes("piic") || t.includes("p&i interpretation")) return "Php 3,500.00";
  if (s.includes("psmo") || t.includes("process safety management")) return "Php 25,000.00";
  if (s.includes("wclt") || t.includes("well control")) return "Php 3,500.00";

  // OSHA & Other
  if (s.includes("osha001")) return "Php 8,500.00";
  if (s.includes("osha002")) return "Php 12,000.00";
  if (s.includes("ddct") || t.includes("defensive driving")) return "Php 3,500.00";
  if (s.includes("slot") || t.includes("safe lifting")) return "Php 3,500.00";
  if (s.includes("bfft") || t.includes("fire fighting")) return "Php 3,500.00";
  if (s.includes("h2st") || t.includes("h2s training")) return "Php 3,500.00";
  if (s.includes("hazop002") || t.includes("hazop training")) return "Php 8,500.00";
  if (s.includes("prst001") || t.includes("process safety")) return "Php 8,500.00";
  if (s.includes("rcat") || t.includes("root cause")) return "Php 8,500.00";
  if (s.includes("hzmt") || t.includes("hazmat")) return "Php 3,500.00";

  // Lifting & Space
  if (t.includes("working at heights") || s.includes("lirt")) return "Php 4,500.00";
  if (t.includes("confined space") || s.includes("cosp")) return "Php 4,500.00";
  if (t.includes("safety leadership") || s.includes("slse")) return "Php 4,500.00";
  if (t.includes("permit to work") || s.includes("ptws")) return "Php 5,500.00";
  if (t.includes("hazid") || s.includes("hhba")) return "Php 25,000.00";

  // ISO
  if (s.includes("imst") || t.includes("ims awareness")) return "Php 2,500.00";
  if (s.includes("imsi") || t.includes("ims internal auditor")) return "Php 8,500.00";
  if (s.includes("isem") || t.includes("iso 14001")) return "Php 5,000.00";
  if (s.includes("issm") || t.includes("iso 2000")) return "Php 3,500.00";
  if (s.includes("ismt") || t.includes("iso 27001")) return "Php 3,500.00";
  if (s.includes("isms") || t.includes("iso 28000")) return "Php 3,500.00";
  if (s.includes("qmat001") || t.includes("iso 9001 awareness")) return "Php 3,500.00";
  if (s.includes("qmat002") || t.includes("iso 9001 lead auditor")) return "Php 35,000.00";
  if (t.includes("lead implementer") || t.includes("pecb")) return "Php 40,000.00";

  // Language & Design
  if (t.includes("ielts")) return "Php 6,000.00";
  if (s.includes("belt") || t.includes("basic english")) return "Php 5,500.00";
  if (s.includes("elpc") || t.includes("english proficiency")) return "Php 5,500.00";
  if (s.includes("bjlc") || t.includes("japanese language")) return "Php 5,500.00";
  if (s.includes("actt") || t.includes("autocad")) return "Php 5,000.00";
  if (s.includes("sutt") || t.includes("sketch-up")) return "Php 5,000.00";
  if (s.includes("bstt") || t.includes("computer tutorial")) return "Php 3,500.00";

  // Multimedia
  if (t.includes("photography")) return "Php 3,500.00";
  if (t.includes("photoshop")) return "Php 3,500.00";
  if (t.includes("video editing")) return "Php 5,000.00";

  // Soft Skills
  if (s.includes("bbms") || t.includes("business management")) return "Php 5,450.00";
  if (s.includes("bldt") || t.includes("leadership training")) return "Php 3,550.00";
  if (s.includes("bbts") || t.includes("better teams")) return "Php 3,550.00";
  if (s.includes("chmt") || t.includes("change management")) return "Php 3,550.00";
  if (s.includes("cams") || t.includes("coaching and mentoring")) return "Php 3,550.00";
  if (s.includes("coms") || t.includes("communication strategies")) return "Php 3,550.00";
  if (s.includes("cfrn") || t.includes("conflict resolution")) return "Php 3,550.00";
  if (s.includes("crms") || t.includes("crisis management")) return "Php 3,550.00";
  if (s.includes("csvt") || t.includes("customer service training")) return "Php 3,550.00";
  if (s.includes("dlgn") || t.includes("delegation")) return "Php 3,550.00";
  if (s.includes("hmrt") || t.includes("human resources")) return "Php 3,550.00";
  if (s.includes("lmgt") || t.includes("leadership & management")) return "Php 4,550.00";
  if (s.includes("llss") || t.includes("leadership skills")) return "Php 3,550.00";
  if (s.includes("lpit") || t.includes("lean process")) return "Php 4,550.00";
  if (s.includes("mwvs") || t.includes("workplace violence")) return "Php 3,550.00";
  if (s.includes("mots") || t.includes("motivation training")) return "Php 3,550.00";
  if (s.includes("ppts") || t.includes("personality development")) return "Php 4,550.00";
  if (s.includes("rms") || t.includes("risk management")) return "Php 3,550.00";
  if (s.includes("stms") || t.includes("stress management")) return "Php 3,550.00";
  if (s.includes("tbht") || t.includes("high performance team")) return "Php 4,550.00";
  if (s.includes("tmgt") || t.includes("time management")) return "Php 3,550.00";

  // TESDA
  if (s.includes("hskg") || t.includes("housekeeping")) return "Php 15,000.00";
  if (s.includes("bknc") || t.includes("bookkeeping")) return "Php 6,500.00";
  if (s.includes("dnc200") || t.includes("driving")) return "Php 4,000.00";
  if (s.includes("heot200") || t.includes("hydraulic excavator")) return "Php 20,000.00";
  if (t.includes("forklift")) return "Php 43,000.00";
  if (s.includes("emtr") || t.includes("emt") || t.includes("emergency medical technician")) return "Php 35,000.00";
  if (s.includes("crvg") || t.includes("caregiving")) return "Php 18,000.00";

  return undefined;
}

function getMockSlug(title: string, slug: string): string {
  const t = title.toLowerCase();
  const s = slug.toLowerCase();

  // Safety & Health
  if (t.includes("mandatory eight-hour") || t.includes("8-hour") || s === "mesh") return "mesh";
  if (s.includes("bosh001") || t.includes("so1")) return "bosh-so1";
  if (s.includes("bosh002") || t.includes("so2") || t.includes("basic occupational safety and health")) return "bosh-so2";
  if (s.includes("cosh") || t.includes("construction occupational")) return "cosh";
  if (s.includes("tott") || t.includes("train the trainer")) {
    if (t.includes("24") || t.includes("24-hour")) return "ttt-24";
    if (t.includes("8") || t.includes("8-hour")) return "ttt-8";
    return "ttt-2";
  }
  if (s.includes("lcm") || t.includes("loss control")) return "loss-control";
  if (s.includes("spat") || t.includes("safety program audit")) return "safety-audit";
  if (s.includes("bbst") || t.includes("behavioral based")) return "bbs";
  
  // First Aid & EMS (titles often use "Emergency First Aid" with a space, not "first-aid")
  if (s.includes("efat") || t.includes("emergency first-aid") || t.includes("emergency first aid")) return "efat";
  if (s.includes("ofat") || t.includes("occupational first aid")) return "ofat";
  if (s.includes("sfat") || t.includes("standard first aid")) return "sfat";
  if (s.includes("blst") || t.includes("basic life support")) return "bls-ashi";
  if (s.includes("acls") || t.includes("advanced cardiac")) return "acls-ashi";
  if (s.includes("pals") || t.includes("pediatric advanced")) return "pals-ashi";
  if (t.includes("iv-therapy") || t.includes("ivtt")) return "iv-therapy";

  // ISO & Professional
  if (t.includes("lead implementer") || t.includes("pecb")) return "lead-implementer";
  if (t.includes("9001") && t.includes("lead auditor")) return "iso-9001-lead-auditor";
  if (t.includes("9001") && t.includes("awareness")) return "iso-9001-awareness";

  // Default to original slug if no match, so it still tries the URL
  return slug || "unknown";
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateRange(startStr: string | Date, endStr: string | Date): string {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startPart = start.toLocaleDateString("en-US", options);

  if (isSameCalendarDay(start, end)) {
    return startPart;
  }

  const endPart = end.toLocaleDateString("en-US", options);
  return `${startPart} — ${endPart}`;
}

function formatBranch(branch: string): string {
  return branch
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mapStatus(status: string): TrainingSession["status"] {
  switch (status) {
    case "finished":
      return "finished";
    case "cancelled":
      return "cancelled";
    case "planned":
    case "ongoing":
      return "open";
    default:
      return "closed";
  }
}

/**
 * Public site category slug for filters (/courses?category=…).
 * Uses title + TMS code + URL slug so TESDA and other tracks are not mislabeled as DOLE.
 */
export function inferCatalogCategorySlug(title: string, courseCode: string, courseSlug: string): string {
  const raw = `${title} ${courseCode} ${courseSlug}`.toLowerCase();
  const has = (...subs: string[]) => subs.some((s) => raw.includes(s));

  if (has("maritime", "stcw", "seafarer", "basic maritime")) return "maritime";
  if (has("ielts", "oet", "nclex", "cgfns", "prometric", "cpd refresher", "cpd-accredited", "professional licensure", "csc review")) return "cpd";
  if (
    has(
      "osh consultancy",
      "environmental impact assessment",
      " eia",
      "eia ",
      "eia.",
      "consultancy engagement",
    )
  )
    return "consultancy";
  if (
    has(
      "iso 9001",
      "iso 14001",
      "iso 45001",
      "iso 27001",
      "iso 20000",
      "iso 28000",
      "lead auditor",
      "lead implementer",
      "pecb",
      "ims internal",
      "ims awareness",
      "internal auditor",
    )
  )
    return "pecb";
  if (has("rigpass", "iadc", "well control", "rig safety", "offshore operations", "rov operations")) return "iadc";

  /** TESDA — must run before EMS/DOLE defaults (titles often omit “TESDA” but use NC / unit codes). */
  if (
    has(
      "tesda",
      "nc ii",
      "nc iii",
      "nc 2",
      "nc 3",
      "ncii",
      "nciii",
      " nc-ii",
      "nc-ii",
      "nc ii —",
      "caregiving",
      "bookkeeping",
      "healthcare services",
      "healthcare nc",
      "forklift",
      "housekeeping",
      "hydraulic excavator",
      "bookkeeping nc",
      "hskg",
      "bknc",
      "dnc200",
      "heot200",
      "emtr",
      "crvg",
      "welding",
      "driving nc",
      "commercial cooking",
      "food processing",
      "bread and pastry",
      "bread making",
      "dressmaking",
      "computer systems servicing",
      "electrical installation",
      "shielded metal arc",
    )
  )
    return "tesda";

  if (has("denr", "pollution control officer", " pco", "pco-", "managing head", "dao 2014", "environmental compliance officer")) return "denr";

  if (
    has(
      "basic life support",
      "advanced cardiac",
      "advanced cardiac life",
      "pediatric advanced",
      "pediatric advance",
      "pediatric life support",
      "acls",
      "pals",
      " bls",
      "bls ",
      "-bls",
      "blst",
      "iv therapy",
      "ivtt",
      "rig medic",
      "rig-medic",
      "healthcare worker",
      "oshw",
      "infection control",
      "resuscitation",
      "emergency medical technician",
      " emt",
    )
  )
    return "ems";

  if (
    has(
      "bosh",
      "cosh",
      "mesh",
      "eight-hour",
      "8-hour",
      "mandatory eight",
      "train the trainer",
      "tott",
      "loss control",
      " lcm",
      "safety program audit",
      "spat",
      "behavioral based",
      "bbs",
      "bbst",
      "construction occupational",
      "efat",
      "ofat",
      "sfat",
      "emergency first aid",
      "occupational first aid",
      "standard first aid",
      "safety officer 1",
      "safety officer 2",
      "so1",
      "so2",
    )
  )
    return "dole";

  if (has("iso")) return "pecb";
  return "dole";
}

/** Public catalog URL slug — aligned with schedule enrollment mapping. */
export function courseSlugFromTms(title: string, courseCodeName: string): string {
  return getMockSlug(title, courseCodeName);
}

/** @deprecated Prefer inferCatalogCategorySlug(title, code, slug); kept for narrow code-only checks. */
export function courseCategorySlugFromTms(courseCodeName: string): string {
  return inferCatalogCategorySlug("", courseCodeName, courseCodeName);
}

/**
 * Same URL base slug as the public catalog uses (explicit slug column, else TMS mapping).
 * Used to detect collisions when several TMS courses map to one slug (e.g. multiple TTT variants → ttt-2).
 */
export function getEffectiveCatalogRowBaseSlug(row: Record<string, unknown>): string {
  const slugFromRow =
    typeof row.slug === "string" && row.slug.trim()
      ? row.slug.trim()
      : typeof row.url_slug === "string" && row.url_slug.trim()
        ? row.url_slug.trim()
        : "";
  if (slugFromRow) {
    return slugFromRow
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  const codeName =
    [row.name, row.code, row.course_code].find((v) => typeof v === "string" && (v as string).trim())?.toString().trim() ??
    "";
  const title =
    [row.title, row.name].find((v) => typeof v === "string" && (v as string).trim())?.toString().trim() ??
    "Training program";
  return courseSlugFromTms(title, codeName);
}

export function buildCollisionBaseSlugSet(rows: Record<string, unknown>[]): Set<string> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const b = getEffectiveCatalogRowBaseSlug(row);
    counts.set(b, (counts.get(b) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([b]) => b));
}

/** When several courses share the same base slug, keep URLs unique and stable (by course id). */
export function disambiguateCatalogCourseSlug(
  base: string,
  rowId: string | undefined,
  collisionBases: Set<string>,
): string {
  if (!collisionBases.has(base)) return base;
  const raw = (rowId ?? "").replace(/-/g, "").toLowerCase();
  const tail = raw.replace(/[^a-f0-9]/g, "").slice(0, 12) || raw.slice(0, 12);
  if (tail.length >= 6) return `${base}--${tail}`;
  return `${base}--${raw.slice(0, 8) || "course"}`;
}
