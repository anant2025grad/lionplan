
import type {
  DegreeProgram,
  StudentCourse,
  RequirementResult,
  DegreeEvaluation,
} from "@/types/academic";

export function evaluateDegree(
  program: DegreeProgram,
  studentCourses: StudentCourse[]
): DegreeEvaluation {
  const results: RequirementResult[] =
    program.requirements.map((requirement) => {
      const matches = studentCourses.filter((course) =>
        requirement.courses.includes(course.code)
      );

      const completed = matches.filter(
        (course) => course.status === "completed"
      );

      const inProgress = matches.filter(
        (course) => course.status === "in_progress"
      );

      const completedCredits = completed.reduce(
        (total, course) => total + course.credits,
        0
      );

      const inProgressCredits = inProgress.reduce(
        (total, course) => total + course.credits,
        0
      );

      let status: RequirementResult["status"] = "missing";

      if (completedCredits >= requirement.creditsRequired) {
        status = "completed";
      } else if (
        completedCredits + inProgressCredits >=
        requirement.creditsRequired
      ) {
        status = "in_progress";
      }

      return {
        requirement,
        status,
        matchedCourses: matches,
        creditsSatisfied: completedCredits,
      };
    });

  const completedCount = results.filter(
    (result) => result.status === "completed"
  ).length;

  const inProgressCount = results.filter(
    (result) => result.status === "in_progress"
  ).length;

  const missingCount = results.filter(
    (result) => result.status === "missing"
  ).length;

  const progressPercentage = results.length
    ? Math.round((completedCount / results.length) * 100)
    : 0;

  return {
    programId: program.id,
    requirements: results,
    completedCount,
    inProgressCount,
    missingCount,
    progressPercentage,
  };
}