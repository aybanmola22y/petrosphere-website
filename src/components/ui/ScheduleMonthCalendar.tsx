"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { TrainingSession } from "@/data/mockData";
import { ScheduleSessionDetailDialog } from "@/components/ui/ScheduleSessionDetailDialog";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const LANE_H = 28;
const LANE_GAP = 4;
/** Space below day number before the first event bar */
const DAY_HEADER_H = 48;

type CalendarEvent = {
  session: TrainingSession;
  start: Date;
  end: Date;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function toMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function parseMonthKey(key: string): { year: number; monthIndex: number } {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }
  return { year: y, monthIndex: m - 1 };
}

function statusBarClass(status: TrainingSession["status"]) {
  switch (status) {
    case "open":
      return "bg-emerald-600/90 text-white hover:bg-emerald-600";
    case "ongoing":
      return "bg-amber-500/90 text-[#00044a] hover:bg-amber-500";
    case "finished":
    case "closed":
      return "bg-slate-400/85 text-white hover:bg-slate-400";
    case "cancelled":
      return "bg-destructive/85 text-white hover:bg-destructive";
    default:
      return "bg-slate-400/85 text-white";
  }
}

function statusLegendLabel(status: TrainingSession["status"]) {
  if (status === "open") return "Upcoming";
  if (status === "ongoing") return "Ongoing";
  if (status === "finished" || status === "closed") return "Finished";
  if (status === "cancelled") return "Cancelled";
  return status;
}

function parseCalendarDay(input: string | Date | null | undefined): Date | null {
  if (input == null || input === "") return null;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }
  const s = String(input).trim();
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Parse end day from labels like "Aug 10 — Aug 13" when endDate is missing. */
function parseEndFromDateRange(dateRange: string, year: number): Date | null {
  if (!dateRange || dateRange === "TBA") return null;
  const parts = dateRange.split(/\s*[—–]\s*|\s+-\s+/);
  if (parts.length < 2) return null;
  const endToken = parts[parts.length - 1]!.trim();
  if (!endToken) return null;
  const withYear = /\d{4}/.test(endToken) ? endToken : `${endToken} ${year}`;
  return parseCalendarDay(withYear);
}

function buildEvents(sessions: TrainingSession[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const session of sessions) {
    const discrete =
      session.sessionDates
        ?.map((d) => parseCalendarDay(d))
        .filter((d): d is Date => d != null) ?? [];

    if (discrete.length > 0) {
      // Staggered: one marker per training day (not a continuous first→last bar).
      for (const day of discrete) {
        events.push({ session, start: day, end: day });
      }
      continue;
    }

    const start =
      parseCalendarDay(session.startDate) ??
      parseCalendarDay(session.dateRange.split(/\s*[—–]\s*|\s+-\s+/)[0] ?? "");
    if (!start) continue;

    const end =
      parseCalendarDay(session.endDate) ??
      parseEndFromDateRange(session.dateRange, session.year || start.getFullYear()) ??
      start;

    events.push({ session, start, end: end < start ? start : end });
  }

  return events.sort(
    (a, b) => a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime(),
  );
}

type WeekPlacement = {
  event: CalendarEvent;
  lane: number;
  colStart: number; // 0-6
  colSpan: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

function placeWeekEvents(weekStart: Date, events: CalendarEvent[]): WeekPlacement[] {
  const weekEnd = addDays(weekStart, 6);
  const intersecting = events.filter((e) => e.start <= weekEnd && e.end >= weekStart);
  const laneEnds: Date[] = [];
  const placements: WeekPlacement[] = [];

  for (const event of intersecting) {
    const segStart = event.start < weekStart ? weekStart : event.start;
    const segEnd = event.end > weekEnd ? weekEnd : event.end;
    const colStart = daysBetween(weekStart, segStart);
    const colSpan = daysBetween(segStart, segEnd) + 1;

    let lane = laneEnds.findIndex((end) => end < segStart);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(segEnd);
    } else {
      laneEnds[lane] = segEnd;
    }

    placements.push({
      event,
      lane,
      colStart,
      colSpan,
      continuesBefore: event.start < weekStart,
      continuesAfter: event.end > weekEnd,
    });
  }

  return placements;
}

export function ScheduleMonthCalendar({
  sessions,
  monthKey,
  onMonthChange,
  className,
}: {
  sessions: TrainingSession[];
  monthKey: string;
  onMonthChange: (key: string) => void;
  className?: string;
}) {
  const { year, monthIndex } = parseMonthKey(monthKey === "all" ? toMonthKey(new Date().getFullYear(), new Date().getMonth()) : monthKey);
  const today = startOfDay(new Date());
  const events = useMemo(() => buildEvents(sessions), [sessions]);

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const gridStart = addDays(monthStart, -monthStart.getDay());

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    let cursor = gridStart;
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) week.push(addDays(cursor, i));
      rows.push(week);
      if (week[6]! >= monthEnd) break;
      cursor = addDays(cursor, 7);
    }
    return rows;
  }, [year, monthIndex]);

  const overlappingCount = useMemo(() => {
    const ids = new Set(
      events
        .filter((e) => e.start <= monthEnd && e.end >= monthStart)
        .map((e) => e.session.id),
    );
    return ids.size;
  }, [events, monthStart.getTime(), monthEnd.getTime()]);

  const [selected, setSelected] = useState<TrainingSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function openSession(session: TrainingSession) {
    setSelected(session);
    setDetailOpen(true);
  }

  function shiftMonth(delta: number) {
    const d = new Date(year, monthIndex + delta, 1);
    onMonthChange(toMonthKey(d.getFullYear(), d.getMonth()));
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(toMonthKey(today.getFullYear(), today.getMonth()))}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
          <h2 className="ml-2 text-base font-semibold tracking-tight text-[#00044a] sm:text-lg">
            {monthLabel(year, monthIndex)}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-600" aria-hidden />
            Upcoming
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-500" aria-hidden />
            Ongoing
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-slate-400" aria-hidden />
            Finished
          </span>
          <span className="tabular-nums text-muted-foreground/80">
            {overlappingCount} {overlappingCount === 1 ? "session" : "sessions"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[52rem]">
          <div className="grid grid-cols-7 border-b border-border bg-secondary/40">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "px-2 py-2.5 text-center text-[11px] font-semibold tracking-wide uppercase",
                  i === 0 || i === 6 ? "text-destructive/80" : "text-muted-foreground",
                )}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="divide-y divide-border">
            {weeks.map((week) => {
              const weekStart = week[0]!;
              const placements = placeWeekEvents(weekStart, events);
              const laneCount = placements.reduce((m, p) => Math.max(m, p.lane + 1), 0);
              const eventsHeight = Math.max(laneCount, 1) * (LANE_H + LANE_GAP) + 4;

              return (
                <div key={weekStart.toISOString()} className="relative">
                  <div className="grid grid-cols-7">
                    {week.map((day) => {
                      const inMonth = day.getMonth() === monthIndex;
                      const isToday = isSameDay(day, today);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "min-h-[8.5rem] border-r border-border last:border-r-0 px-1.5 pt-1.5 pb-2",
                            !inMonth && "bg-secondary/20",
                            isToday && "bg-primary/5",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                              isToday && "bg-[#00044a] text-white",
                              !isToday && inMonth && isWeekend && "text-destructive/80",
                              !isToday && inMonth && !isWeekend && "text-foreground",
                              !isToday && !inMonth && "text-muted-foreground/50",
                            )}
                          >
                            {day.getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="pointer-events-none absolute inset-x-0 px-0.5"
                    style={{
                      top: DAY_HEADER_H,
                      height: eventsHeight,
                      display: "grid",
                      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                      gridTemplateRows: `repeat(${Math.max(laneCount, 1)}, ${LANE_H}px)`,
                      rowGap: LANE_GAP,
                      columnGap: 0,
                    }}
                  >
                    {placements.map((p) => {
                      const label = p.event.session.courseTitle;
                      return (
                        <button
                          type="button"
                          key={`${p.event.session.id}-${p.event.start.toISOString()}-${weekStart.toISOString()}`}
                          title={`${label} — ${statusLegendLabel(p.event.session.status)}`}
                          onClick={() => openSession(p.event.session)}
                          className={cn(
                            "pointer-events-auto mx-0.5 flex min-w-0 items-center overflow-hidden px-2 text-left text-xs font-medium leading-none shadow-sm transition-opacity",
                            statusBarClass(p.event.session.status),
                            p.continuesBefore ? "rounded-l-sm" : "rounded-l-md",
                            p.continuesAfter ? "rounded-r-sm" : "rounded-r-md",
                          )}
                          style={{
                            gridColumn: `${p.colStart + 1} / span ${p.colSpan}`,
                            gridRow: p.lane + 1,
                          }}
                        >
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Extra height when many stacked event lanes */}
                  <div aria-hidden style={{ height: Math.max(eventsHeight - 12, 32) }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {overlappingCount === 0 ? (
        <p className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
          No training sessions overlap this month. Try another month or clear the course filter.
        </p>
      ) : null}

      <ScheduleSessionDetailDialog
        session={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
