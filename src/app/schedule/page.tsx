
"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Plus,
  Trash2,
} from "lucide-react";

import { DEMO_SECTIONS } from "@/data/scheduling/demo-sections";
import type { CourseSection } from "@/types/schedule";

import {
  canAddSection,
  DAYS,
  formatMinutes,
  summarizeSchedule,
} from "@/lib/scheduling/schedule-engine";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const DAY_LABELS: Record<string, string> = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  Th: "Thu",
  F: "Fri",
  Sa: "Sat",
  Su: "Sun",
};

function meetingLabel(section: CourseSection): string {
  if (section.modality === "web") {
    return "WEB / No scheduled meeting";
  }

  if (section.meetings.length === 0) {
    return "Meeting time not available";
  }

  return section.meetings
    .map(
      (meeting) =>
        `${meeting.days
          .map((day) => DAY_LABELS[day])
          .join(" / ")} · ${formatMinutes(
          meeting.start
        )}–${formatMinutes(meeting.end)}`
    )
    .join(" | ");
}

export default function SchedulePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    []
  );

  const [warning, setWarning] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");

  const selected = useMemo(
    () =>
      DEMO_SECTIONS.filter((section) =>
        selectedIds.includes(section.id)
      ),
    [selectedIds]
  );

  const summary = useMemo(
    () => summarizeSchedule(selected),
    [selected]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return DEMO_SECTIONS.filter(
      (section) =>
        section.courseCode
          .toLowerCase()
          .includes(query) ||
        section.title.toLowerCase().includes(query)
    );
  }, [search]);

  function addSection(section: CourseSection) {
    if (selectedIds.includes(section.id)) return;

    const result = canAddSection(selected, section);

    if (!result.allowed) {
      const first = result.conflicts[0];

      setWarning(
        first.reason === "same_course"
          ? `You already selected a section of ${section.courseCode}. Remove it before choosing another.`
          : `${section.courseCode} section ${section.section} overlaps with an existing class on ${DAY_LABELS[first.day ?? "M"]}.`
      );

      return;
    }

    setSelectedIds((previous) => [
      ...previous,
      section.id,
    ]);

    setWarning(null);
  }

  function removeSection(id: string) {
    setSelectedIds((previous) =>
      previous.filter((item) => item !== id)
    );

    setWarning(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LionPlan / Semester Planning"
        title="Schedule Builder"
        description="Build a conflict-free class schedule using demonstration sections."
      />

      <div className="border-l-2 border-psu-blue bg-blue-soft p-4 text-xs leading-6">
        <strong>Demo mode:</strong> All sections and
        meeting times on this page are fictional.
        They do not represent live Penn State
        enrollment data.
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Selected courses", summary.courseCount],
          ["Scheduled credits", summary.credits],
          ["Time conflicts", summary.conflicts.length],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="border border-border bg-surface p-5"
          >
            <p className="text-xs text-muted">
              {label}
            </p>

            <p className="mt-3 font-display text-2xl">
              {value}
            </p>
          </div>
        ))}
      </div>

      {warning && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-border bg-surface p-4"
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-blue-accent"
          />

          <p className="text-sm">{warning}</p>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <section>
          <div className="flex items-center gap-2">
            <CalendarDays size={17} />

            <h2 className="font-display text-sm uppercase tracking-wider">
              Available demo sections
            </h2>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by course code or title"
            aria-label="Search demo sections"
            className="mt-5 w-full border border-border bg-surface px-4 py-3 text-sm text-foreground"
          />

          <div className="mt-4 space-y-3">
            {filtered.map((section) => {
              const isSelected = selectedIds.includes(
                section.id
              );

              const check = canAddSection(
                selected,
                section
              );

              return (
                <div
                  key={section.id}
                  className="border border-border bg-surface p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xs text-blue-accent">
                        {section.courseCode} /{" "}
                        {section.section}
                      </p>

                      <h3 className="mt-2 text-sm font-medium">
                        {section.title}
                      </h3>

                      <p className="mt-3 text-xs leading-6 text-muted">
                        {meetingLabel(section)}
                      </p>

                      <p className="mt-2 text-xs text-muted">
                        {section.credits} credits ·{" "}
                        {section.campus}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={
                        isSelected
                          ? "secondary"
                          : "primary"
                      }
                      onClick={() =>
                        isSelected
                          ? removeSection(section.id)
                          : addSection(section)
                      }
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} />
                          Selected
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Add
                        </>
                      )}
                    </Button>
                  </div>

                  {!isSelected && !check.allowed && (
                    <p className="mt-3 text-xs text-muted">
                      Conflicts with current selection
                    </p>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="border border-border p-6 text-sm text-muted">
                No matching demonstration sections.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm uppercase tracking-wider">
            Your selected schedule
          </h2>

          <div className="mt-5 border border-border bg-surface">
            {selected.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-muted"
                />

                <p className="mt-4 text-sm font-medium">
                  No courses selected
                </p>

                <p className="mt-2 text-xs text-muted">
                  Add sections to start building your
                  semester.
                </p>
              </div>
            ) : (
              selected.map((section) => (
                <div
                  key={section.id}
                  className="flex items-start justify-between gap-3 border-b border-border p-4 last:border-b-0"
                >
                  <div>
                    <p className="font-display text-xs">
                      {section.courseCode} /{" "}
                      {section.section}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-muted">
                      {meetingLabel(section)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeSection(section.id)
                    }
                    aria-label={`Remove ${section.courseCode} section ${section.section}`}
                    className="p-2 text-muted hover:text-foreground"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedIds([]);
                setWarning(null);
              }}
              className="mt-4 text-xs text-muted underline underline-offset-4 hover:text-foreground"
            >
              Clear schedule
            </button>
          )}
        </section>
      </div>

      <section className="border border-border bg-surface p-6">
        <h2 className="font-display text-sm uppercase tracking-wider">
          Weekly overview
        </h2>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {DAYS.slice(0, 5).map((day) => (
            <div key={day} className="min-w-0">
              <p className="border-b border-border pb-3 text-center font-display text-xs">
                {DAY_LABELS[day]}
              </p>

              <div className="mt-3 space-y-2">
                {selected
                  .flatMap((section) =>
                    section.meetings
                      .filter((meeting) =>
                        meeting.days.includes(day)
                      )
                      .map((meeting, index) => ({
                        section,
                        meeting,
                        key: `${section.id}-${index}`,
                      }))
                  )
                  .sort(
                    (a, b) =>
                      a.meeting.start -
                      b.meeting.start
                  )
                  .map((item) => (
                    <div
                      key={item.key}
                      className="min-w-0 border-l-2 border-psu-blue bg-blue-soft p-2"
                    >
                      <p className="break-words font-display text-[10px] font-bold">
                        {item.section.courseCode}
                      </p>

                      <p className="mt-1 text-[10px] leading-4">
                        {formatMinutes(
                          item.meeting.start
                        )}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-muted">
          Compact day-by-day overview. A time-scaled
          calendar will be added in a later session.
        </p>
      </section>
    </div>
  );
}
