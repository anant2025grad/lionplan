
import type {
  CourseSection,
} from "@/types/schedule";

import type {
  SchedulingPreferences,
} from "@/types/scheduling-preferences";

import {
  findScheduleConflicts,
} from "@/lib/scheduling/schedule-engine";

export interface PreferredSchedule {
  id: string;
  sections: CourseSection[];
  credits: number;
  differenceFromTarget: number;
}

export interface PreferredScheduleResult {
  schedules: PreferredSchedule[];
  errors: string[];
  warnings: string[];
}

export interface PreferredGenerationOptions {
  maxResults?: number;
  maxCombinations?: number;
}

function fitsPreferences(
  section: CourseSection,
  preferences: SchedulingPreferences
): boolean {
  return section.meetings.every((meeting) => {
    if (
      meeting.start < preferences.earliestStart ||
      meeting.end > preferences.latestEnd
    ) {
      return false;
    }

    return !meeting.days.some((day) =>
      preferences.daysOff.includes(day)
    );
  });
}

function totalCredits(
  sections: CourseSection[]
): number {
  return sections.reduce(
    (total, section) => total + section.credits,
    0
  );
}

function scheduleKey(
  sections: CourseSection[]
): string {
  return sections
    .map((section) => section.id)
    .sort()
    .join("|");
}

export function generatePreferredSchedules(
  availableSections: CourseSection[],
  preferences: SchedulingPreferences,
  options: PreferredGenerationOptions = {}
): PreferredScheduleResult {
  const maxResults = options.maxResults ?? 5;
  const maxCombinations =
    options.maxCombinations ?? 50000;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    !Number.isFinite(preferences.targetCredits) ||
    !Number.isFinite(preferences.maxCredits) ||
    preferences.targetCredits < 0 ||
    preferences.maxCredits <= 0 ||
    preferences.targetCredits >
      preferences.maxCredits
  ) {
    return {
      schedules: [],
      errors: [
        "Target credits must be nonnegative and cannot exceed the maximum credit limit.",
      ],
      warnings,
    };
  }

  if (
    preferences.earliestStart >=
    preferences.latestEnd
  ) {
    return {
      schedules: [],
      errors: [
        "Earliest start must be before latest finish.",
      ],
      warnings,
    };
  }

  const uniqueSections = [
    ...new Map(
      availableSections.map((section) => [
        section.id,
        section,
      ])
    ).values(),
  ];

  const byId = new Map(
    uniqueSections.map((section) => [
      section.id,
      section,
    ])
  );

  const locked: CourseSection[] = [];

  for (const id of new Set(
    preferences.lockedSectionIds
  )) {
    const section = byId.get(id);

    if (!section) {
      errors.push(
        `Locked section ${id} is not in the available section catalog.`
      );
      continue;
    }

    locked.push(section);

    if (!fitsPreferences(section, preferences)) {
      errors.push(
        `${section.courseCode} section ${section.section} violates your time or day-off preferences.`
      );
    }
  }

  if (findScheduleConflicts(locked).length > 0) {
    errors.push(
      "Two or more locked sections conflict."
    );
  }

  if (
    totalCredits(locked) >
    preferences.maxCredits
  ) {
    errors.push(
      "Locked sections exceed the maximum credit limit."
    );
  }

  if (errors.length > 0) {
    return {
      schedules: [],
      errors,
      warnings,
    };
  }

  const lockedIds = new Set(
    locked.map((section) => section.id)
  );

  const lockedCodes = new Set(
    locked.map((section) =>
      section.courseCode.trim().toUpperCase()
    )
  );

  const eligible = uniqueSections.filter(
    (section) =>
      !lockedIds.has(section.id) &&
      !lockedCodes.has(
        section.courseCode.trim().toUpperCase()
      ) &&
      fitsPreferences(section, preferences) &&
      section.credits > 0
  );

  const grouped = new Map<
    string,
    CourseSection[]
  >();

  for (const section of eligible) {
    const code = section.courseCode
      .trim()
      .toUpperCase();

    const group = grouped.get(code) ?? [];
    group.push(section);
    grouped.set(code, group);
  }

  const groups = [...grouped.values()];
  const results: PreferredSchedule[] = [];
  const seen = new Set<string>();
  let explored = 0;

  function record(
    sections: CourseSection[]
  ) {
    if (sections.length === 0) return;

    const key = scheduleKey(sections);
    if (seen.has(key)) return;

    seen.add(key);

    const credits = totalCredits(sections);

    results.push({
      id: key,
      sections: [...sections],
      credits,
      differenceFromTarget: Math.abs(
        credits - preferences.targetCredits
      ),
    });
  }

  function search(
    groupIndex: number,
    selected: CourseSection[],
    credits: number
  ) {
    if (explored >= maxCombinations) return;
    explored++;

    if (groupIndex === groups.length) {
      record(selected);
      return;
    }

    // Option 1: Skip this course.
    search(
      groupIndex + 1,
      selected,
      credits
    );

    // Option 2: Choose one section.
    for (const section of groups[groupIndex]) {
      if (
        explored >= maxCombinations
      ) {
        break;
      }

      if (
        credits + section.credits >
        preferences.maxCredits
      ) {
        continue;
      }

      if (
        findScheduleConflicts([
          ...selected,
          section,
        ]).length > 0
      ) {
        continue;
      }

      search(
        groupIndex + 1,
        [...selected, section],
        credits + section.credits
      );
    }
  }

  search(
    0,
    locked,
    totalCredits(locked)
  );

  if (explored >= maxCombinations) {
    warnings.push(
      "The search limit was reached. Results may not include every possible schedule."
    );
  }

  results.sort(
    (a, b) =>
      a.differenceFromTarget -
        b.differenceFromTarget ||
      b.credits - a.credits ||
      a.id.localeCompare(b.id)
  );

  return {
    schedules: results.slice(0, maxResults),
    errors,
    warnings,
  };
}
