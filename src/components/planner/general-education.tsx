
"use client";

import { useMemo } from "react";
import { AlertCircle } from "lucide-react";

import { useAcademicStore } from "@/stores/academic-store";

import {
  evaluateGeneralEducation,
} from "@/lib/academic/evaluate-general-education";

import {
  GEN_ED_REVIEW_ITEMS,
} from "@/data/general-education/requirements";

import { SectionHeader } from "@/components/ui/section-header";

export function GeneralEducation() {
  const courses = useAcademicStore(
    (state) => state.courses
  );

  const result = useMemo(
    () => evaluateGeneralEducation(courses),
    [courses]
  );

  return (
    <section className="space-y-7">
      <div className="border-t border-border pt-8">
        <SectionHeader
          eyebrow="General Education / Provisional"
          title="General Education coverage"
        />

        <p className="mt-3 max-w-3xl text-xs leading-6 text-muted">
          Credit allocations use a limited,
          unverified attribute catalog. Missing
          attribute data does not mean a course is
          ineligible for General Education.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.buckets.map((bucket) => {
          const completedWidth =
            (bucket.completed / bucket.required) * 100;

          const inProgressWidth =
            (bucket.inProgress / bucket.required) * 100;

          return (
            <div
              key={bucket.id}
              className="border border-border bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xs text-blue-accent">
                    {bucket.id}
                  </p>

                  <h3 className="mt-2 text-sm font-medium">
                    {bucket.name}
                  </h3>
                </div>

                <p className="font-display text-sm">
                  {bucket.completed + bucket.inProgress}
                  /{bucket.required} CR
                </p>
              </div>

              <div className="mt-6 flex h-2 overflow-hidden bg-surface-muted">
                <div
                  className="bg-psu-blue"
                  style={{
                    width: `${completedWidth}%`,
                  }}
                />

                <div
                  className="bg-blue-accent opacity-40"
                  style={{
                    width: `${inProgressWidth}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-muted">
                <span>
                  {bucket.completed} completed
                  {bucket.inProgress > 0 &&
                    ` · ${bucket.inProgress} in progress`}
                </span>

                <span>
                  {bucket.remaining} remaining
                </span>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                {result.allocations
                  .filter(
                    (item) => item.bucket === bucket.id
                  )
                  .map((item) => (
                    <div
                      key={`${item.code}-${item.bucket}`}
                      className="flex justify-between gap-3 py-1.5 text-xs"
                    >
                      <span className="font-display">
                        {item.code}
                      </span>

                      <span className="text-muted">
                        {item.credits} cr ·{" "}
                        {item.status === "completed"
                          ? "Completed"
                          : "In progress"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-border bg-surface p-6">
        <SectionHeader
          eyebrow="Cultures / Separate designations"
          title="Cultures attributes"
        />

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {(["US", "IL"] as const).map((culture) => {
            const data = result.cultures[culture];

            return (
              <div key={culture}>
                <p className="font-display text-xs text-blue-accent">
                  {culture === "US"
                    ? "United States Cultures"
                    : "International Cultures"}
                </p>

                <p className="mt-3 text-sm">
                  {data.completed.length} completed
                  {" · "}
                  {data.inProgress.length} in progress
                </p>

                <p className="mt-3 text-xs leading-6 text-muted">
                  {[
                    ...data.completed,
                    ...data.inProgress,
                  ].join(", ") || "No matching attributes found"}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-xs leading-6 text-muted">
          These are detected course designations,
          not confirmed completion of Cultures
          requirements.
        </p>
      </div>

      {result.unknownCourses.length > 0 && (
        <div className="border-l-2 border-psu-blue bg-blue-soft p-5">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <p className="text-sm font-medium">
              Attribute information unavailable
            </p>
          </div>

          <p className="mt-3 text-xs leading-6 text-muted">
            We do not yet have attribute data for
            these courses. Some may be major-only
            courses; others may qualify for General
            Education.
          </p>

          <p className="mt-3 font-display text-xs leading-6">
            {result.unknownCourses.join(", ")}
          </p>
        </div>
      )}

      <div className="border border-border bg-surface p-6">
        <p className="font-display text-xs uppercase tracking-wider">
          Additional rules not evaluated
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {GEN_ED_REVIEW_ITEMS.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 text-xs leading-6 text-muted"
            >
              <AlertCircle
                size={14}
                className="mt-1 shrink-0 text-blue-accent"
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
