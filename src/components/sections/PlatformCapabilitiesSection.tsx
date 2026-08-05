"use client";

import Image from "next/image";
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
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: idx * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-card flex flex-col gap-4 p-5 md:p-6"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="relative shrink-0">
          <div className="grid size-12 place-items-center rounded-xl border border-border bg-background p-2.5 text-foreground shadow-sm">
            <Icon className="size-1.125rem" strokeWidth={1.5} aria-hidden />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 z-10 size-2.5 rounded-full bg-accent ring-2 ring-card" />
        </div>
        <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
          {item.index}
        </span>
      </div>

      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-inner ring-1 ring-black/4">
        <Image
          src={item.imageSrc}
          alt={item.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">{item.description}</p>
      </div>
    </motion.div>
  );
}

export function PlatformCapabilitiesSection() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card md:rounded-3xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-3 text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground md:px-8 md:py-3.5 md:text-[11px]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent" />
          Platform capabilities
        </span>
        <span className="tabular-nums">4 / 4</span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {platformCapabilities.map((item, idx) => (
          <CapabilityCard key={item.index} item={item} idx={idx} />
        ))}
      </div>
    </div>
  );
}
