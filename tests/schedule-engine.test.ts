
import { describe, expect, it } from "vitest";

import type { CourseSection } from "../src/types/schedule";

import {
  canAddSection,
  findScheduleConflicts,
  formatMinutes,
  summarizeSchedule,
  timeToMinutes,
} from "../src/lib/scheduling/schedule-engine";

function section(
  id: string,
  courseCode: string,
  days: ("M" | "T" | "W" | "Th" | "F")[],
  start: number,
  end: number
): CourseSection {
  return {
    id,
    courseCode,
    title: courseCode,
    section: id,
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [{ days, start, end }],
  };
}

describe("schedule engine", () => {
  it("detects overlapping classes", () => {
    const a = section("a", "CYBER 262", ["M"], 540, 590);
    const b = section("b", "IST 210", ["M"], 570, 620);

    const conflicts = findScheduleConflicts([a, b]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe("time_overlap");
    expect(conflicts[0].day).toBe("M");
  });

  it("allows back-to-back classes", () => {
    const a = section("a", "CYBER 262", ["M"], 540, 590);
    const b = section("b", "IST 210", ["M"], 590, 640);

    expect(findScheduleConflicts([a, b])).toHaveLength(0);
  });

  it("allows matching times on different days", () => {
    const a = section("a", "CYBER 262", ["M"], 540, 590);
    const b = section("b", "IST 210", ["T"], 540, 590);

    expect(findScheduleConflicts([a, b])).toHaveLength(0);
  });

  it("prevents selecting two sections of one course", () => {
    const a = section("a", "CYBER 262", ["M"], 540, 590);
    const b = section("b", "CYBER 262", ["T"], 540, 590);

    const result = canAddSection([a], b);

    expect(result.allowed).toBe(false);
    expect(result.conflicts[0].reason).toBe("same_course");
  });

  it("calculates scheduled credits", () => {
    const a = section("a", "CYBER 262", ["M"], 540, 590);
    const b = section("b", "IST 210", ["T"], 540, 590);

    const summary = summarizeSchedule([a, b]);

    expect(summary.credits).toBe(6);
    expect(summary.courseCount).toBe(2);
    expect(summary.conflicts).toHaveLength(0);
  });

  it("converts 12-hour clock times correctly", () => {
    expect(timeToMinutes("9:00 AM")).toBe(540);
    expect(timeToMinutes("12:00 PM")).toBe(720);
    expect(timeToMinutes("12:00 AM")).toBe(0);
    expect(formatMinutes(780)).toBe("1:00 PM");
  });
});
