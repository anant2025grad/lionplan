
import { describe, expect, it } from "vitest";

import type { StudentCourse } from "../src/types/academic";

import { DEMO_SECTIONS } from "../src/data/scheduling/demo-sections";

import {
  recommendCourses,
} from "../src/lib/academic/recommend-courses";

function course(
  code: string,
  status: StudentCourse["status"]
): StudentCourse {
  return {
    code,
    title: code,
    credits: 3,
    term: "FA 2026",
    status,
  };
}

describe("course recommendations", () => {
  it("recommends a missing course with demo sections", () => {
    const result = recommendCourses(
      [],
      DEMO_SECTIONS,
      "operations"
    );

    expect(
      result.some(
        (item) => item.courseCode === "CYBER 262"
      )
    ).toBe(true);
  });

  it("does not recommend completed courses", () => {
    const result = recommendCourses(
      [course("CYBER 262", "completed")],
      DEMO_SECTIONS,
      "operations"
    );

    expect(
      result.some(
        (item) => item.courseCode === "CYBER 262"
      )
    ).toBe(false);
  });

  it("does not recommend in-progress courses", () => {
    const result = recommendCourses(
      [course("IST 210", "in_progress")],
      DEMO_SECTIONS,
      "operations"
    );

    expect(
      result.some(
        (item) => item.courseCode === "IST 210"
      )
    ).toBe(false);
  });

  it("groups multiple sections under one course", () => {
    const result = recommendCourses(
      [],
      DEMO_SECTIONS,
      "operations"
    );

    const cyber262 = result.find(
      (item) => item.courseCode === "CYBER 262"
    );

    expect(cyber262?.sections).toHaveLength(2);
  });

  it("does not recommend courses absent from the section catalog", () => {
    const result = recommendCourses(
      [],
      [],
      "operations"
    );

    expect(result).toHaveLength(0);
  });

  it("does not recommend Operations-only requirements for Analytics", () => {
    const result = recommendCourses(
      [],
      DEMO_SECTIONS,
      "analytics"
    );

    expect(
      result.some(
        (item) => item.courseCode === "CYBER 262"
      )
    ).toBe(false);
  });
});
