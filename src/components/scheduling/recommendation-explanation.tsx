
"use client";

import {
  BookOpen,
  CheckCircle2,
  CircleHelp,
  AlertTriangle,
} from "lucide-react";

import type {
  StudentCourse,
} from "@/types/academic";

import type {
  CourseRecommendation,
} from "@/lib/academic/recommend-courses";

import {
  evaluatePrerequisites,
} from "@/lib/academic/evaluate-prerequisites";

interface Props {
  recommendation: CourseRecommendation;
  history: StudentCourse[];
}

export function RecommendationExplanation({
  recommendation,
  history,
}: Props) {
  const eligibility = evaluatePrerequisites(
    recommendation.courseCode,
    history
  );

  const isEligible =
    eligibility.status === "eligible";

  const isIneligible =
    eligibility.status === "ineligible";

  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wider text-blue-accent">
            {recommendation.courseCode}
          </p>

          <h3 className="mt-2 text-sm font-semibold">
            {recommendation.title}
          </h3>

          <p className="mt-1 text-xs text-muted">
            {recommendation.credits} credits
            {" · "}
            {recommendation.sections.length} demo{" "}
            {recommendation.sections.length === 1
              ? "section"
              : "sections"}
          </p>
        </div>

        <span className="border border-border bg-surface-muted px-3 py-2 text-[10px] uppercase tracking-wide">
          {recommendation.priority === "review"
            ? "Review required"
            : "Unmet requirement"}
        </span>
      </div>

      <div className="mt-5 space-y-4 border-t border-border pt-4">
        <div className="flex items-start gap-3">
          <BookOpen
            size={16}
            className="mt-0.5 shrink-0 text-blue-accent"
          />

          <div>
            <p className="text-xs font-semibold">
              Why this course?
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              {recommendation.reason}
            </p>

            <p className="mt-2 text-xs text-muted">
              Requirement:{" "}
              <strong className="text-foreground">
                {recommendation.requirementLabel}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          {isEligible ? (
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-blue-accent"
            />
          ) : isIneligible ? (
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-muted"
            />
          ) : (
            <CircleHelp
              size={16}
              className="mt-0.5 shrink-0 text-muted"
            />
          )}

          <div>
            <p className="text-xs font-semibold">
              Prerequisite status
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              {isEligible
                ? "Meets the configured prerequisite rule."
                : isIneligible
                  ? "Does not meet the configured prerequisite rule."
                  : "Prerequisite rule has not been verified."}
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              {eligibility.explanation}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted">
        Planning guidance only. Verify prerequisites,
        course applicability and enrollment availability
        with Penn State.
      </p>
    </article>
  );
}
