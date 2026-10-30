
import type { StudentCourse } from "@/types/academic";
import type { CourseSection } from "@/types/schedule";

import {
  getCyberCatalog,
  type CyberOption,
} from "@/data/programs/cyber-requirements";

import {
  evaluateCyberRequirements,
} from "@/lib/academic/evaluate-cyber";

export interface CourseRecommendation {
  courseCode: string;
  title: string;
  credits: number;
  requirementId: string;
  requirementLabel: string;
  reason: string;
  priority: "needed" | "review";
  sections: CourseSection[];
}

export function recommendCourses(
  courses: StudentCourse[],
  sections: CourseSection[],
  option: CyberOption
): CourseRecommendation[] {
  const catalog = getCyberCatalog(option);
  const evaluation = evaluateCyberRequirements(
    catalog,
    courses
  );

  const recommendations: CourseRecommendation[] = [];

  const attemptedCodes = new Set(
    courses
      .filter(
        (course) =>
          course.status === "completed" ||
          course.status === "in_progress"
      )
      .map((course) => course.code.trim().toUpperCase())
  );

  for (const item of evaluation.requirements) {
    if (
      item.status === "completed" ||
      item.status === "in_progress"
    ) {
      continue;
    }

    for (const alternative of item.requirement.alternatives) {
      const code = alternative.trim().toUpperCase();

      if (attemptedCodes.has(code)) continue;

      const matchingSections = sections.filter(
        (section) =>
          section.courseCode.trim().toUpperCase() === code
      );

      if (matchingSections.length === 0) continue;

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
            ? `This requirement needs review. ${code} is a listed alternative, but confirm eligibility and repeat rules with an adviser.`
            : `${code} is a listed option for an unmet ${item.requirement.category} requirement.`,
        sections: matchingSections,
      });
    }
  }

  return recommendations.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === "needed" ? -1 : 1;
    }

    return a.courseCode.localeCompare(b.courseCode);
  });
}
