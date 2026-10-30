
import type { StudentCourse } from "@/types/academic";

import type {
  CourseRequirement,
  CyberRequirementCatalog,
} from "@/data/programs/cyber-requirements";

export type RequirementStatus =
  | "completed"
  | "in_progress"
  | "attention"
  | "missing";

export interface EvaluatedRequirement {
  requirement: CourseRequirement;
  status: RequirementStatus;
  matchedCourse?: StudentCourse;
}

export interface CyberEvaluation {
  requirements: EvaluatedRequirement[];
  completed: number;
  inProgress: number;
  attention: number;
  missing: number;
  total: number;
  coveragePercentage: number;
}

const STATUS_PRIORITY = {
  completed: 3,
  in_progress: 2,
  low_grade: 1,
  no_credit: 0,
} as const;

function bestAttempt(
  attempts: StudentCourse[]
): StudentCourse | undefined {
  return [...attempts].sort(
    (a, b) =>
      STATUS_PRIORITY[b.status] -
      STATUS_PRIORITY[a.status]
  )[0];
}

function evaluateRequirement(
  requirement: CourseRequirement,
  courses: StudentCourse[]
): EvaluatedRequirement {
  const eligibleAttempts = courses.filter((course) =>
    requirement.alternatives.includes(
      course.code.trim().toUpperCase()
    )
  );

  const match = bestAttempt(eligibleAttempts);

  if (!match) {
    return {
      requirement,
      status: "missing",
    };
  }

  switch (match.status) {
    case "completed":
      return {
        requirement,
        status: "completed",
        matchedCourse: match,
      };

    case "in_progress":
      return {
        requirement,
        status: "in_progress",
        matchedCourse: match,
      };

    case "low_grade":
    case "no_credit":
      return {
        requirement,
        status: "attention",
        matchedCourse: match,
      };
  }
}

export function evaluateCyberRequirements(
  catalog: CyberRequirementCatalog,
  courses: StudentCourse[]
): CyberEvaluation {
  const requirements = catalog.requirements.map(
    (requirement) =>
      evaluateRequirement(requirement, courses)
  );

  const count = (status: RequirementStatus) =>
    requirements.filter(
      (item) => item.status === status
    ).length;

  const completed = count("completed");
  const inProgress = count("in_progress");
  const attention = count("attention");
  const missing = count("missing");
  const total = requirements.length;

  return {
    requirements,
    completed,
    inProgress,
    attention,
    missing,
    total,
    coveragePercentage:
      total === 0
        ? 0
        : Math.round((completed / total) * 100),
  };
}
