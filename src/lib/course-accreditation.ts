import type { Course } from "@/data/mockData";

export type AccreditationLogo = {
  src: string;
  alt: string;
  multiply?: boolean;
};

export const ACCREDITATION_LOGOS = {
  dole: {
    src: "/logos/accreditations/dole.svg",
    alt: "Department of Labor and Employment",
  },
  ashi: {
    src: "/logos/accreditations/ashi.svg",
    alt: "American Safety & Health Institute",
  },
  british: {
    src: "/logos/accreditations/british.svg",
    alt: "British Council",
  },
  idp: {
    src: "/logos/accreditations/idp.svg",
    alt: "IDP",
  },
} as const satisfies Record<string, AccreditationLogo>;

export const homepageAccreditationLogos: AccreditationLogo[] = [
  ACCREDITATION_LOGOS.dole,
  ACCREDITATION_LOGOS.ashi,
  ACCREDITATION_LOGOS.british,
  ACCREDITATION_LOGOS.idp,
];

function courseBlob(course: Course): string {
  return `${course.title} ${course.slug} ${course.categorySlug}`.toLowerCase();
}

export function resolveCourseAccreditationLogo(course: Course): AccreditationLogo | null {
  const b = courseBlob(course);

  if (
    /acls|bls|pals|emt|ashi|blst|first aid|life support|cardiac|resuscitation|iv therapy|rig medic/.test(
      b,
    )
  ) {
    return ACCREDITATION_LOGOS.ashi;
  }

  if (/ielts/.test(b)) return ACCREDITATION_LOGOS.idp;
  if (/british|oet|celpip/.test(b)) return ACCREDITATION_LOGOS.british;

  switch (course.categorySlug) {
    case "dole":
      return ACCREDITATION_LOGOS.dole;
    case "ems":
      return ACCREDITATION_LOGOS.ashi;
    case "cpd":
      if (/ielts/.test(b)) return ACCREDITATION_LOGOS.idp;
      if (/british|oet/.test(b)) return ACCREDITATION_LOGOS.british;
      return null;
    default:
      return null;
  }
}
