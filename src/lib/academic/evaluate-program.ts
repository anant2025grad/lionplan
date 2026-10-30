
import type { StudentCourse } from "@/types/academic";

import type {
  ProgramDefinition,
  ProgramRequirement,
} from "@/types/program";

import {
  getProgramRequirements,
} from "@/data/programs/registry";

export type ProgramRequirementStatus =
  | "completed"
  | "in_progress"
  | "attention"
  | "missing";

export interface EvaluatedProgramRequirement {
  requirement: ProgramRequirement;
  status: ProgramRequirementStatus;
  matchedCourse?: StudentCourse;
}

export interface ProgramEvaluation {
  programId: string;
  bulletinYear: string;
  optionId?: string;
  requirements: EvaluatedProgramRequirement[];
  completed: number;
  inProgress: number;
  attention: number;
  missing: number;
  total: number;
  coveragePercentage: number;
}

const PRIORITY: Record<StudentCourse["status"], number> = {
  completed: 3,
  in_progress: 2,
  low_grade: 1,
  no_credit: 0,
};

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, " ");
}

function evaluateRequirement(
  requirement: ProgramRequirement,
  courses: StudentCourse[]
): EvaluatedProgramRequirement {
  const alternatives = new Set(
    requirement.alternatives.map(normalizeCode)
  );

  const attempts = courses
    .filter((course) =>
      alternatives.has(normalizeCode(course.code))
    )
    .sort(
      (a, b) =>
        PRIORITY[b.status] - PRIORITY[a.status]
    );

  const matchedCourse = attempts[0];

  if (!matchedCourse) {
    return {
      requirement,
      status: "missing",
    };
  }

  const status: ProgramRequirementStatus =
    matchedCourse.status === "completed"
      ? "completed"
      : matchedCourse.status === "in_progress"
        ? "in_progress"
        : "attention";

  return {
    requirement,
    status,
    matchedCourse,
  };
}

export function evaluateProgram(
  program: ProgramDefinition,
  courses: StudentCourse[],
  optionId?: string
): ProgramEvaluation {
  const requirements = getProgramRequirements(
    program,
    optionId
  ).map((requirement) =>
    evaluateRequirement(requirement, courses)
  );

  const count = (status: ProgramRequirementStatus) =>
    requirements.filter(
      (item) => item.status === status
    ).length;

  const completed = count("completed");
  const inProgress = count("in_progress");
  const attention = count("attention");
  const missing = count("missing");
  const total = requirements.length;

  return {
    programId: program.id,
    bulletinYear: program.bulletinYear,
    optionId,
    requirements,
    completed,
    inProgress,
    attention,
    missing,
    total,
    coveragePercentage:
      total > 0
        ? Math.round((completed / total) * 100)
        : 0,
  };
}
