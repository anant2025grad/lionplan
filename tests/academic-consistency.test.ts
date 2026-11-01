
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildStudentPlan,
} from "../src/lib/academic/build-student-plan";

import {
  DEMO_STUDENT_COURSES,
} from "../src/data/demo/demo-student";

import {
  DEMO_SECTIONS,
} from "../src/data/scheduling/demo-sections";

function createPlan(
  optionId: "operations" | "analytics"
) {
  return buildStudentPlan({
    programId: "cybersecurity-bs",
    optionId,
    courses: DEMO_STUDENT_COURSES,
    sections: DEMO_SECTIONS,
  });
}

describe("academic planning consistency", () => {
  it.each([
    "operations",
    "analytics",
  ] as const)(
    "recommendations match outstanding %s requirements",
    (optionId) => {
      const plan = createPlan(optionId);

      expect(plan.evaluation).not.toBeNull();

      const outstanding = new Map(
        plan.evaluation!.requirements
          .filter(
            (item) =>
              item.status === "missing" ||
              item.status === "attention"
          )
          .map((item) => [
            item.requirement.id,
            item.requirement,
          ])
      );

      for (const recommendation of
        plan.recommendations) {
        const requirement = outstanding.get(
          recommendation.requirementId
        );

        expect(requirement).toBeDefined();

        expect(
          requirement?.alternatives
        ).toContain(
          recommendation.courseCode
        );
      }
    }
  );

  it("does not recommend a completed requirement", () => {
    const plan = createPlan("operations");

    const completedIds = new Set(
      plan.evaluation!.requirements
        .filter(
          (item) =>
            item.status === "completed"
        )
        .map(
          (item) => item.requirement.id
        )
    );

    expect(
      plan.recommendations.every(
        (item) =>
          !completedIds.has(
            item.requirementId
          )
      )
    ).toBe(true);
  });

  it("reports the same evaluation on repeated calls", () => {
    const first = createPlan("operations");
    const second = createPlan("operations");

    expect(first.evaluation).toEqual(
      second.evaluation
    );
  });

  it("does not mutate the student's course history", () => {
    const original = structuredClone(
      DEMO_STUDENT_COURSES
    );

    createPlan("operations");

    expect(DEMO_STUDENT_COURSES).toEqual(
      original
    );
  });

  it("labels the current program as unverified", () => {
    const plan = createPlan("operations");

    expect(plan.verified).toBe(false);

    expect(
      plan.warnings.some((warning) =>
        warning.toLowerCase().includes(
          "provisional"
        )
      )
    ).toBe(true);
  });
});
