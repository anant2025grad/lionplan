import type {
  CourseSection,
  MeetingDay,
} from "@/types/schedule";

export const WEEKDAYS: MeetingDay[] = [
  "M",
  "T",
  "W",
  "Th",
  "F",
];

export const DAY_NAMES: Record<MeetingDay, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

export const DEFAULT_START = 8 * 60;
export const DEFAULT_END = 18 * 60;
export const PIXELS_PER_MINUTE = 1;

export interface CalendarEvent {
  id: string;
  sectionId: string;
  courseCode: string;
  title: string;
  section: string;
  day: MeetingDay;
  start: number;
  end: number;
  location?: string;
}

export function getCalendarEvents(
  sections: CourseSection[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const section of sections) {
    section.meetings.forEach((meeting, index) => {
      if (
        !Number.isFinite(meeting.start) ||
        !Number.isFinite(meeting.end) ||
        meeting.end <= meeting.start
      ) {
        return;
      }

      for (const day of meeting.days) {
        events.push({
          id: `${section.id}-${index}-${day}`,
          sectionId: section.id,
          courseCode: section.courseCode,
          title: section.title,
          section: section.section,
          day,
          start: meeting.start,
          end: meeting.end,
          location: meeting.location,
        });
      }
    });
  }

  return events.sort(
    (a, b) =>
      a.start - b.start ||
      a.end - b.end ||
      a.courseCode.localeCompare(b.courseCode)
  );
}

export function getCalendarBounds(
  events: CalendarEvent[],
  start = DEFAULT_START,
  end = DEFAULT_END
) {
  if (events.length === 0) {
    return { start, end };
  }

  const earliest = Math.min(
    start,
    ...events.map((event) => event.start)
  );

  const latest = Math.max(
    end,
    ...events.map((event) => event.end)
  );

  return {
    start: Math.floor(earliest / 60) * 60,
    end: Math.ceil(latest / 60) * 60,
  };
}

export function getEventPosition(
  event: CalendarEvent,
  calendarStart: number,
  pixelsPerMinute = PIXELS_PER_MINUTE
) {
  return {
    top:
      (event.start - calendarStart) *
      pixelsPerMinute,
    height:
      (event.end - event.start) *
      pixelsPerMinute,
  };
}

export function getHourMarks(
  start: number,
  end: number
): number[] {
  const marks: number[] = [];

  for (
    let minute = Math.ceil(start / 60) * 60;
    minute <= end;
    minute += 60
  ) {
    marks.push(minute);
  }

  return marks;
}
