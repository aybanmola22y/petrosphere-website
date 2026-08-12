"use client";

import { useEffect, useRef, useState } from "react";
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
import { FiArrowRight } from "react-icons/fi";

import { SectionHeader } from "@/components/ui/SectionHeader";

type CapabilityImage = {
  src: string;
  alt: string;
};

type PlatformCapability = {
  index: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  images: CapabilityImage[];
};

const ROTATE_MS = 4000;

const platformCapabilities: PlatformCapability[] = [
  {
    index: "01",
    title: "Training",
    description:
      "We offer courses on BOSH, COSH, LCM, SPA, BBS, First Aid, BLS, ACLS, PALS, EMT, and many others.",
    href: "/courses",
    icon: GraduationCap,
    images: [
      {
        src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
        alt: "Safety and technical training classroom session",
      },
      {
        src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
        alt: "Industrial worksite training for occupational safety",
      },
      {
        src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
        alt: "Healthcare and emergency response training",
      },
    ],
  },
  {
    index: "02",
    title: "Review",
    description:
      "We conduct review classes on IELTS, OET, CSC, NLE, including NCLEX, CGFNS, Prometric, and many others.",
    href: "/review",
    icon: BookOpenCheck,
    images: [
      {
        src: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80",
        alt: "Examinee taking a professional licensure or review exam",
      },
      {
        src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80",
        alt: "Student writing notes during exam review class",
      },
      {
        src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=900&q=80",
        alt: "Focused study session for IELTS, OET, and board exams",
      },
    ],
  },
  {
    index: "03",
    title: "Consultancy",
    description:
      "We provide assessment, certification, and consultancy on various disciplines across industry.",
    href: "/services",
    icon: Briefcase,
    images: [
      {
        src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
        alt: "Site inspection and compliance audit with checklist",
      },
      {
        src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
        alt: "Consultants meeting with a client team",
      },
      {
        src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
        alt: "Assessment, certification, and advisory planning",
      },
    ],
  },
  {
    index: "04",
    title: "Solutions",
    description:
      "Custom tech for your business — web and mobile apps, CRM, payroll systems, and other platforms built to fit how you work.",
    href: "/services",
    icon: MonitorSmartphone,
    images: [
      {
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
        alt: "CRM and operations dashboard for business systems",
      },
      {
        src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
        alt: "Custom web application development",
      },
      {
        src: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=80",
        alt: "Mobile app and digital platform solutions",
      },
    ],
  },
];

function RotatingImage({
  images,
  startDelay = 0,
  priority = false,
}: {
  images: CapabilityImage[];
  startDelay?: number;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const pausedRef = useRef(false);
  const usable = images.filter((image) => !failed.has(image.src));
  const slides = usable.length > 0 ? usable : images.slice(0, 1);
  const active = slides[index % slides.length] ?? slides[0];

  useEffect(() => {
    if (slides.length < 2) return;

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        if (pausedRef.current) return;
        setIndex((current) => (current + 1) % slides.length);
      }, ROTATE_MS);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [slides.length, startDelay]);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  return (
    <div
      className="relative aspect-16/10 overflow-hidden bg-muted"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {slides.map((image, i) => {
        const isActive = image.src === active.src;
        return (
          <Image
            key={image.src}
            src={image.src}
            alt={isActive ? image.alt : ""}
            fill
            className={`object-cover transition-opacity duration-700 ease-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            priority={priority && i === 0}
            onError={() => {
              setFailed((current) => {
                if (current.has(image.src)) return current;
                const next = new Set(current);
                next.add(image.src);
                return next;
              });
            }}
          />
        );
      })}

      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((image) => (
            <span
              key={image.src}
              className={`h-1.5 rounded-full transition-all ${
                image.src === active.src ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CapabilityCard({ item, idx }: { item: PlatformCapability; idx: number }) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: idx * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_16px_40px_-32px_rgba(0,4,74,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/12 hover:shadow-[0_22px_50px_-30px_rgba(0,4,74,0.32)]"
    >
      <span
        className="absolute inset-x-0 top-0 z-10 h-[3px] bg-linear-to-r from-[#00044a]/0 via-[#00044a]/35 to-[#00044a]/0"
        aria-hidden
      />

      <RotatingImage images={item.images} startDelay={idx * 700} priority={idx === 0} />

      <div className="flex flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-visible rounded-xl border border-[#00044a]/10 bg-[#00044a]/[0.04] p-3 text-[#00044a]">
            <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground tabular-nums">
            {item.index}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#00044a]">
          {item.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <Link
          href={item.href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#00044a] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00044a]/20"
        >
          Know more
          <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}

export function PlatformCapabilitiesSection() {
  return (
    <div>
      <SectionHeader
        alignment="center"
        eyebrow="What we do"
        title="Services we offer"
        description="Training, review, consultancy, and custom solutions — four ways we help teams stay safer, certified, and operationally ready."
        className="mb-0"
      />

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 xl:grid-cols-4">
        {platformCapabilities.map((item, idx) => (
          <CapabilityCard key={item.index} item={item} idx={idx} />
        ))}
      </div>
    </div>
  );
}
