
import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  CourseSection,
} from "../src/types/schedule";

import {
  DEFAULT_SCHEDULING_PREFERENCES,
} from "../src/types/scheduling-preferences";

import {
  generatePreferredSchedules,
} from "../src/lib/scheduling/generate-preferred-schedules";

function section(
  id: string,
  code: string,
  day: "M" | "T" | "W" | "Th" | "F",
  start: number,
  end: number
): CourseSection {
  return {
    id,
    courseCode: code,
    title: code,
    section: id,
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: [day],
        start,
        end,
      },
    ],
  };
}

const sections = [
  section("a", "TEST 101", "M", 540, 590),
  section("b", "TEST 102", "T", 600, 650),
  section("c", "TEST 103", "F", 660, 710),
  section("d", "TEST 104", "M", 560, 610),
];

describe("preferred schedule generation", () => {
  it("respects earliest start", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        earliestStart: 600,
      }
    );

    expect(
      result.schedules.every((schedule) =>
        schedule.sections.every((item) =>
          item.meetings.every(
            (meeting) =>
              meeting.start >= 600
          )
        )
      )
    ).toBe(true);
  });

  it("respects days off", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        daysOff: ["F"],
      }
    );

    expect(
      result.schedules.every((schedule) =>
        schedule.sections.every((item) =>
          item.meetings.every(
            (meeting) =>
              !meeting.days.includes("F")
          )
        )
      )
    ).toBe(true);
  });

  it("includes locked sections in every schedule", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        lockedSectionIds: ["a"],
      }
    );

    expect(result.errors).toHaveLength(0);
    expect(result.schedules.length).toBeGreaterThan(0);

    expect(
      result.schedules.every((schedule) =>
        schedule.sections.some(
          (item) => item.id === "a"
        )
      )
    ).toBe(true);
  });

  it("rejects conflicting locked sections", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        lockedSectionIds: ["a", "d"],
      }
    );

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.schedules).toHaveLength(0);
  });

  it("rejects locked sections on days off", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        daysOff: ["F"],
        lockedSectionIds: ["c"],
      }
    );

    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects unknown locked section IDs", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        lockedSectionIds: ["missing-id"],
      }
    );

    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("never exceeds maximum credits", () => {
    const result = generatePreferredSchedules(
      sections,
      {
        ...DEFAULT_SCHEDULING_PREFERENCES,
        targetCredits: 6,
        maxCredits: 6,
      }
    );

    expect(
      result.schedules.every(
        (schedule) => schedule.credits <= 6
      )
    ).toBe(true);
  });

  it("never generates overlapping sections", () => {
    const result = generatePreferredSchedules(
      sections,
      DEFAULT_SCHEDULING_PREFERENCES
    );

    expect(
      result.schedules.every(
        (schedule) =>
          !(
            schedule.sections.some(
              (item) => item.id === "a"
            ) &&
            schedule.sections.some(
              (item) => item.id === "d"
            )
          )
      )
    ).toBe(true);
  });
});
