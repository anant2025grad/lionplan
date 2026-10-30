
import { describe, expect, it } from "vitest";

import type {
  CourseSection,
} from "../src/types/schedule";

import {
  getCalendarBounds,
  getCalendarEvents,
  getEventPosition,
  getHourMarks,
} from "../src/lib/scheduling/calendar-layout";

const sampleSection: CourseSection = {
  id: "test-001",
  courseCode: "TEST 101",
  title: "Example Course",
  section: "001",
  campus: "Beaver",
  credits: 3,
  modality: "in_person",
  meetings: [
    {
      days: ["M", "W", "F"],
      start: 9 * 60,
      end: 9 * 60 + 50,
    },
  ],
};

describe("calendar layout", () => {
  it("creates one event per meeting day", () => {
    const events = getCalendarEvents([
      sampleSection,
    ]);

    expect(events).toHaveLength(3);

    expect(events.map((event) => event.day)).toEqual(
      ["M", "W", "F"]
    );
  });

  it("positions a 9 AM class below an 8 AM start", () => {
    const event = getCalendarEvents([
      sampleSection,
    ])[0];

    expect(
      getEventPosition(event, 8 * 60)
    ).toEqual({
      top: 60,
      height: 50,
    });
  });

  it("expands bounds for early classes", () => {
    const earlySection: CourseSection = {
      ...sampleSection,
      id: "early-001",
      meetings: [
        {
          days: ["T"],
          start: 7 * 60 + 30,
          end: 8 * 60 + 45,
        },
      ],
    };

    const bounds = getCalendarBounds(
      getCalendarEvents([earlySection])
    );

    expect(bounds.start).toBe(7 * 60);
  });

  it("expands bounds for late classes", () => {
    const lateSection: CourseSection = {
      ...sampleSection,
      id: "late-001",
      meetings: [
        {
          days: ["Th"],
          start: 18 * 60,
          end: 19 * 60 + 15,
        },
      ],
    };

    const bounds = getCalendarBounds(
      getCalendarEvents([lateSection])
    );

    expect(bounds.end).toBe(20 * 60);
  });

  it("generates hourly marks", () => {
    expect(
      getHourMarks(9 * 60, 12 * 60)
    ).toEqual([
      540,
      600,
      660,
      720,
    ]);
  });

  it("does not place web courses without meetings", () => {
    const webSection: CourseSection = {
      ...sampleSection,
      id: "web-001",
      modality: "web",
      meetings: [],
    };

    expect(
      getCalendarEvents([webSection])
    ).toHaveLength(0);
  });

  it("ignores invalid meeting ranges", () => {
    const invalidSection: CourseSection = {
      ...sampleSection,
      meetings: [
        {
          days: ["M"],
          start: 600,
          end: 540,
        },
      ],
    };

    expect(
      getCalendarEvents([invalidSection])
    ).toHaveLength(0);
  });
});
