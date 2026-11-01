
"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Info,
} from "lucide-react";

import { useStudentPlan } from "@/hooks/use-student-plan";
import { useAcademicStore } from "@/stores/academic-store";

type RequirementStatus =
  | "completed"
  | "in_progress"
  | "attention"
  | "missing";

function StatusIcon({
  status,
}: {
  status: RequirementStatus;
}) {
  switch (status) {
    case "completed":
      return (
        <CheckCircle2
          size={17}
          className="text-emerald-400"
        />
      );

    case "in_progress":
      return (
        <Clock3
          size={17}
          className="text-amber-400"
        />
      );

    case "attention":
      return (
        <AlertTriangle
          size={17}
          className="text-amber-400"
        />
      );

    default:
      return (
        <Circle
          size={17}
          className="text-rose-400"
        />
      );
  }
}

function statusLabel(
  status: RequirementStatus
): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    case "attention":
      return "Needs review";
    default:
      return "Missing";
  }
}

export function DegreeRequirements() {
  const {
    evaluation,
    programName,
    verified,
    warnings,
    courses,
  } = useStudentPlan();

  const cyberOption = useAcademicStore(
    (state) => state.cyberOption
  );

  const setCyberOption = useAcademicStore(
    (state) => state.setCyberOption
  );

  const [showAll, setShowAll] = useState(false);

  if (!evaluation) {
    return (
      <section className="border border-border bg-surface p-6">
        <h2 className="font-display text-sm uppercase tracking-wider">
          Degree Requirements
        </h2>

        <p className="mt-3 text-sm text-muted">
          No supported program evaluation is available.
          Select a supported program to continue.
        </p>
      </section>
    );
  }

  const requirements = evaluation.requirements;

  const visibleRequirements = showAll
    ? requirements
    : requirements.filter(
        (item) => item.status !== "completed"
      );

  const completedCredits = courses
    .filter(
      (course) => course.status === "completed"
    )
    .reduce(
      (sum, course) => sum + course.credits,
      0
    );

  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs uppercase tracking-wider text-blue-accent">
              Degree evaluation
            </p>

            <h2 className="mt-2 font-display text-lg font-semibold uppercase tracking-wide">
              Degree Requirements
            </h2>

            <p className="mt-2 text-sm text-muted">
              {programName ?? "Selected program"}
              {" · "}
              Bulletin {evaluation.bulletinYear}
            </p>
          </div>

          <span className="border border-border bg-surface-muted px-3 py-2 text-xs">
            {verified
              ? "Catalog verified"
              : "Provisional catalog"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Completed",
              value: evaluation.completed,
            },
            {
              label: "In progress",
              value: evaluation.inProgress,
            },
            {
              label: "Needs review",
              value: evaluation.attention,
            },
            {
              label: "Missing",
              value: evaluation.missing,
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="border border-border bg-background p-4"
            >
              <p className="text-xs text-muted">
                {metric.label}
              </p>

              <p className="mt-2 font-display text-2xl font-semibold">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold">
              Listed requirement coverage
            </p>

            <p className="font-display text-sm font-semibold">
              {evaluation.coveragePercentage}%
            </p>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden bg-surface-muted"
            role="progressbar"
            aria-label="Completed listed requirement groups"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              evaluation.coveragePercentage
            }
          >
            <div
              className="h-full bg-psu-blue"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    evaluation.coveragePercentage
                  )
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted">
            <Info
              size={15}
              className="mt-0.5 shrink-0"
            />

            <p>
              This percentage measures completed
              requirement groups in our provisional
              catalog. It is not a graduation
              percentage or an official degree audit.
              The imported record contains{" "}
              {completedCredits} completed course
              credits, which may not all apply toward
              the degree.
            </p>
          </div>
        </div>

        {evaluation.programId ===
          "cybersecurity-bs" && (
          <div className="mt-6">
            <label
              htmlFor="cyber-option"
              className="block text-xs font-semibold"
            >
              Cybersecurity option
            </label>

            <select
              id="cyber-option"
              value={cyberOption}
              onChange={(event) =>
                setCyberOption(
                  event.target.value as
                    | "operations"
                    | "analytics"
                )
              }
              className="mt-2 w-full max-w-sm border border-border bg-background px-4 py-3 text-sm text-foreground"
            >
              <option value="operations">
                Operations
              </option>

              <option value="analytics">
                Analytics
              </option>
            </select>

            <p className="mt-2 text-xs text-muted">
              Changing the option updates this
              evaluation and Schedule Builder
              recommendations.
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xs uppercase tracking-wider">
              Requirement breakdown
            </h3>

            <p className="mt-2 text-xs text-muted">
              {visibleRequirements.length} of{" "}
              {requirements.length} requirement
              groups shown
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAll((value) => !value)
            }
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs hover:bg-surface-muted"
          >
            {showAll ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}

            {showAll
              ? "Hide completed"
              : "Show all requirements"}
          </button>
        </div>
      </div>

      {visibleRequirements.length === 0 ? (
        <div className="p-6 text-sm text-muted">
          No outstanding requirements appear in the
          current provisional catalog. This does not
          establish graduation eligibility.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleRequirements.map((item) => {
            const { requirement, status } = item;

            const matched = item.matchedCourse;

            return (
              <article
                key={requirement.id}
                className="p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <StatusIcon
                      status={
                        status as RequirementStatus
                      }
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold">
                        {requirement.label}
                      </h4>

                      <span className="border border-border bg-surface-muted px-2 py-1 text-[11px]">
                        {statusLabel(
                          status as RequirementStatus
                        )}
                      </span>
                    </div>

                    {requirement.description && (
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {requirement.description}
                      </p>
                    )}

                    {matched && (
                      <p className="mt-3 text-xs">
                        Matched course:{" "}
                        <strong>
                          {matched.code}
                        </strong>
                        {matched.grade
                          ? ` · Grade ${matched.grade}`
                          : ""}
                      </p>
                    )}

                    {requirement.alternatives.length >
                      0 && (
                      <div className="mt-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted">
                          Recognized course options
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {requirement.alternatives.map(
                            (code) => (
                              <span
                                key={code}
                                className="border border-border bg-background px-2 py-1 font-display text-[11px]"
                              >
                                {code}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {status === "attention" && (
                      <p className="mt-3 text-xs leading-5 text-muted">
                        A matching course requires
                        manual review. Confirm grade
                        requirements, repeat rules,
                        and degree applicability with
                        an adviser.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="border-t border-border bg-surface-muted p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} />

            <h3 className="text-xs font-semibold">
              Academic verification required
            </h3>
          </div>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
            {warnings.map((warning, index) => (
              <li key={`${index}-${warning}`}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
