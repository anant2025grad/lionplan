
import { describe, expect, it } from "vitest";

import type { StudentCourse } from "../src/types/academic";

import {
  evaluateGeneralEducation,
} from "../src/lib/academic/evaluate-general-education";

function course(
  code: string,
  credits: number,
  status: StudentCourse["status"] = "completed"
): StudentCourse {
  return {
    code,
    title: code,
    credits,
    term: "FA 2026",
    status,
  };
}

describe("General Education allocation", () => {
  it("does not double-count multi-attribute credits", () => {
    const result = evaluateGeneralEducation([
      course("ENGL 163N", 3),
    ]);

    const allocated = result.allocations.reduce(
      (sum, item) => sum + item.credits,
      0
    );

    expect(allocated).toBe(3);
  });

  it("allocates completed credits before in-progress credits", () => {
    const result = evaluateGeneralEducation([
      course("MATH 140", 4, "completed"),
      course("STAT 200", 4, "in_progress"),
    ]);

    const gq = result.buckets.find(
      (bucket) => bucket.id === "GQ"
    );

    expect(gq?.completed).toBe(4);
    expect(gq?.inProgress).toBe(2);
    expect(gq?.remaining).toBe(0);
  });

  it("does not count repeated courses twice", () => {
    const result = evaluateGeneralEducation([
      course("MATH 140", 4, "completed"),
      course("MATH 140", 4, "completed"),
    ]);

    const gq = result.buckets.find(
      (bucket) => bucket.id === "GQ"
    );

    expect(gq?.completed).toBe(4);
  });

  it("tracks cultures separately from credit allocation", () => {
    const result = evaluateGeneralEducation([
      course("HIST 144", 3),
    ]);

    expect(result.cultures.US.completed).toContain(
      "HIST 144"
    );

    expect(result.cultures.IL.completed).toContain(
      "HIST 144"
    );
  });

  it("flags courses with missing attribute data", () => {
    const result = evaluateGeneralEducation([
      course("CYBER 221", 3),
    ]);

    expect(result.unknownCourses).toContain(
      "CYBER 221"
    );
  });
});
