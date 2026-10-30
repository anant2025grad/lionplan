
"use client";

import {
  CalendarOff,
  Clock3,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";

import type {
  CourseSection,
  MeetingDay,
} from "@/types/schedule";

import {
  DEFAULT_SCHEDULING_PREFERENCES,
  type SchedulingPreferences,
} from "@/types/scheduling-preferences";

import {
  DAY_NAMES,
  WEEKDAYS,
} from "@/lib/scheduling/calendar-layout";

import {
  formatMinutes,
} from "@/lib/scheduling/schedule-engine";

interface Props {
  value: SchedulingPreferences;
  onChange: (value: SchedulingPreferences) => void;
  availableSections: CourseSection[];
}

const TIME_OPTIONS = Array.from(
  { length: 31 },
  (_, index) => 6 * 60 + index * 30
);

function TimeSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs text-muted"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full border border-border bg-background px-3 py-3 text-sm text-foreground"
      >
        {TIME_OPTIONS.map((minute) => (
          <option
            key={minute}
            value={minute}
          >
            {formatMinutes(minute)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SchedulingPreferencesPanel({
  value,
  onChange,
  availableSections,
}: Props) {
  function update(
    patch: Partial<SchedulingPreferences>
  ) {
    onChange({ ...value, ...patch });
  }

  function toggleDay(day: MeetingDay) {
    update({
      daysOff: value.daysOff.includes(day)
        ? value.daysOff.filter(
            (item) => item !== day
          )
        : [...value.daysOff, day],
    });
  }

  function toggleLocked(id: string) {
    update({
      lockedSectionIds:
        value.lockedSectionIds.includes(id)
          ? value.lockedSectionIds.filter(
              (item) => item !== id
            )
          : [...value.lockedSectionIds, id],
    });
  }

  const lockedSections = availableSections.filter(
    (section) =>
      value.lockedSectionIds.includes(section.id)
  );

  return (
    <section className="border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="font-display text-xs uppercase tracking-wider">
            Scheduling preferences
          </p>
          <p className="mt-2 text-xs text-muted">
            Customize the schedules LionPlan generates.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              ...DEFAULT_SCHEDULING_PREFERENCES,
              daysOff: [],
              lockedSectionIds: [],
            })
          }
          className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs hover:bg-surface-muted"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      <div className="space-y-7 p-5">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Clock3
              size={16}
              className="text-blue-accent"
            />
            <h3 className="font-display text-xs uppercase tracking-wider">
              Class hours
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TimeSelect
              id="earliest-start"
              label="Earliest class start"
              value={value.earliestStart}
              onChange={(earliestStart) =>
                update({ earliestStart })
              }
            />

            <TimeSelect
              id="latest-end"
              label="Latest class finish"
              value={value.latestEnd}
              onChange={(latestEnd) =>
                update({ latestEnd })
              }
            />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <CalendarOff
              size={16}
              className="text-blue-accent"
            />
            <h3 className="font-display text-xs uppercase tracking-wider">
              Days off
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const selected =
                value.daysOff.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleDay(day)}
                  className={`border px-4 py-2 text-xs transition-colors ${
                    selected
                      ? "border-psu-blue bg-psu-blue text-white"
                      : "border-border bg-background text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {DAY_NAMES[day].slice(0, 3)}
                  {selected ? " · Off" : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <LockKeyhole
              size={16}
              className="text-blue-accent"
            />
            <h3 className="font-display text-xs uppercase tracking-wider">
              Locked sections
            </h3>
          </div>

          <p className="mb-3 text-xs leading-5 text-muted">
            Locked sections must appear in every generated
            schedule. Choose the exact section you want
            to keep.
          </p>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableSections.map((section) => {
              const locked =
                value.lockedSectionIds.includes(
                  section.id
                );

              return (
                <button
                  key={section.id}
                  type="button"
                  aria-pressed={locked}
                  onClick={() =>
                    toggleLocked(section.id)
                  }
                  className={`flex w-full items-center justify-between gap-3 border px-3 py-3 text-left text-xs ${
                    locked
                      ? "border-blue-accent bg-blue-soft"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  <span>
                    <strong>{section.courseCode}</strong>
                    {" · "}
                    Section {section.section}
                  </span>

                  <span className="flex shrink-0 items-center gap-1">
                    {locked && <LockKeyhole size={13} />}
                    {locked ? "Locked" : "Lock"}
                  </span>
                </button>
              );
            })}

            {availableSections.length === 0 && (
              <p className="text-xs text-muted">
                No candidate sections are available.
              </p>
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            {lockedSections.length} locked{" "}
            {lockedSections.length === 1
              ? "section"
              : "sections"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="target-credits"
              className="mb-2 block text-xs text-muted"
            >
              Target credits
            </label>

            <select
              id="target-credits"
              value={value.targetCredits}
              onChange={(event) =>
                update({
                  targetCredits: Number(
                    event.target.value
                  ),
                })
              }
              className="w-full border border-border bg-background px-3 py-3 text-sm"
            >
              {[9, 12, 15, 16, 18].map(
                (credits) => (
                  <option
                    key={credits}
                    value={credits}
                  >
                    {credits} credits
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="maximum-credits"
              className="mb-2 block text-xs text-muted"
            >
              Maximum credits
            </label>

            <select
              id="maximum-credits"
              value={value.maxCredits}
              onChange={(event) =>
                update({
                  maxCredits: Number(
                    event.target.value
                  ),
                })
              }
              className="w-full border border-border bg-background px-3 py-3 text-sm"
            >
              {[12, 15, 16, 18, 19, 21].map(
                (credits) => (
                  <option
                    key={credits}
                    value={credits}
                  >
                    {credits} credits
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
