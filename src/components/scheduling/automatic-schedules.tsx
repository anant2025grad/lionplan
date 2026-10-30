
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import type { StudentCourse } from "@/types/academic";

import type {
  CourseRecommendation,
} from "@/lib/academic/recommend-courses";

import {
  generateSchedules,
  type GeneratedSchedule,
} from "@/lib/scheduling/generate-schedules";

import {
  evaluatePrerequisites,
} from "@/lib/academic/evaluate-prerequisites";

import {
  formatMinutes,
} from "@/lib/scheduling/schedule-engine";

import { Button } from "@/components/ui/button";

interface Props {
  recommendations: CourseRecommendation[];
  history: StudentCourse[];
  onSelect: (schedule: GeneratedSchedule) => void;
}

export function AutomaticSchedules({
  recommendations,
  history,
  onSelect,
}: Props) {
  const [targetCredits, setTargetCredits] =
    useState(15);

  const [generated, setGenerated] = useState(false);

  const schedules = useMemo(
    () =>
      generateSchedules(recommendations, history, {
        targetCredits,
        maxCredits: 19,
        maxResults: 5,
      }),
    [recommendations, history, targetCredits]
  );

  function updateTarget(value: number) {
    setTargetCredits(value);
    setGenerated(false);
  }

  return (
    <section className="border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <Sparkles
          size={19}
          className="text-blue-accent"
        />

        <h2 className="font-display text-sm uppercase tracking-wider">
          Automatic schedule generator
        </h2>
      </div>

      <p className="mt-4 max-w-2xl text-xs leading-6 text-muted">
        Generate combinations of recommended courses
        without overlapping class times. Results are
        planning suggestions, not enrollment approvals.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="target-credits"
            className="block text-xs text-muted"
          >
            Target semester credits
          </label>

          <select
            id="target-credits"
            value={targetCredits}
            onChange={(event) =>
              updateTarget(Number(event.target.value))
            }
            className="mt-2 border border-border bg-background px-4 py-3 text-sm"
          >
            {[9, 12, 15, 16, 18].map((credits) => (
              <option key={credits} value={credits}>
                {credits} credits
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => setGenerated(true)}
          disabled={recommendations.length === 0}
        >
          <Sparkles size={16} />
          Generate schedules
        </Button>
      </div>

      {generated && (
        <div className="mt-7 space-y-4">
          <p className="font-display text-xs uppercase tracking-wider text-muted">
            {schedules.length} candidate schedules
          </p>

          {schedules.length === 0 && (
            <div className="border border-border p-5">
              <p className="text-sm">
                No schedules found in the demo catalog.
              </p>

              <p className="mt-2 text-xs leading-6 text-muted">
                Try a different credit target or
                expand the available section data.
              </p>
            </div>
          )}

          {schedules.map((schedule, index) => (
            <article
              key={schedule.id}
              className="border border-border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xs text-blue-accent">
                    OPTION {String(index + 1).padStart(2, "0")}
                  </p>

                  <p className="mt-2 text-lg font-medium">
                    {schedule.credits} credits
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {schedule.matchedRequirements}{" "}
                    preliminary requirement groups
                    covered
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => onSelect(schedule)}
                >
                  Use schedule
                </Button>
              </div>

              <div className="mt-5 divide-y divide-border border-t border-border">
                {schedule.sections.map((section) => {
                  const eligibility =
                    evaluatePrerequisites(
                      section.courseCode,
                      history
                    );

                  return (
                    <div
                      key={section.id}
                      className="flex flex-wrap justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-display text-xs">
                          {section.courseCode} /{" "}
                          {section.section}
                        </p>

                        <p className="mt-2 text-xs text-muted">
                          {section.meetings.length === 0
                            ? "WEB / Arranged"
                            : section.meetings
                                .map(
                                  (meeting) =>
                                    `${meeting.days.join("/")} ${formatMinutes(
                                      meeting.start
                                    )}–${formatMinutes(
                                      meeting.end
                                    )}`
                                )
                                .join(" · ")}
                        </p>
                      </div>

                      <span className="text-xs text-muted">
                        {section.credits} cr
                      </span>

                      {eligibility.status === "unknown" && (
                        <p className="w-full text-xs text-muted">
                          Prerequisites not verified
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {schedule.unknownEligibility.length > 0 ? (
                <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  {schedule.unknownEligibility.length}{" "}
                  course(s) require prerequisite
                  verification.
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <CheckCircle2 size={15} />
                  All configured prerequisite checks passed.
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
