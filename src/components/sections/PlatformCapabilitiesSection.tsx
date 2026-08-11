"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Briefcase,
  GraduationCap,
  MonitorSmartphone,
  type LucideIcon,
} from "lucide-react";

type PlatformCapability = {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
  imageSrc: string;
  imageAlt: string;
};

const platformCapabilities: PlatformCapability[] = [
  {
    index: "01",
    title: "Training",
    description:
      "We offer courses on BOSH, COSH, LCM, SPA, BBS, First Aid, BLS, ACLS, PALS, EMT, and many others.",
    icon: GraduationCap,
    imageSrc:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Participants in a hands-on technical and safety training session",
  },
  {
    index: "02",
    title: "Review",
    description:
      "We conduct review classes on IELTS, OET, CSC, NLE, including NCLEX, CGFNS, Prometric, and many others.",
    icon: BookOpenCheck,
    imageSrc:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Learners studying and preparing for professional licensing and exam reviews",
  },
  {
    index: "03",
    title: "Consultancy",
    description:
      "We provide assessment, certification, and consultancy on various disciplines across industry.",
    icon: Briefcase,
    imageSrc:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Consultants collaborating with executives on assessment and compliance planning",
  },
  {
    index: "04",
    title: "Solutions",
    description:
      "Custom tech for your business — web and mobile apps, CRM, payroll systems, and other platforms built to fit how you work.",
    icon: MonitorSmartphone,
    imageSrc:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Business software dashboard for CRM and operations management",
  },
];

function CapabilityCard({ item, idx }: { item: PlatformCapability; idx: number }) {
  const href =
    item.title === "Training" ? "/courses" : item.title === "Review" ? "/review" : "/services";

  return (
    <motion.div
      /* Ensure the banner is always visible on the homepage (avoid opacity-0 if in-view doesn't trigger). */
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: idx * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative h-[390px] overflow-hidden bg-card md:h-[460px]"
    >
      <div className="absolute inset-0">
        <Image
          src={item.imageSrc}
          alt={item.imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-8">
        <div>
          <h3 className="text-[24px] font-semibold tracking-tight text-white">{item.title}</h3>
          <p className="mt-2 line-clamp-3 text-[13px] leading-[1.6] text-white/90">{item.description}</p>
        </div>

        <Link
          href={href}
          className="w-fit rounded-md bg-[#00044a] px-7 py-3 text-[13px] font-semibold tracking-wider text-white transition-colors hover:bg-[#0a0a5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          KNOW MORE
        </Link>
      </div>
    </motion.div>
  );
}

export function PlatformCapabilitiesSection() {
  return (
    <section className="overflow-hidden rounded-3xl bg-card">
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y divide-white/10 md:divide-y-0 md:divide-x">
        {platformCapabilities.map((item, idx) => (
          <CapabilityCard key={item.index} item={item} idx={idx} />
        ))}
      </div>
    </section>
  );
}
