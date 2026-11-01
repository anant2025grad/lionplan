
import type {
  StudentCourse,
} from "@/types/academic";

import type {
  CourseSection,
} from "@/types/schedule";

import type {
  ProgramEvaluation,
} from "@/lib/academic/evaluate-program";

import type {
  ProgramCourseRecommendation,
} from "@/lib/academic/recommend-program-courses";

import {
  getProgram,
} from "@/data/programs/registry";

import {
  evaluateProgram,
} from "@/lib/academic/evaluate-program";

import {
  recommendProgramCourses,
} from "@/lib/academic/recommend-program-courses";

export interface StudentPlanInput {
  programId: string;
  optionId?: string;
  courses: StudentCourse[];
  sections: CourseSection[];
}

export interface StudentPlanResult {
  programFound: boolean;
  programName: string | null;
  verified: boolean;
  evaluation: ProgramEvaluation | null;
  recommendations: ProgramCourseRecommendation[];
  warnings: string[];
}

export function buildStudentPlan({
  programId,
  optionId,
  courses,
  sections,
}: StudentPlanInput): StudentPlanResult {
  const program = getProgram({
    programId,
    bulletinYear: "2026–2027",
    optionId,
  });

  if (!program) {
    return {
      programFound: false,
      programName: null,
      verified: false,
      evaluation: null,
      recommendations: [],
      warnings: [
        "The selected degree program is not available in the current catalog.",
      ],
    };
  }

  const evaluation = evaluateProgram(
    program,
    courses,
    optionId
  );

  const recommendations =
    recommendProgramCourses(
      evaluation,
      sections
    );

  const warnings = [...program.manualReview];

  if (!program.verified) {
    warnings.unshift(
      "Program requirements are provisional and have not been verified against an official degree audit."
    );
  }

  return {
    programFound: true,
    programName: program.name,
    verified: program.verified,
    evaluation,
    recommendations,
    warnings,
  };
}
