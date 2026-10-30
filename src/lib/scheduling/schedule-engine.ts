
import type {
  ClassMeeting,
  CourseSection,
  MeetingDay,
  ScheduleConflict,
  ScheduleSummary,
} from "@/types/schedule";

export const DAYS: MeetingDay[] = [
  "M",
  "T",
  "W",
  "Th",
  "F",
  "Sa",
  "Su",
];

export function timeToMinutes(value: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(
    value.trim()
  );

  if (!match) {
    throw new Error(`Invalid time: ${value}`);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(`Invalid time: ${value}`);
  }

  return (
    (hour % 12) * 60 +
    (period === "PM" ? 720 : 0) +
    minute
  );
}

export function formatMinutes(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? "PM" : "AM";

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function meetingsOverlap(
  first: ClassMeeting,
  second: ClassMeeting
): MeetingDay[] {
  const sharedDays = first.days.filter((day) =>
    second.days.includes(day)
  );

  if (
    first.start >= first.end ||
    second.start >= second.end
  ) {
    return [];
  }

  const overlaps =
    first.start < second.end &&
    second.start < first.end;

  return overlaps ? sharedDays : [];
}

export function findScheduleConflicts(
  sections: CourseSection[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const first = sections[i];
      const second = sections[j];

      if (first.courseCode === second.courseCode) {
        conflicts.push({
          firstSectionId: first.id,
          secondSectionId: second.id,
          day: null,
          reason: "same_course",
        });

        continue;
      }

      const conflictingDays = new Set<MeetingDay>();

      for (const firstMeeting of first.meetings) {
        for (const secondMeeting of second.meetings) {
          for (const day of meetingsOverlap(
            firstMeeting,
            secondMeeting
          )) {
            conflictingDays.add(day);
          }
        }
      }

      for (const day of DAYS) {
        if (conflictingDays.has(day)) {
          conflicts.push({
            firstSectionId: first.id,
            secondSectionId: second.id,
            day,
            reason: "time_overlap",
          });
        }
      }
    }
  }

  return conflicts;
}

export function summarizeSchedule(
  sections: CourseSection[]
): ScheduleSummary {
  return {
    credits: sections.reduce(
      (total, section) => total + section.credits,
      0
    ),
    courseCount: new Set(
      sections.map((section) => section.courseCode)
    ).size,
    conflicts: findScheduleConflicts(sections),
  };
}

export function canAddSection(
  selected: CourseSection[],
  candidate: CourseSection
): {
  allowed: boolean;
  conflicts: ScheduleConflict[];
} {
  const conflicts = findScheduleConflicts([
    ...selected,
    candidate,
  ]).filter(
    (conflict) =>
      conflict.firstSectionId === candidate.id ||
      conflict.secondSectionId === candidate.id
  );

  return {
    allowed: conflicts.length === 0,
    conflicts,
  };
}
