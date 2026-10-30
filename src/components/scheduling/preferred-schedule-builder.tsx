
"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  WandSparkles,
} from "lucide-react";

import type {
  CourseSection,
} from "@/types/schedule";

import type {
  CourseRecommendation,
} from "@/lib/academic/recommend-courses";

import {
  DEFAULT_SCHEDULING_PREFERENCES,
  type SchedulingPreferences,
} from "@/types/scheduling-preferences";

import {
  generatePreferredSchedules,
  type PreferredScheduleResult,
} from "@/lib/scheduling/generate-preferred-schedules";

import {
  SchedulingPreferencesPanel,
} from "@/components/scheduling/scheduling-preferences-panel";

interface Props {
  recommendations: CourseRecommendation[];
  onUseSchedule: (
    sections: CourseSection[]
  ) => void;
}

export function PreferredScheduleBuilder({
  recommendations,
  onUseSchedule,
}: Props) {
  const [preferences, setPreferences] =
    useState<SchedulingPreferences>({
      ...DEFAULT_SCHEDULING_PREFERENCES,
      daysOff: [],
      lockedSectionIds: [],
    });

  const [result, setResult] =
    useState<PreferredScheduleResult | null>(
      null
    );

  const candidateSections = useMemo(() => {
    const byId = new Map<
      string,
      CourseSection
    >();

    for (const recommendation of recommendations) {
      for (const section of recommendation.sections) {
        byId.set(section.id, section);
      }
    }

    return [...byId.values()];
  }, [recommendations]);

  function changePreferences(
    next: SchedulingPreferences
  ) {
    setPreferences(next);
    setResult(null);
  }

  function generate() {
    setResult(
      generatePreferredSchedules(
        candidateSections,
        preferences
      )
    );
  }

  return (
    <div className="space-y-5">
      <SchedulingPreferencesPanel
        value={preferences}
        onChange={changePreferences}
        availableSections={candidateSections}
      />

      <section className="border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-sm uppercase tracking-wider">
              Personalized schedules
            </h2>

            <p className="mt-2 text-xs text-muted">
              Generate conflict-free combinations
              from the recommended demo sections.
            </p>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={candidateSections.length === 0}
            className="inline-flex items-center gap-2 bg-psu-blue px-5 py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WandSparkles size={15} />
            Generate schedules
          </button>
        </div>

        {result && (
          <div className="mt-5 space-y-4">
            {result.errors.map((error) => (
              <div
                key={error}
                role="alert"
                className="flex gap-3 border border-border bg-surface-muted p-3 text-xs"
              >
                <AlertTriangle
                  size={16}
                  className="shrink-0 text-muted"
                />
                {error}
              </div>
            ))}

            {result.warnings.map((warning) => (
              <p
                key={warning}
                className="text-xs text-muted"
              >
                {warning}
              </p>
            ))}

            {result.schedules.length === 0 &&
              result.errors.length === 0 && (
                <p className="text-sm text-muted">
                  No compatible schedules were found.
                  Try relaxing your preferences.
                </p>
              )}

            {result.schedules.map(
              (schedule, index) => (
                <article
                  key={schedule.id}
                  className="border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-xs uppercase tracking-wider">
                        Option {index + 1}
                      </p>

                      <p className="mt-2 text-sm">
                        <strong>
                          {schedule.credits} credits
                        </strong>
                        {" · "}
                        {schedule.sections.length} classes
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onUseSchedule(
                          schedule.sections
                        )
                      }
                      className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs hover:bg-surface-muted"
                    >
                      <CheckCircle2 size={14} />
                      Use schedule
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {schedule.sections.map(
                      (section) => (
                        <span
                          key={section.id}
                          className="border border-border bg-surface-muted px-3 py-2 text-xs"
                        >
                          {section.courseCode} ·{" "}
                          {section.section}
                        </span>
                      )
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-muted">
          Generated schedules are illustrative.
          Course availability, prerequisites,
          degree applicability and enrollment
          eligibility must be verified.
        </p>
      </section>
    </div>
  );
}
