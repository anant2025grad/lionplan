
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

describe("shared student planning engine", () => {
  const input = {
    programId: "cybersecurity-bs",
    optionId: "operations",
    courses: DEMO_STUDENT_COURSES,
    sections: DEMO_SECTIONS,
  };

  it("evaluates the selected program", () => {
    const result = buildStudentPlan(input);

    expect(result.programFound).toBe(true);
    expect(result.evaluation).not.toBeNull();
    expect(result.evaluation?.total).toBeGreaterThan(0);
  });

  it("provides consistent recommendations", () => {
    const first = buildStudentPlan(input);
    const second = buildStudentPlan(input);

    expect(first.recommendations).toEqual(
      second.recommendations
    );
  });

  it("changes requirements when the option changes", () => {
    const operations = buildStudentPlan({
      ...input,
      optionId: "operations",
    });

    const analytics = buildStudentPlan({
      ...input,
      optionId: "analytics",
    });

    expect(
      operations.evaluation?.requirements
    ).not.toEqual(
      analytics.evaluation?.requirements
    );
  });

  it("handles unsupported programs safely", () => {
    const result = buildStudentPlan({
      ...input,
      programId: "unknown-program",
    });

    expect(result.programFound).toBe(false);
    expect(result.evaluation).toBeNull();
    expect(result.recommendations).toEqual([]);
  });

  it("identifies provisional requirements", () => {
    const result = buildStudentPlan(input);

    expect(result.verified).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
