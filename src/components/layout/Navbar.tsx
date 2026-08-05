"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

type Course = { name: string; href: string };
type Group = { name: string; courses: Course[] };
type SubLink = { name: string; href: string; groups?: Group[] };
type NavItem = { name: string; href: string; children?: SubLink[] };

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

const NAV: NavItem[] = [
  { name: "About Us", href: "/about" },
  {
    name: "Courses",
    href: "/courses",
    children: [
      {
        name: "DOLE Courses",
        href: "/courses?category=dole",
        groups: [
          {
            name: "Basic Safety Programs",
            courses: [
              { name: "MESH", href: "/courses?category=dole&program=mesh" },
              { name: "BOSH SO1", href: "/courses?category=dole&program=bosh-so1" },
              { name: "BOSH SO2", href: "/courses?category=dole&program=bosh-so2" },
              { name: "COSH", href: "/courses?category=dole&program=cosh" },
            ],
          },
          {
            name: "Advanced Safety Training",
            courses: [
              { name: "Loss Control Management", href: "/courses?category=dole&program=loss-control" },
              { name: "Behavior Based Safety", href: "/courses?category=dole&program=bbs" },
              { name: "Safety Program Audit", href: "/courses?category=dole&program=safety-audit" },
            ],
          },
          {
            name: "Train the Trainer",
            courses: [
              { name: "Train the Trainer — 2 hrs", href: "/courses?category=dole&program=ttt-2" },
              { name: "Train the Trainer — 8 hrs", href: "/courses?category=dole&program=ttt-8" },
              { name: "Train the Trainer — 24 hrs", href: "/courses?category=dole&program=ttt-24" },
            ],
          },
          {
            name: "First Aid Training",
            courses: [
              { name: "EFAT", href: "/courses?category=dole&program=efat" },
              { name: "OFAT", href: "/courses?category=dole&program=ofat" },
              { name: "SFAT", href: "/courses?category=dole&program=sfat" },
            ],
          },
        ],
      },
      { name: "CPD Courses", href: "/courses?category=cpd" },
      {
        name: "EMS Courses",
        href: "/courses?category=ems",
        groups: [
          {
            name: "Cardiac & Resuscitation",
            courses: [
              { name: "BLS", href: "/courses?category=ems&program=bls" },
              { name: "ACLS", href: "/courses?category=ems&program=acls" },
              { name: "PALS", href: "/courses?category=ems&program=pals" },
            ],
          },
          {
            name: "Specialized Programs",
            courses: [
              { name: "IV Therapy Course", href: "/courses?category=ems&program=iv-therapy" },
              { name: "Rig Medic Course", href: "/courses?category=ems&program=rig-medic" },
            ],
          },
        ],
      },
      {
        name: "DENR Courses",
        href: "/courses?category=denr",
        groups: [
          {
            name: "Managing Heads",
            courses: [
              { name: "Managing Heads", href: "/courses?category=denr&program=managing-heads" },
            ],
          },
          {
            name: "PCO Program",
            courses: [
              { name: "PCO — Category A", href: "/courses?category=denr&program=pco-a" },
              { name: "PCO — Category B", href: "/courses?category=denr&program=pco-b" },
            ],
          },
        ],
      },
      {
        name: "TESDA Courses",
        href: "/courses?category=tesda",
        groups: [
          {
            name: "TESDA Programs",
            courses: [
              { name: "Bookkeeping NC III", href: "/courses?category=tesda&program=bookkeeping-nc3" },
              { name: "Caregiving NC II", href: "/courses?category=tesda&program=caregiving-nc2" },
              { name: "EMS NC II", href: "/courses?category=tesda&program=ems-nc2" },
              { name: "Healthcare Services II", href: "/courses?category=tesda&program=healthcare-services-2" },
            ],
          },
        ],
      },
      {
        name: "IADC Course",
        href: "/courses?category=iadc",
        groups: [
          {
            name: "IADC Programs",
            courses: [
              { name: "IADC RigPass", href: "/courses?category=iadc&program=rigpass" },
            ],
          },
        ],
      },
      {
        name: "PECB Courses",
        href: "/courses?category=pecb",
        groups: [
          {
            name: "ISO Standards",
            courses: [
              { name: "PECB ISO 9001", href: "/courses?category=pecb&program=iso-9001" },
              { name: "PECB ISO 14001", href: "/courses?category=pecb&program=iso-14001" },
              { name: "PECB ISO 45001", href: "/courses?category=pecb&program=iso-45001" },
            ],
          },
        ],
      },
      { name: "Maritime Courses", href: "/courses?category=maritime" },
      {
        name: "Consultancy",
        href: "/services",
        groups: [
          {
            name: "Advisory Services",
            courses: [
              { name: "OSH Consultancy", href: "/services?program=osh-consultancy" },
              { name: "Environmental Impact Assessment", href: "/services?program=eia" },
            ],
          },
        ],
      },
    ],
  },
  { name: "Schedule", href: "/schedule" },
  {
    name: "Review",
    href: "/review",
    children: [
      { name: "English Courses", href: "/review#english-courses" },
      { name: "NLE", href: "/review#nle" },
      { name: "CSC Exam Review", href: "/review#csc-exam-review" },
      { name: "LET", href: "/review#let" },
      { name: "NCLEX", href: "/review#nclex" },
      { name: "CGFNS", href: "/review#cgfns" },
      { name: "HAAD", href: "/review#haad" },
      { name: "PROMETRIC", href: "/review#prometric" },
    ],
  },
  { name: "Consultancy", href: "/services" },
  { name: "eLearning Academy", href: "https://elearning.petrosphere.com.ph/" },
];

function MobileMenuButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  const barTransition = { duration: 0.42, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="relative grid size-10 shrink-0 place-items-center rounded-md border border-white/35 text-white transition-colors duration-300 hover:border-white/55 lg:hidden"
      onClick={onClick}
    >
      <span className="relative block h-5 w-6" aria-hidden>
        <motion.span
          className="absolute left-0 top-1/2 block h-[2px] w-6 origin-center rounded-full bg-white"
          initial={false}
          animate={
            open
              ? { y: "-50%", rotate: 45 }
              : { y: "calc(-50% - 6px)", rotate: 0 }
          }
          transition={barTransition}
        />
        <motion.span
          className="absolute left-0 top-1/2 block h-[2px] w-6 origin-center rounded-full bg-white"
          initial={false}
          animate={
            open
              ? { y: "-50%", opacity: 0, scaleX: 0 }
              : { y: "-50%", opacity: 1, scaleX: 1 }
          }
          transition={barTransition}
        />
        <motion.span
          className="absolute left-0 top-1/2 block h-[2px] w-6 origin-center rounded-full bg-white"
          initial={false}
          animate={
            open
              ? { y: "-50%", rotate: -45 }
              : { y: "calc(-50% + 6px)", rotate: 0 }
          }
          transition={barTransition}
        />
      </span>
    </button>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileSubExpanded, setMobileSubExpanded] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
    setMobileSubExpanded(null);
    setOpenMenu(null);
    setOpenSub(null);
  }, [pathname, searchParams]);

  const handleEnter = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Only seed the default sub-panel when opening Courses fresh — not on brief re-enter.
    if (openMenu !== name && name === "Courses") {
      const firstWithGroups = NAV.find((n) => n.name === name)?.children?.find(
        (c) => c.groups?.length,
      );
      if (firstWithGroups) setOpenSub(firstWithGroups.name);
    }
    setOpenMenu(name);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleLeave = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
      setOpenSub(null);
    }, 400);
  };

  const handleMenuPointerLeave = (
    e: React.PointerEvent<HTMLElement>,
    hasChildren: boolean
  ) => {
    if (!hasChildren) return;
    const related = e.relatedTarget;
    if (related instanceof Node && e.currentTarget.contains(related)) return;
    handleLeave();
  };

  const handleSubEnter = (child: SubLink) => {
    cancelClose();
    if (child.groups?.length) setOpenSub(child.name);
    // Keep the mega panel open when crossing link-only rows (e.g. CPD, Maritime).
  };

  const isActive = (href: string) => {
    if (isExternalHref(href)) return false;
    const path = href.split("?")[0].split("#")[0];
    const p = pathname ?? "";
    if (path === "/") return p === "/";
    return p.startsWith(path);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full overflow-visible transition-all duration-300",
        isScrolled
          ? "bg-[#00044a]/95 backdrop-blur-md border-b border-white/10 py-4 shadow-sm"
          : "bg-[#00044a]/90 backdrop-blur-sm py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/petrologo.png"
            alt="Petrosphere"
            className="h-12 w-auto object-contain sm:h-[52px] md:h-14"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 overflow-visible">
          {NAV.map((item) => {
            const hasChildren = !!item.children?.length;
            const active = isActive(item.href);
            const activeSubLink = item.children?.find((c) => c.name === openSub && c.groups?.length);
            const isMegaMenu = !!item.children?.some((c) => c.groups?.length);
            return (
              <div
                key={item.name}
                className="relative"
                onPointerEnter={() => hasChildren && handleEnter(item.name)}
                onPointerLeave={(e) => handleMenuPointerLeave(e, hasChildren)}
              >
                {isExternalHref(item.href) ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                      active
                        ? "text-white bg-white/15"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                      active
                        ? "text-white bg-white/15"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {item.name}
                    {hasChildren && (
                      <FiChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          openMenu === item.name ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </Link>
                )}

                {hasChildren && openMenu === item.name && (
                  <div
                    className="absolute left-0 top-full z-[100] pt-2"
                    onPointerEnter={cancelClose}
                  >
                    {isMegaMenu ? (
                      <div
                        className="flex min-h-[22rem] w-[min(52rem,calc(100vw-2rem))] items-stretch overflow-hidden rounded-xl border border-border bg-background shadow-lg"
                        onPointerMove={cancelClose}
                      >
                        <div
                          className="w-64 shrink-0 border-r border-border p-2"
                          onPointerEnter={cancelClose}
                        >
                          {item.children!.map((child) => {
                            const hasGroups = !!child.groups?.length;
                            const isOpen = openSub === child.name;
                            return (
                              <div
                                key={child.name}
                                className="block"
                                onPointerEnter={() => handleSubEnter(child)}
                              >
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    isOpen
                                      ? "bg-secondary text-foreground"
                                      : "text-foreground hover:bg-secondary/60"
                                  )}
                                >
                                  <span>{child.name}</span>
                                  {hasGroups && (
                                    <FiChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                </Link>
                              </div>
                            );
                          })}
                        </div>

                        <div
                          className="min-h-[22rem] min-w-0 flex-1 p-6"
                          onPointerEnter={() => activeSubLink && handleSubEnter(activeSubLink)}
                        >
                          {activeSubLink?.groups ? (
                            <div
                              className={cn(
                                "grid gap-x-8 gap-y-6",
                                activeSubLink.groups.length === 1
                                  ? "grid-cols-1"
                                  : "grid-cols-2"
                              )}
                            >
                              {activeSubLink.groups.map((group) => (
                                <div key={group.name} className="flex flex-col gap-2">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-accent" />
                                    <h4 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                                      {group.name}
                                    </h4>
                                  </div>
                                  <div className="flex flex-col">
                                    {group.courses.map((course) => (
                                      <Link
                                        key={course.name}
                                        href={course.href}
                                        className="rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary/60 hover:text-accent"
                                      >
                                        {course.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="min-w-[14rem] rounded-xl border border-border bg-background p-2 shadow-lg"
                        onPointerMove={cancelClose}
                      >
                        {item.children!.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/60"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center shrink-0">
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-9 py-3 text-[0.9375rem] font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Enroll
          </Link>
        </div>

        <MobileMenuButton open={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 top-full flex max-h-[80vh] w-full flex-col gap-2 overflow-y-auto border-b border-white/10 bg-[#00044a] p-6 shadow-lg lg:hidden"
          >
          <nav className="flex flex-col">
            {NAV.map((item) => {
              const hasChildren = !!item.children?.length;
              const expanded = mobileExpanded === item.name;
              return (
                <div key={item.name} className="border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between">
                    {isExternalHref(item.href) ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 text-base font-medium text-white"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link href={item.href} className="flex-1 py-3 text-base font-medium text-white">
                        {item.name}
                      </Link>
                    )}
                    {hasChildren && (
                      <button
                        type="button"
                        aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
                        className="p-3 text-muted-foreground"
                        onClick={() => {
                          setMobileExpanded(expanded ? null : item.name);
                          setMobileSubExpanded(null);
                        }}
                      >
                        <FiChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            expanded ? "rotate-180" : ""
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {hasChildren && expanded && (
                    <div className="pb-3 pl-3 flex flex-col">
                      {item.children!.map((child) => {
                        const hasGroups = !!child.groups?.length;
                        const subExpanded = mobileSubExpanded === child.name;
                        return (
                          <div key={child.name} className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <Link
                                href={child.href}
                                className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground"
                              >
                                {child.name}
                              </Link>
                              {hasGroups && (
                                <button
                                  type="button"
                                  aria-label={subExpanded ? `Collapse ${child.name}` : `Expand ${child.name}`}
                                  className="p-2 text-muted-foreground"
                                  onClick={() =>
                                    setMobileSubExpanded(subExpanded ? null : child.name)
                                  }
                                >
                                  <FiChevronDown
                                    className={cn(
                                      "w-3.5 h-3.5 transition-transform",
                                      subExpanded ? "rotate-180" : ""
                                    )}
                                  />
                                </button>
                              )}
                            </div>
                            {hasGroups && subExpanded && (
                              <div className="pl-3 pb-2 flex flex-col gap-3">
                                {child.groups!.map((group) => (
                                  <div key={group.name} className="flex flex-col">
                                    <div className="flex items-center gap-2 pt-2 pb-1">
                                      <span className="w-1 h-1 rounded-full bg-accent" />
                                      <h4 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                                        {group.name}
                                      </h4>
                                    </div>
                                    {group.courses.map((course) => (
                                      <Link
                                        key={course.name}
                                        href={course.href}
                                        className="py-1.5 pl-3 text-sm text-foreground hover:text-accent"
                                      >
                                        {course.name}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="pt-4">
            <Link
              href="/schedule"
              className="block rounded-lg bg-primary py-3 text-center text-[0.9375rem] font-medium text-primary-foreground"
            >
              Enroll
            </Link>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
