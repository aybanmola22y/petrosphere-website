/** Homepage / marketing slices kept separate from course catalog (`mockData.ts`) so server routes stay lean. */

export type HomeHeroMasonryImage = {
  src: string;
  /** Taller tile in the masonry ticker (`aspect-[3/4]` vs `aspect-[4/5]`). */
  tall?: boolean;
  alt?: string;
};

/** Four columns × five images for the homepage hero masonry ticker. */
export type HomeHeroMasonryColumns = HomeHeroMasonryImage[][];

function unsplashHero(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=1000&q=80`;
}

/** Default industrial / training photos for the homepage hero grid. */
export const homeHeroMasonryColumns: HomeHeroMasonryColumns = [
  [
    { src: unsplashHero("photo-1504307651254-35680f356dfd"), tall: true },
    { src: unsplashHero("photo-1581092160562-40aa08e78837") },
    { src: unsplashHero("photo-1576091160399-112ba8d25d1d"), tall: true },
    { src: unsplashHero("photo-1524178232363-1fb2b075b655") },
    { src: unsplashHero("photo-1586528116311-ad8dd3c8310d"), tall: true },
  ],
  [
    { src: unsplashHero("photo-1541888946425-d81bb19240f5"), tall: true },
    { src: unsplashHero("photo-1517245386807-bb43f82c33c4") },
    { src: unsplashHero("photo-1581092918056-0c4c3acd3789"), tall: true },
    { src: unsplashHero("photo-1522202176988-66273c2fd55f") },
    { src: unsplashHero("photo-1504917595217-d4dc5ebe6122"), tall: true },
  ],
  [
    { src: unsplashHero("photo-1581091226825-a6a2a5aee158") },
    { src: unsplashHero("photo-1557804506-669a67965ba0"), tall: true },
    { src: unsplashHero("photo-1486406146926-c627a92ad1ab"), tall: true },
    { src: unsplashHero("photo-1454165804606-c3d57bc86b40") },
    { src: unsplashHero("photo-1573496359142-b8d87734a5a2"), tall: true },
  ],
  [
    { src: unsplashHero("photo-1460925895917-afdab827c52f"), tall: true },
    { src: unsplashHero("photo-1560250097-0b93528c311a") },
    { src: unsplashHero("photo-1521737604893-d14cc237f11d"), tall: true },
    { src: unsplashHero("photo-1504328345606-18bbc8c9d7d1") },
    { src: unsplashHero("photo-1573164713714-d95e436ab8d6"), tall: true },
  ],
];

export type StudentVideoTestimonial = {
  id: string;
  studentName: string;
  credential: string;
  summary: string;
  /** YouTube embed ID (Share → Embed). Leave empty when using `videoSrc`. */
  youtubeVideoId: string;
  /** Optional MP4/WebM/MOV served from `/videos/`. */
  videoSrc?: string;
  posterSrc: string;
};

export const stats = [
  { value: "12,000+", label: "Graduates and Trainees" },
  { value: "99.5%", label: "Satisfaction Rate" },
  { value: "6,000", label: "Course Delivered" },
  { value: "8,500", label: "Companies Supported" },
];

/** Replace `youtubeVideoId` with your own uploads (YouTube Share → Embed ID). */
export const studentVideoTestimonials: StudentVideoTestimonial[] = [
  {
    id: "sv1",
    studentName: "Maria L. Reyes",
    credential: "BOSH for Safety Officer 2 · Public cohort, Manila",
    summary:
      "“The drills weren’t theoretical—we walked our actual permits and stop-work triggers. I brought checklists back to shift briefing the next Monday.”",
    youtubeVideoId: "ScMzIvxBSi4",
    posterSrc:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "sv2",
    studentName: "Jonas Dela Cruz",
    credential: "MESH / COSH delegate · Corporate onsite program",
    summary:
      "“Our cohort mixed operators and supervisors; the facilitator kept scenarios grounded in DOLE expectations without drowning us in jargon.”",
    youtubeVideoId: "ysz5S6PUM-U",
    posterSrc:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "sv3",
    studentName: "Alyssa M. Santos",
    credential: "First Aid / BLS graduate · Puerto Princesa",
    summary:
      "“The practical scenarios made it easy to remember what to do under pressure. Our team implemented a clearer emergency response flow the same week.”",
    youtubeVideoId: "ScMzIvxBSi4",
    posterSrc:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=960&q=80",
  },
];
