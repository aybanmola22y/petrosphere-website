/** Homepage / marketing slices kept separate from course catalog (`mockData.ts`) so server routes stay lean. */

export type StudentVideoTestimonial = {
  id: string;
  studentName: string;
  credential: string;
  summary: string;
  youtubeVideoId: string;
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
