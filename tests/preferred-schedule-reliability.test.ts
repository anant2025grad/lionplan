
import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  CourseSection,
} from "../src/types/schedule";

import type {
  StudentCourse,
} from "../src/types/academic";

import {
  DEFAULT_SCHEDULING_PREFERENCES,
} from "../src/types/scheduling-preferences";

import {
  generatePreferredSchedules,
} from "../src/lib/scheduling/generate-preferred-schedules";

function section(
  id: string,
  courseCode: string,
  day: "M" | "T" | "W" | "Th" | "F",
  start: number
): CourseSection {
  return {
    id,
    courseCode,
    title: courseCode,
    section: id,
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: [day],
        start,
        end: start + 50,
      },
    ],
  };
}

const catalog = [
  section("recommended", "DEMO 101", "M", 600),
  section("elective", "ELECTIVE 100", "T", 600),
  section("advanced", "DEMO 201", "W", 600),
];

function completed(
  code: string
): StudentCourse {
  return {
    code,
    title: code,
    credits: 3,
    term: "FA 2025",
    status: "completed",
  };
}

describe("preferred schedule reliability", () => {
  it("can lock a nonrecommended section", () => {
    const result = generatePreferredSchedules(
      catalog,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        lockedSectionIds: ["elective"],
      },
      {
        recommendedSectionIds: ["recommended"],
      }
    );

    expect(result.errors).toHaveLength(0);
    expect(result.schedules.length).toBeGreaterThan(0);

    expect(
      result.schedules.every((schedule) =>
        schedule.sections.some(
          (item) => item.id === "elective"
        )
      )
    ).toBe(true);
  });

  it("does not automatically add nonrecommended courses", () => {
    const result = generatePreferredSchedules(
      catalog,
      DEFAULT_SCHEDULING_PREFERENCES,
      {
        recommendedSectionIds: ["recommended"],
      }
    );

    expect(
      result.schedules.every((schedule) =>
        schedule.sections.every(
          (item) => item.id === "recommended"
        )
      )
    ).toBe(true);
  });

  it("blocks a course with an unmet configured prerequisite", () => {
    const result = generatePreferredSchedules(
      catalog,
      DEFAULT_SCHEDULING_PREFERENCES,
      {
        recommendedSectionIds: ["advanced"],
        history: [],
      }
    );

    expect(
      result.schedules.some((schedule) =>
        schedule.sections.some(
          (item) => item.id === "advanced"
        )
      )
    ).toBe(false);
  });

  it("allows a course after its configured prerequisite is completed", () => {
    const result = generatePreferredSchedules(
      catalog,
      DEFAULT_SCHEDULING_PREFERENCES,
      {
        recommendedSectionIds: ["advanced"],
        history: [completed("DEMO 101")],
      }
    );

    expect(
      result.schedules.some((schedule) =>
        schedule.sections.some(
          (item) => item.id === "advanced"
        )
      )
    ).toBe(true);
  });

  it("rejects an ineligible locked course", () => {
    const result = generatePreferredSchedules(
      catalog,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        lockedSectionIds: ["advanced"],
      },
      {
        recommendedSectionIds: [],
        history: [],
      }
    );

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.schedules).toHaveLength(0);
  });

  it("allows only locked courses when recommendations are empty", () => {
    const result = generatePreferredSchedules(
      catalog,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        lockedSectionIds: ["elective"],
      },
      {
        recommendedSectionIds: [],
      }
    );

    expect(result.schedules).toHaveLength(1);
    expect(
      result.schedules[0].sections.map(
        (item) => item.id
      )
    ).toEqual(["elective"]);
  });

  it("warns when prerequisites are unknown", () => {
    const result = generatePreferredSchedules(
      catalog,
      DEFAULT_SCHEDULING_PREFERENCES,
      {
        recommendedSectionIds: ["recommended"],
      }
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes("DEMO 101")
      )
    ).toBe(true);
  });
});
