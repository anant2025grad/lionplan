
import type { StudentCourse } from "@/types/academic";
import type { CourseSection } from "@/types/schedule";

import type {
  CourseRecommendation,
} from "@/lib/academic/recommend-courses";

import {
  evaluatePrerequisites,
} from "@/lib/academic/evaluate-prerequisites";

import {
  canAddSection,
  summarizeSchedule,
} from "@/lib/scheduling/schedule-engine";

export interface GeneratedSchedule {
  id: string;
  sections: CourseSection[];
  credits: number;
  matchedRequirements: number;
  unknownEligibility: string[];
  differenceFromTarget: number;
}

export interface GenerateSchedulesOptions {
  targetCredits: number;
  maxCredits?: number;
  maxResults?: number;
  maxCombinations?: number;
}

export function generateSchedules(
  recommendations: CourseRecommendation[],
  history: StudentCourse[],
  options: GenerateSchedulesOptions
): GeneratedSchedule[] {
  const {
    targetCredits,
    maxCredits = 19,
    maxResults = 5,
    maxCombinations = 50000,
  } = options;

  if (
    !Number.isFinite(targetCredits) ||
    !Number.isFinite(maxCredits) ||
    targetCredits <= 0 ||
    maxCredits <= 0 ||
    maxResults <= 0 ||
    maxCombinations <= 0
  ) {
    return [];
  }

  const eligibleRecommendations = recommendations.filter(
    (recommendation) =>
      evaluatePrerequisites(
        recommendation.courseCode,
        history
      ).status !== "ineligible"
  );

  // Each group represents one requirement.
  // We may select one course alternative per group.
  const groups = new Map<
    string,
    CourseRecommendation[]
  >();

  for (const recommendation of eligibleRecommendations) {
    const existing =
      groups.get(recommendation.requirementId) ?? [];

    existing.push(recommendation);

    groups.set(
      recommendation.requirementId,
      existing
    );
  }

  const requirementGroups = [...groups.values()];
  const results: GeneratedSchedule[] = [];

  let explored = 0;

  function visit(
    groupIndex: number,
    selected: CourseSection[],
    usedCodes: Set<string>,
    matchedRequirements: number
  ) {
    if (explored >= maxCombinations) return;

    explored++;

    if (groupIndex === requirementGroups.length) {
      if (selected.length === 0) return;

      const summary = summarizeSchedule(selected);

      if (summary.conflicts.length > 0) return;

      const unknownEligibility = selected
        .filter(
          (section) =>
            evaluatePrerequisites(
              section.courseCode,
              history
            ).status === "unknown"
        )
        .map((section) => section.courseCode);

      results.push({
        id: selected
          .map((section) => section.id)
          .sort()
          .join("|"),
        sections: [...selected],
        credits: summary.credits,
        matchedRequirements,
        unknownEligibility,
        differenceFromTarget: Math.abs(
          targetCredits - summary.credits
        ),
      });

      return;
    }

    const group = requirementGroups[groupIndex];

    // Option 1: Skip this requirement.
    visit(
      groupIndex + 1,
      selected,
      usedCodes,
      matchedRequirements
    );

    // Option 2: Choose one of its course alternatives.
    for (const recommendation of group) {
      if (usedCodes.has(recommendation.courseCode)) {
        continue;
      }

      for (const section of recommendation.sections) {
        const currentCredits = selected.reduce(
          (sum, item) => sum + item.credits,
          0
        );

        if (
          currentCredits + section.credits > maxCredits
        ) {
          continue;
        }

        if (!canAddSection(selected, section).allowed) {
          continue;
        }

        const nextCodes = new Set(usedCodes);
        nextCodes.add(recommendation.courseCode);

        visit(
          groupIndex + 1,
          [...selected, section],
          nextCodes,
          matchedRequirements + 1
        );
      }
    }
  }

  visit(0, [], new Set<string>(), 0);

  // Prioritize closeness to target credit load.
  // Break ties using requirement coverage, then
  // fewer unverified prerequisite rules.
  return results
    .sort(
      (a, b) =>
        a.differenceFromTarget -
          b.differenceFromTarget ||
        b.matchedRequirements -
          a.matchedRequirements ||
        a.unknownEligibility.length -
          b.unknownEligibility.length ||
        a.id.localeCompare(b.id)
    )
    .slice(0, maxResults);
}
