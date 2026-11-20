"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

import { HeaderPillNav } from "@/components/layout/HeaderPillNav";
import { BranchedMenu } from "@/components/ui/BranchedMenu";
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
  const barTransition = { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        "relative grid size-12 shrink-0 place-items-center lg:hidden",
        "rounded-2xl text-white",
        "bg-white/10 backdrop-blur-md",
        "ring-1 ring-inset ring-white/20",
        "shadow-[0_10px_28px_-16px_rgba(0,0,0,0.55)]",
        "transition-all duration-300",
        "hover:bg-white/16 hover:ring-white/40",
        "active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80",
        open && "bg-primary/20 ring-primary/55 hover:bg-primary/25 hover:ring-primary/70",
      )}
    >
      <span className="relative block h-3.5 w-[18px]" aria-hidden>
        <motion.span
          className="absolute left-1/2 top-0 block h-[1.5px] origin-center rounded-full bg-current"
          initial={false}
          animate={
            open
              ? { x: "-50%", y: 6, rotate: 45, width: 18 }
              : { x: "-50%", y: 0, rotate: 0, width: 18 }
          }
          transition={barTransition}
        />
        <motion.span
          className="absolute left-1/2 top-1/2 block h-[1.5px] origin-center rounded-full bg-current"
          initial={false}
          animate={
            open
              ? { x: "-50%", y: "-50%", opacity: 0, width: 10, scaleX: 0 }
              : { x: "-50%", y: "-50%", opacity: 1, width: 11, scaleX: 1 }
          }
          transition={barTransition}
        />
        <motion.span
          className="absolute left-1/2 bottom-0 block h-[1.5px] origin-center rounded-full bg-current"
          initial={false}
          animate={
            open
              ? { x: "-50%", y: -6, rotate: -45, width: 18 }
              : { x: "-50%", y: 0, rotate: 0, width: 14 }
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

        <HeaderPillNav
          items={NAV.map((item) => ({
            name: item.name,
            href: item.href,
            hasChildren: !!item.children?.length,
            open: openMenu === item.name,
            active: isActive(item.href),
            external: isExternalHref(item.href),
          }))}
          onItemEnter={handleEnter}
          onItemLeave={handleMenuPointerLeave}
          renderDropdown={(name) => {
            const item = NAV.find((n) => n.name === name);
            if (!item?.children?.length) return null;
            const activeSubLink = item.children.find((c) => c.name === openSub && c.groups?.length);
            const isMegaMenu = item.children.some((c) => c.groups?.length);
            const branchedColumns = (() => {
              const groups = activeSubLink?.groups;
              if (!groups?.length) return [] as Group[][];
              const mid = Math.ceil(groups.length / 2);
              return [groups.slice(0, mid), groups.slice(mid)].filter((col) => col.length > 0);
            })();

            return (
              <div
                className="absolute left-0 top-full z-[100] pt-2"
                onPointerEnter={cancelClose}
              >
                {isMegaMenu ? (
                  <div
                    className="flex min-h-[26rem] w-[min(58rem,calc(100vw-2rem))] items-stretch overflow-hidden rounded-2xl border border-border bg-background shadow-[0_28px_60px_-28px_rgba(0,4,74,0.45)]"
                    onPointerMove={cancelClose}
                  >
                    {/* Category rail — branched accent marker */}
                    <div
                      className="relative w-[15.5rem] shrink-0 border-r border-border bg-secondary/55 py-4 pl-4 pr-3"
                      onPointerEnter={cancelClose}
                    >
                      <div
                        className="pointer-events-none absolute bottom-4 left-4 top-4 w-0.5 rounded-[1px] bg-linear-to-b from-[#00044a]/25 via-[#00044a]/18 to-transparent"
                        aria-hidden
                      />
                      <div className="relative flex flex-col gap-0.5 pl-3">
                        {item.children.map((child) => {
                          const hasGroups = !!child.groups?.length;
                          const isOpen = openSub === child.name;
                          return (
                            <div
                              key={child.name}
                              className="relative"
                              onPointerEnter={() => handleSubEnter(child)}
                            >
                              {isOpen ? (
                                <span
                                  className="absolute -left-3 top-1/2 z-[1] h-4 w-0.5 -translate-y-1/2 rounded-[1px] bg-[#00044a]"
                                  aria-hidden
                                />
                              ) : null}
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-[15px] font-medium transition-colors",
                                  isOpen
                                    ? "text-[#00044a]"
                                    : "text-[#00044a]/55 hover:text-[#00044a]",
                                )}
                              >
                                <span>{child.name}</span>
                                {hasGroups ? (
                                  <FiChevronRight
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 transition-colors",
                                      isOpen ? "text-[#00044a]/70" : "text-[#00044a]/30",
                                    )}
                                  />
                                ) : null}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Programs — React Bits Branched Menu */}
                    <div
                      className="min-h-[26rem] min-w-0 flex-1 px-7 py-5"
                      onPointerEnter={() => activeSubLink && handleSubEnter(activeSubLink)}
                    >
                      {branchedColumns.length > 0 ? (
                        <div
                          className={cn(
                            "grid gap-x-12 gap-y-4",
                            branchedColumns.length > 1 ? "md:grid-cols-2" : "grid-cols-1",
                          )}
                        >
                          {branchedColumns.map((columnGroups, colIndex) => (
                            <BranchedMenu
                              key={`${activeSubLink?.name}-col-${colIndex}`}
                              items={columnGroups.map((group) => ({
                                label: group.name,
                                children: group.courses.map((course) => ({
                                  value: course.href,
                                  label: course.name,
                                  href: course.href,
                                })),
                              }))}
                              defaultOpen={columnGroups.map((_, i) => i)}
                              defaultActive={columnGroups[0]?.courses[0]?.href ?? ""}
                              color="#00044a"
                              accentColor="hsl(42 72% 45%)"
                              lineColor="rgba(0, 4, 74, 0.22)"
                              width={320}
                              rowHeight={34}
                              indent={36}
                              trunk={12}
                              radius={9}
                              lineWidth={1.5}
                              fontSize={14}
                              drawDuration={380}
                              foldDuration={280}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[22rem] flex-col justify-center gap-3">
                          <p className="text-sm text-muted-foreground">
                            Browse the full catalog for this category.
                          </p>
                          {openSub ? (
                            <Link
                              href={
                                item.children.find((c) => c.name === openSub)?.href ??
                                item.href
                              }
                              className="w-fit text-[15px] font-medium text-[#00044a] underline-offset-4 hover:underline"
                            >
                              View {openSub}
                            </Link>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-w-[14rem] rounded-xl border border-border bg-background p-2 shadow-lg"
                    onPointerMove={cancelClose}
                  >
                    {item.children.map((child) => (
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
            );
          }}
        />

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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full w-full overflow-hidden border-b border-white/10 bg-[#00044a]/98 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden"
          >
            <div className="h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" aria-hidden />

            <div className="max-h-[78vh] overflow-y-auto px-5 pb-6 pt-5">
              <p className="mb-4 px-1 text-[11px] font-semibold tracking-[0.22em] uppercase text-white/45">
                Menu
              </p>

              <nav className="flex flex-col gap-1.5">
                {NAV.map((item, idx) => {
                  const hasChildren = !!item.children?.length;
                  const expanded = mobileExpanded === item.name;
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "overflow-hidden rounded-2xl",
                        expanded ? "bg-white/10 ring-1 ring-inset ring-white/10" : "bg-transparent",
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {isExternalHref(item.href) ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex min-h-12 flex-1 items-center justify-between rounded-2xl px-4 text-[15px] font-medium transition-colors",
                              active ? "text-white" : "text-white/88 hover:bg-white/8 hover:text-white",
                            )}
                          >
                            <span>{item.name}</span>
                            <FiChevronRight className="h-4 w-4 text-white/35" aria-hidden />
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex min-h-12 flex-1 items-center rounded-2xl px-4 text-[15px] font-medium transition-colors",
                              active ? "text-white" : "text-white/88 hover:bg-white/8 hover:text-white",
                              hasChildren && expanded && "text-white",
                            )}
                          >
                            {item.name}
                          </Link>
                        )}

                        {hasChildren ? (
                          <button
                            type="button"
                            aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
                            aria-expanded={expanded}
                            className={cn(
                              "mr-1.5 grid size-10 shrink-0 place-items-center rounded-xl text-white/70 transition-all",
                              "hover:bg-white/10 hover:text-white",
                              expanded && "bg-primary/20 text-primary",
                            )}
                            onClick={() => {
                              setMobileExpanded(expanded ? null : item.name);
                              setMobileSubExpanded(null);
                            }}
                          >
                            <FiChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-300",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>
                        ) : null}
                      </div>

                      <AnimatePresence initial={false}>
                        {hasChildren && expanded ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mx-2 mb-2 rounded-xl bg-[#00044a]/55 px-2 py-2">
                              {item.children!.map((child) => {
                                const hasGroups = !!child.groups?.length;
                                const subExpanded = mobileSubExpanded === child.name;

                                return (
                                  <div key={child.name} className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                      <Link
                                        href={child.href}
                                        className="flex min-h-10 flex-1 items-center rounded-lg px-3 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                                      >
                                        {child.name}
                                      </Link>
                                      {hasGroups ? (
                                        <button
                                          type="button"
                                          aria-label={
                                            subExpanded ? `Collapse ${child.name}` : `Expand ${child.name}`
                                          }
                                          className={cn(
                                            "grid size-9 shrink-0 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/8 hover:text-white",
                                            subExpanded && "text-primary",
                                          )}
                                          onClick={() =>
                                            setMobileSubExpanded(subExpanded ? null : child.name)
                                          }
                                        >
                                          <FiChevronDown
                                            className={cn(
                                              "h-3.5 w-3.5 transition-transform duration-300",
                                              subExpanded && "rotate-180",
                                            )}
                                          />
                                        </button>
                                      ) : null}
                                    </div>

                                    {hasGroups && subExpanded ? (
                                      <div className="mb-2 ml-2 space-y-3 border-l border-white/10 py-2 pl-3">
                                        {child.groups!.map((group) => (
                                          <div key={group.name} className="flex flex-col">
                                            <div className="mb-1 flex items-center gap-2 px-1">
                                              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                                              <h4 className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/45">
                                                {group.name}
                                              </h4>
                                            </div>
                                            {group.courses.map((course) => (
                                              <Link
                                                key={course.name}
                                                href={course.href}
                                                className="rounded-lg px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8 hover:text-primary"
                                              >
                                                {course.name}
                                              </Link>
                                            ))}
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-5 border-t border-white/10 pt-5">
                <Link
                  href="/schedule"
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-[0_12px_28px_-14px_hsl(42_72%_52%/0.9)] transition-transform active:scale-[0.98]"
                >
                  Enroll
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
