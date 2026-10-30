
import { describe, expect, it } from "vitest";

import type { StudentCourse } from "../src/types/academic";
import type { CourseSection } from "../src/types/schedule";
import type { PrerequisiteRule } from "../src/types/prerequisites";

import {
  evaluatePrerequisites,
} from "../src/lib/academic/evaluate-prerequisites";

import {
  recommendCourses,
} from "../src/lib/academic/recommend-courses";

import {
  generateSchedules,
} from "../src/lib/scheduling/generate-schedules";

import {
  findScheduleConflicts,
} from "../src/lib/scheduling/schedule-engine";

import { DEMO_SECTIONS } from "../src/data/scheduling/demo-sections";

function completed(code: string): StudentCourse {
  return {
    code,
    title: code,
    credits: 3,
    term: "FA 2025",
    status: "completed",
  };
}

describe("prerequisite evaluation", () => {
  const rules: Record<string, PrerequisiteRule> = {
    "TEST 200": {
      type: "course",
      code: "TEST 100",
    },
    "TEST 300": {
      type: "any",
      rules: [
        { type: "course", code: "TEST 100" },
        { type: "course", code: "TEST 150" },
      ],
    },
  };

  it("recognizes satisfied prerequisites", () => {
    const result = evaluatePrerequisites(
      "TEST 200",
      [completed("TEST 100")],
      rules
    );

    expect(result.status).toBe("eligible");
  });

  it("recognizes unsatisfied prerequisites", () => {
    const result = evaluatePrerequisites(
      "TEST 200",
      [],
      rules
    );

    expect(result.status).toBe("ineligible");
  });

  it("supports alternative prerequisites", () => {
    const result = evaluatePrerequisites(
      "TEST 300",
      [completed("TEST 150")],
      rules
    );

    expect(result.status).toBe("eligible");
  });

  it("does not assume unknown courses are eligible", () => {
    const result = evaluatePrerequisites(
      "CYBER 262",
      [],
      rules
    );

    expect(result.status).toBe("unknown");
  });
});

describe("automatic schedule generation", () => {
  const recommendations = recommendCourses(
    [],
    DEMO_SECTIONS,
    "operations"
  );

  it("generates schedules from recommendations", () => {
    const schedules = generateSchedules(
      recommendations,
      [],
      { targetCredits: 9 }
    );

    expect(schedules.length).toBeGreaterThan(0);
  });

  it("never generates overlapping schedules", () => {
    const schedules = generateSchedules(
      recommendations,
      [],
      { targetCredits: 12 }
    );

    for (const schedule of schedules) {
      expect(
        findScheduleConflicts(schedule.sections)
      ).toHaveLength(0);
    }
  });

  it("does not exceed the credit limit", () => {
    const schedules = generateSchedules(
      recommendations,
      [],
      {
        targetCredits: 9,
        maxCredits: 9,
      }
    );

    expect(
      schedules.every(
        (schedule) => schedule.credits <= 9
      )
    ).toBe(true);
  });

  it("does not select two sections of the same course", () => {
    const schedules = generateSchedules(
      recommendations,
      [],
      { targetCredits: 15 }
    );

    for (const schedule of schedules) {
      const codes = schedule.sections.map(
        (section) => section.courseCode
      );

      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  it("respects the maximum result count", () => {
    const schedules = generateSchedules(
      recommendations,
      [],
      {
        targetCredits: 12,
        maxResults: 2,
      }
    );

    expect(schedules.length).toBeLessThanOrEqual(2);
  });
});
