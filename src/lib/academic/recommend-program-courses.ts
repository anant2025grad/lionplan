
import type { CourseSection } from "@/types/schedule";

import type {
  ProgramEvaluation,
} from "@/lib/academic/evaluate-program";

export interface ProgramCourseRecommendation {
  courseCode: string;
  title: string;
  credits: number;
  requirementId: string;
  requirementLabel: string;
  reason: string;
  priority: "needed" | "review";
  sections: CourseSection[];
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, " ");
}

export function recommendProgramCourses(
  evaluation: ProgramEvaluation,
  sections: CourseSection[]
): ProgramCourseRecommendation[] {
  const recommendations: ProgramCourseRecommendation[] = [];

  for (const item of evaluation.requirements) {
    if (
      item.status === "completed" ||
      item.status === "in_progress"
    ) {
      continue;
    }

    for (const alternative of item.requirement.alternatives) {
      const code = normalizeCode(alternative);

      const matchingSections = sections.filter(
        (section) =>
          normalizeCode(section.courseCode) === code
      );

      if (matchingSections.length === 0) {
        continue;
      }

      const firstSection = matchingSections[0];

      recommendations.push({
        courseCode: code,
        title: firstSection.title,
        credits: firstSection.credits,
        requirementId: item.requirement.id,
        requirementLabel: item.requirement.label,
        priority:
          item.status === "attention"
            ? "review"
            : "needed",
        reason:
          item.status === "attention"
            ? `${code} is a listed alternative for a requirement needing review. Confirm repeat rules and eligibility with an adviser.`
            : `${code} is a listed alternative for an unmet ${item.requirement.category.replace(
                "_",
                " "
              )} requirement.`,
        sections: matchingSections,
      });
    }
  }

  return recommendations.sort(
    (a, b) =>
      Number(a.priority === "review") -
        Number(b.priority === "review") ||
      a.courseCode.localeCompare(b.courseCode)
  );
}
