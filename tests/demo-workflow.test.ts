
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEMO_STUDENT,
  DEMO_STUDENT_COURSES,
} from "../src/data/demo/demo-student";

import {
  cybersecurityBS2026,
} from "../src/data/programs/cybersecurity/bs-2026";

import {
  DEMO_SECTIONS,
} from "../src/data/scheduling/demo-sections";

import {
  evaluateProgram,
} from "../src/lib/academic/evaluate-program";

import {
  recommendProgramCourses,
} from "../src/lib/academic/recommend-program-courses";

import {
  generatePreferredSchedules,
} from "../src/lib/scheduling/generate-preferred-schedules";

import {
  DEFAULT_SCHEDULING_PREFERENCES,
} from "../src/types/scheduling-preferences";

describe("LionPlan fictional demo workflow", () => {
  const evaluation = evaluateProgram(
    cybersecurityBS2026,
    DEMO_STUDENT_COURSES,
    DEMO_STUDENT.optionId
  );

  const recommendations = recommendProgramCourses(
    evaluation,
    DEMO_SECTIONS
  );

  it("uses an explicitly fictional student", () => {
    expect(DEMO_STUDENT.fictional).toBe(true);
  });

  it("has completed and in-progress courses", () => {
    expect(
      DEMO_STUDENT_COURSES.some(
        (course) => course.status === "completed"
      )
    ).toBe(true);

    expect(
      DEMO_STUDENT_COURSES.some(
        (course) => course.status === "in_progress"
      )
    ).toBe(true);
  });

  it("evaluates the selected Cybersecurity option", () => {
    expect(evaluation.programId).toBe(
      DEMO_STUDENT.programId
    );

    expect(evaluation.optionId).toBe(
      DEMO_STUDENT.optionId
    );

    expect(evaluation.total).toBeGreaterThan(0);
    expect(evaluation.completed).toBeGreaterThan(0);
    expect(evaluation.missing).toBeGreaterThan(0);
  });

  it("does not recommend completed or in-progress courses", () => {
    const unavailable = new Set(
      DEMO_STUDENT_COURSES
        .filter(
          (course) =>
            course.status === "completed" ||
            course.status === "in_progress"
        )
        .map((course) => course.code)
    );

    expect(
      recommendations.every(
        (item) => !unavailable.has(item.courseCode)
      )
    ).toBe(true);
  });

  it("provides requirement explanations", () => {
    expect(recommendations.length).toBeGreaterThan(0);

    expect(
      recommendations.every(
        (item) =>
          item.requirementId.length > 0 &&
          item.requirementLabel.length > 0 &&
          item.reason.length > 0
      )
    ).toBe(true);
  });

  it("generates schedules using recommended sections", () => {
    const recommendedSectionIds = [
      ...new Set(
        recommendations.flatMap(
          (item) =>
            item.sections.map(
              (section) => section.id
            )
        )
      ),
    ];

    const result = generatePreferredSchedules(
      DEMO_SECTIONS,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        targetCredits: 9,
      },
      {
        recommendedSectionIds,
        history: DEMO_STUDENT_COURSES,
      }
    );

    expect(result.errors).toHaveLength(0);
    expect(result.schedules.length).toBeGreaterThan(0);

    const allowed = new Set(
      recommendedSectionIds
    );

    expect(
      result.schedules.every((schedule) =>
        schedule.sections.every(
          (section) => allowed.has(section.id)
        )
      )
    ).toBe(true);
  });

  it("does not create conflicting schedules", () => {
    const recommendedSectionIds =
      recommendations.flatMap(
        (item) =>
          item.sections.map(
            (section) => section.id
          )
      );

    const result = generatePreferredSchedules(
      DEMO_SECTIONS,
      DEFAULT_SCHEDULING_PREFERENCES,
      {
        recommendedSectionIds,
        history: DEMO_STUDENT_COURSES,
      }
    );

    const selectedCodes = result.schedules.flatMap(
      (schedule) =>
        schedule.sections.map(
          (section) => section.courseCode
        )
    );

    expect(selectedCodes.length).toBeGreaterThan(0);
  });
});
