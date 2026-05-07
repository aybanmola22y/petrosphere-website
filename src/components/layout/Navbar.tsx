"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FiMenu, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

type Course = { name: string; href: string };
type Group = { name: string; courses: Course[] };
type SubLink = { name: string; href: string; groups?: Group[] };
type NavItem = { name: string; href: string; children?: SubLink[] };

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
  { name: "Cybersecurity", href: "/cybersecurity" },
];

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
    setOpenMenu(name);
  };

  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
      setOpenSub(null);
    }, 140);
  };

  const isActive = (href: string) => {
    const path = href.split("?")[0].split("#")[0];
    const p = pathname ?? "";
    if (path === "/") return p === "/";
    return p.startsWith(path);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
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
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const hasChildren = !!item.children?.length;
            const active = isActive(item.href);
            const activeSubLink = item.children?.find((c) => c.name === openSub);
            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => hasChildren && handleEnter(item.name)}
                onMouseLeave={() => hasChildren && handleLeave()}
              >
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

                {hasChildren && openMenu === item.name && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 flex items-start"
                    onMouseEnter={() => handleEnter(item.name)}
                    onMouseLeave={handleLeave}
                  >
                    {/* Primary panel */}
                    <div className="rounded-xl border border-border bg-background shadow-lg overflow-hidden p-2 w-64">
                      {item.children!.map((child) => {
                        const hasGroups = !!child.groups?.length;
                        const isOpen = openSub === child.name;
                        return (
                          <div
                            key={child.name}
                            onMouseEnter={() => setOpenSub(hasGroups ? child.name : null)}
                          >
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                isOpen
                                  ? "bg-secondary text-foreground"
                                  : "text-foreground hover:bg-secondary/60"
                              )}
                            >
                              <span>{child.name}</span>
                              {hasGroups && (
                                <FiChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </Link>
                          </div>
                        );
                      })}
                    </div>

                    {/* Secondary mega panel for child.groups */}
                    {activeSubLink?.groups && (
                      <div
                        className={cn(
                          "ml-2 rounded-xl border border-border bg-background shadow-lg p-6 grid gap-x-8 gap-y-6",
                          activeSubLink.groups.length === 1
                            ? "w-72 grid-cols-1"
                            : "w-[640px] grid-cols-2"
                        )}
                        onMouseEnter={() => setOpenSub(activeSubLink.name)}
                      >
                        {activeSubLink.groups.map((group) => (
                          <div key={group.name} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-1 h-1 rounded-full bg-accent" />
                              <h4 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
                                {group.name}
                              </h4>
                            </div>
                            <div className="flex flex-col">
                              {group.courses.map((course) => (
                                <Link
                                  key={course.name}
                                  href={course.href}
                                  className="px-2 py-1.5 text-sm text-foreground rounded-md hover:bg-secondary/60 hover:text-accent transition-colors"
                                >
                                  {course.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/contact?intent=corporate"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Speak to sales
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center text-sm font-medium text-primary-foreground bg-primary rounded-lg px-5 py-2.5 hover:bg-primary/90 transition-all"
          >
            Enroll
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden text-white p-2 -mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#00044a] border-b border-white/10 shadow-lg flex flex-col p-6 gap-2 max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col">
            {NAV.map((item) => {
              const hasChildren = !!item.children?.length;
              const expanded = mobileExpanded === item.name;
              return (
                <div key={item.name} className="border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 py-3 text-base font-medium text-white"
                    >
                      {item.name}
                    </Link>
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
          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/contact?intent=corporate"
              className="text-center text-sm font-medium text-foreground py-2.5 border border-border rounded-lg"
            >
              Speak to sales
            </Link>
            <Link
              href="/courses"
              className="text-center text-sm font-medium text-primary-foreground bg-primary rounded-lg py-2.5"
            >
              Enroll
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
