
"use client";

import { useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";

import type {
  CourseSection,
  MeetingDay,
} from "@/types/schedule";

import {
  DAY_NAMES,
  WEEKDAYS,
  getCalendarBounds,
  getCalendarEvents,
  getEventPosition,
  getHourMarks,
  PIXELS_PER_MINUTE,
  type CalendarEvent,
} from "@/lib/scheduling/calendar-layout";

import {
  formatMinutes,
} from "@/lib/scheduling/schedule-engine";

interface WeeklyCalendarProps {
  sections: CourseSection[];
  title?: string;
}

const COURSE_COLORS = [
  {
    background: "#dce7f7",
    border: "#1e407c",
    foreground: "#142d52",
  },
  {
    background: "#e4e5e8",
    border: "#626977",
    foreground: "#272d38",
  },
  {
    background: "#dceee9",
    border: "#327665",
    foreground: "#1c4b40",
  },
  {
    background: "#f1e6d7",
    border: "#a4773b",
    foreground: "#624319",
  },
  {
    background: "#e9e2f4",
    border: "#77549b",
    foreground: "#432b61",
  },
];

function CourseBlock({
  event,
  calendarStart,
  colorIndex,
}: {
  event: CalendarEvent;
  calendarStart: number;
  colorIndex: number;
}) {
  const position = getEventPosition(
    event,
    calendarStart
  );

  const colors =
    COURSE_COLORS[colorIndex % COURSE_COLORS.length];

  return (
    <div
      title={`${event.courseCode} — ${event.title}, ${formatMinutes(
        event.start
      )} to ${formatMinutes(event.end)}`}
      className="absolute left-1 right-1 z-10 overflow-hidden border-l-[3px] px-2 py-1.5"
      style={{
        top: position.top,
        height: position.height,
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.foreground,
      }}
    >
      <p className="truncate font-display text-[11px] font-bold">
        {event.courseCode}
      </p>

      {position.height >= 45 && (
        <p className="mt-1 truncate text-[10px]">
          {formatMinutes(event.start)} –{" "}
          {formatMinutes(event.end)}
        </p>
      )}

      {position.height >= 75 && (
        <p className="mt-1 truncate text-[10px] opacity-80">
          Section {event.section}
        </p>
      )}

      {position.height >= 95 && event.location && (
        <p className="mt-1 truncate text-[10px] opacity-80">
          {event.location}
        </p>
      )}
    </div>
  );
}

export function WeeklyCalendar({
  sections,
  title = "Weekly schedule",
}: WeeklyCalendarProps) {
  const events = useMemo(
    () => getCalendarEvents(sections),
    [sections]
  );

  const bounds = useMemo(
    () => getCalendarBounds(events),
    [events]
  );

  const hourMarks = useMemo(
    () => getHourMarks(bounds.start, bounds.end),
    [bounds]
  );

  const courseColors = useMemo(() => {
    const uniqueCodes = [
      ...new Set(
        sections.map((section) => section.courseCode)
      ),
    ].sort();

    return new Map(
      uniqueCodes.map((code, index) => [
        code,
        index % COURSE_COLORS.length,
      ])
    );
  }, [sections]);

  const height =
    (bounds.end - bounds.start) *
    PIXELS_PER_MINUTE;

  const unscheduled = sections.filter(
    (section) => section.meetings.length === 0
  );

  const weekendEvents = events.filter(
    (event) =>
      event.day === "Sa" || event.day === "Su"
  );

  const visibleDays: MeetingDay[] =
    weekendEvents.length > 0
      ? [...WEEKDAYS, "Sa", "Su"]
      : WEEKDAYS;

  return (
    <section className="border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={18}
            className="text-blue-accent"
          />

          <h2 className="font-display text-sm uppercase tracking-wider">
            {title}
          </h2>
        </div>

        <span className="text-xs text-muted">
          {sections.length} selected{" "}
          {sections.length === 1
            ? "section"
            : "sections"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `72px repeat(${visibleDays.length}, minmax(0, 1fr))`,
            }}
          >
            <div className="border-b border-border bg-surface-muted p-3" />

            {visibleDays.map((day) => (
              <div
                key={day}
                className="border-b border-l border-border bg-surface-muted px-2 py-4 text-center"
              >
                <p className="font-display text-xs uppercase tracking-wider">
                  {DAY_NAMES[day].slice(0, 3)}
                </p>
              </div>
            ))}

            <div
              className="relative border-r border-border bg-surface"
              style={{ height }}
            >
              {hourMarks.map((minute) => {
                const top =
                  (minute - bounds.start) *
                  PIXELS_PER_MINUTE;

                return (
                  <div
                    key={minute}
                    className="absolute left-0 right-0 text-right"
                    style={{ top }}
                  >
                    <span className="relative -top-2.5 pr-3 font-display text-[10px] text-muted">
                      {formatMinutes(minute)}
                    </span>
                  </div>
                );
              })}
            </div>

            {visibleDays.map((day) => {
              const dayEvents = events.filter(
                (event) => event.day === day
              );

              return (
                <div
                  key={day}
                  className="relative border-r border-border last:border-r-0"
                  style={{ height }}
                  aria-label={`${DAY_NAMES[day]} classes`}
                >
                  {hourMarks.map((minute) => (
                    <div
                      key={minute}
                      className="absolute left-0 right-0 border-t border-border"
                      style={{
                        top:
                          (minute - bounds.start) *
                          PIXELS_PER_MINUTE,
                      }}
                    />
                  ))}

                  {dayEvents.map((event) => (
                    <CourseBlock
                      key={event.id}
                      event={event}
                      calendarStart={bounds.start}
                      colorIndex={
                        courseColors.get(
                          event.courseCode
                        ) ?? 0
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {sections.length === 0 && (
        <div className="border-t border-border p-5">
          <p className="text-sm text-muted">
            Add a section or generate a schedule to
            populate the calendar.
          </p>
        </div>
      )}

      {unscheduled.length > 0 && (
        <div className="border-t border-border p-5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted" />

            <p className="font-display text-xs uppercase tracking-wider">
              Classes without scheduled meetings
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {unscheduled.map((section) => (
              <span
                key={section.id}
                className="border border-border bg-surface-muted px-3 py-2 text-xs"
              >
                {section.courseCode} ·{" "}
                {section.modality === "web"
                  ? "Web"
                  : "Arranged / Unscheduled"}
              </span>
            ))}
          </div>
        </div>
      )}

      {weekendEvents.length > 0 && (
        <p className="border-t border-border px-5 py-3 text-xs text-muted">
          Weekend columns are shown because a selected
          class meets on Saturday or Sunday.
        </p>
      )}

      <p className="border-t border-border px-5 py-3 text-xs text-muted">
        Calendar reflects the supplied section data.
        Demo meeting times are fictional.
      </p>
    </section>
  );
}
