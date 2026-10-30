
import type { StudentCourse } from "@/types/academic";
import type { CourseSection } from "@/types/schedule";

import type {
  CyberOption,
} from "@/data/programs/cyber-requirements";

import {
  cybersecurityBS2026,
} from "@/data/programs/cybersecurity/bs-2026";

import {
  evaluateProgram,
} from "@/lib/academic/evaluate-program";

import {
  recommendProgramCourses,
  type ProgramCourseRecommendation,
} from "@/lib/academic/recommend-program-courses";

// Preserve the existing public type so the
// schedule generator and UI remain compatible.
export type CourseRecommendation =
  ProgramCourseRecommendation;

// Compatibility wrapper for the existing
// Cybersecurity-based schedule page and tests.
export function recommendCourses(
  courses: StudentCourse[],
  sections: CourseSection[],
  option: CyberOption
): CourseRecommendation[] {
  const evaluation = evaluateProgram(
    cybersecurityBS2026,
    courses,
    option
  );

  return recommendProgramCourses(
    evaluation,
    sections
  );
}
