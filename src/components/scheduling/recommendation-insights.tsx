
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type {
  StudentCourse,
} from "@/types/academic";

import type {
  CourseRecommendation,
} from "@/lib/academic/recommend-courses";

import {
  RecommendationExplanation,
} from "@/components/scheduling/recommendation-explanation";

interface Props {
  recommendations: CourseRecommendation[];
  history: StudentCourse[];
}

export function RecommendationInsights({
  recommendations,
  history,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const unique = [
    ...new Map(
      recommendations.map((item) => [
        `${item.courseCode}:${item.requirementId}`,
        item,
      ])
    ).values(),
  ];

  const visible = expanded
    ? unique
    : unique.slice(0, 3);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-wider">
            Why these courses?
          </p>

          <p className="mt-2 text-xs text-muted">
            Explore the academic reasoning behind
            LionPlan&apos;s recommendations.
          </p>
        </div>

        {unique.length > 3 && (
          <button
            type="button"
            onClick={() =>
              setExpanded((value) => !value)
            }
            className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs hover:bg-surface-muted"
          >
            {expanded ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}

            {expanded
              ? "Show fewer"
              : `View all ${unique.length}`}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="border border-border bg-surface p-5 text-sm text-muted">
          No recommendations are available from the
          current demo section catalog.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((recommendation) => (
            <RecommendationExplanation
              key={`${recommendation.courseCode}:${recommendation.requirementId}`}
              recommendation={recommendation}
              history={history}
            />
          ))}
        </div>
      )}
    </section>
  );
}
