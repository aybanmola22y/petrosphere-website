"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Filter, LayoutGrid, MapPin, Table2 } from "lucide-react";
import { FiChevronRight } from "react-icons/fi";

import {
  courseCategories,
  type TrainingSession,
} from "@/data/mockData";
import { useTmsSchedules } from "@/hooks/use-tms-schedules";
import { isExternalHref, sessionEnrollHref } from "@/lib/enrollment";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ScheduleGridCard } from "@/components/ui/ScheduleGridCard";
import { cn } from "@/lib/utils";

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function monthKeysSorted(sessions: TrainingSession[]): string[] {
  const keys = [...new Set(sessions.map((s) => s.monthKey))];
  keys.sort();
  return keys;
}

function StatusCell({ status }: { status: TrainingSession["status"] }) {
  if (status === "cancelled") {
    return (
      <Badge
        variant="outline"
        className="border-destructive/40 bg-destructive/10 text-destructive font-normal"
      >
        Cancelled
      </Badge>
    );
  }
  if (status === "open") {
    return <span className="text-sm font-medium text-primary">Open</span>;
  }
  if (status === "finished") {
    return <span className="text-sm text-muted-foreground">Finished</span>;
  }
  return <span className="text-sm text-muted-foreground">Closed</span>;
}

function ActionCell({ session }: { session: TrainingSession }) {
  const open = session.status === "open";
  if (open && session.actionLabel === "Enroll") {
    const href = sessionEnrollHref(session);
    const external = isExternalHref(href);
    return (
      <Button
        asChild
        size="sm"
        className="rounded-lg gap-1.5 font-medium"
      >
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            Enroll
            <FiChevronRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <Link href={href}>
            Enroll
            <FiChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </Button>
    );
  }
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled
      className="rounded-lg gap-1.5 text-muted-foreground font-medium"
    >
      {session.actionLabel}
      <FiChevronRight className="w-3.5 h-3.5 opacity-50" />
    </Button>
  );
}

export default function Schedule() {
  const { data: trainingSessions = [], isLoading, error } = useTmsSchedules();

  const months = useMemo(() => monthKeysSorted(trainingSessions), [trainingSessions]);
  const defaultMonth = "all"; // Default to all since data is dynamic

  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>(defaultMonth);
  const [view, setView] = useState<"table" | "grid">("table");

  const filtered = useMemo(() => {
    return trainingSessions.filter((s) => {
      const catOk =
        courseFilter === "all" || s.categorySlug === courseFilter;
      const monthOk = monthFilter === "all" || s.monthKey === monthFilter;
      return catOk && monthOk;
    });
  }, [courseFilter, monthFilter, trainingSessions]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 md:pt-32 md:pb-32">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Training calendar"
          title="Schedule"
          description="Browse confirmed public runs and plan enrollment with your team. Dates and venues update as cohorts are finalized."
        />

        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger
                className={cn(
                  "w-full sm:w-[200px] h-11 rounded-xl border-border bg-background shadow-sm",
                  "gap-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                )}
              >
                <Filter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courseCategories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger
                className={cn(
                  "w-full sm:w-[200px] h-11 rounded-xl border-border bg-background shadow-sm",
                  "gap-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                )}
              >
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                {months.map((key) => (
                  <SelectItem key={key} value={key}>
                    {formatMonthLabel(key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className="inline-flex rounded-xl border border-border bg-secondary/40 p-1 shadow-sm"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                view === "table"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Table2 className="h-4 w-4" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                view === "grid"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>

        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Showing {sorted.length}{" "}
          {sorted.length === 1 ? "training session" : "training sessions"}
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Fetching live training schedule...</p>
          </div>
        ) : error ? (
          <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-12 text-center">
            <p className="text-destructive font-medium mb-2">Failed to load schedule</p>
            <p className="text-sm text-muted-foreground">Please check your connection or try again later.</p>
          </Card>
        ) : sorted.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">
              No sessions match these filters. Try &quot;All courses&quot; or a different month.
            </p>
          </Card>
        ) : view === "table" ? (
          <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Training course
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Schedule date
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Location
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Registration Fee
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((session) => (
                  <TableRow key={session.id} className="border-border">
                    <TableCell className="align-top py-6 max-w-md">
                      <div className="font-semibold text-foreground leading-snug">
                        {session.courseTitle}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{session.formatNote}</span>
                        <span aria-hidden className="text-border">
                          •
                        </span>
                        <Link
                          href={`/courses/${session.courseSlug}`}
                          className="inline-flex items-center gap-0.5 font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View details
                          <FiChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-6 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{session.dateRange}</div>
                      <div className="text-sm text-muted-foreground">{session.year}</div>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <span className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                        {session.location}
                      </span>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <StatusCell status={session.status} />
                    </TableCell>
                    <TableCell className="align-top py-6 font-medium text-foreground">
                      {session.price || "—"}
                    </TableCell>
                    <TableCell className="align-top py-6 text-right">
                      <ActionCell session={session} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((session) => (
              <ScheduleGridCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
