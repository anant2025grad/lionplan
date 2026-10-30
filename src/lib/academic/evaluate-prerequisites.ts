
import type { StudentCourse } from "@/types/academic";

import type {
  EligibilityResult,
  PrerequisiteRule,
} from "@/types/prerequisites";

import {
  DEMO_PREREQUISITES,
} from "@/data/academic/prerequisites";

function evaluateRule(
  rule: PrerequisiteRule,
  completed: Set<string>
): boolean {
  switch (rule.type) {
    case "course":
      return completed.has(
        rule.code.trim().toUpperCase()
      );

    case "all":
      return rule.rules.every((child) =>
        evaluateRule(child, completed)
      );

    case "any":
      return rule.rules.some((child) =>
        evaluateRule(child, completed)
      );
  }
}

export function evaluatePrerequisites(
  courseCode: string,
  history: StudentCourse[],
  catalog: Record<string, PrerequisiteRule> =
    DEMO_PREREQUISITES
): EligibilityResult {
  const code = courseCode.trim().toUpperCase();
  const rule = catalog[code];

  if (!rule) {
    return {
      status: "unknown",
      explanation:
        "Prerequisite rules have not been verified for this course.",
    };
  }

  const completed = new Set(
    history
      .filter((course) => course.status === "completed")
      .map((course) =>
        course.code.trim().toUpperCase()
      )
  );

  if (evaluateRule(rule, completed)) {
    return {
      status: "eligible",
      explanation:
        "Completed coursework satisfies the configured prerequisite rule.",
    };
  }

  return {
    status: "ineligible",
    explanation:
      "Completed coursework does not satisfy the configured prerequisite rule. In-progress courses, placement, permissions and exceptions are not evaluated.",
  };
}
