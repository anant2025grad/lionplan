
import type { StudentCourse } from "@/types/academic";
import type { CourseSection } from "@/types/schedule";

import type {
  SchedulingPreferences,
} from "@/types/scheduling-preferences";

import {
  findScheduleConflicts,
} from "@/lib/scheduling/schedule-engine";

import {
  evaluatePrerequisites,
} from "@/lib/academic/evaluate-prerequisites";

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

  // Omit to preserve Session 12 behavior:
  // all unlocked catalog sections are candidates.
  // Pass [] to allow locked sections only.
  recommendedSectionIds?: string[];

  // Academic history used for prerequisite checks.
  history?: StudentCourse[];
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, " ");
}

function fitsPreferences(
  section: CourseSection,
  preferences: SchedulingPreferences
): boolean {
  return section.meetings.every((meeting) => {
    if (
      !Number.isFinite(meeting.start) ||
      !Number.isFinite(meeting.end) ||
      meeting.start >= meeting.end
    ) {
      return false;
    }

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
    (sum, section) => sum + section.credits,
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
  const maxResults = Math.max(
    1,
    Math.floor(options.maxResults ?? 5)
  );

  const maxCombinations = Math.max(
    1,
    Math.floor(options.maxCombinations ?? 50000)
  );

  const history = options.history ?? [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    !Number.isFinite(preferences.targetCredits) ||
    !Number.isFinite(preferences.maxCredits) ||
    preferences.targetCredits < 0 ||
    preferences.maxCredits <= 0 ||
    preferences.targetCredits > preferences.maxCredits
  ) {
    return {
      schedules: [],
      errors: [
        "Target credits must be nonnegative and cannot exceed maximum credits.",
      ],
      warnings,
    };
  }

  if (
    !Number.isFinite(preferences.earliestStart) ||
    !Number.isFinite(preferences.latestEnd) ||
    preferences.earliestStart >= preferences.latestEnd
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
        `Locked section ${id} was not found in the section catalog.`
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
    totalCredits(locked) > preferences.maxCredits
  ) {
    errors.push(
      "Locked sections exceed the maximum credit limit."
    );
  }

  // Cache eligibility so repeated sections of the same
  // course do not trigger repeated evaluations.
  const eligibilityCache = new Map<
    string,
    ReturnType<typeof evaluatePrerequisites>
  >();

  function eligibilityFor(courseCode: string) {
    const code = normalizeCode(courseCode);

    const cached = eligibilityCache.get(code);

    if (cached) return cached;

    const result = evaluatePrerequisites(
      code,
      history
    );

    eligibilityCache.set(code, result);

    return result;
  }

  // A locked section is a hard constraint.
  // If a known prerequisite is unmet, fail clearly.
  for (const section of locked) {
    const eligibility = eligibilityFor(
      section.courseCode
    );

    if (eligibility.status === "ineligible") {
      errors.push(
        `${section.courseCode} is locked but does not meet the configured prerequisite rule: ${eligibility.explanation}`
      );
    }
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
      normalizeCode(section.courseCode)
    )
  );

  // When recommendations are provided, only those
  // sections can be added automatically.
  // Locked sections remain allowed regardless.
  const recommendedIds =
    options.recommendedSectionIds === undefined
      ? null
      : new Set(options.recommendedSectionIds);

  const eligible = uniqueSections.filter(
    (section) => {
      if (lockedIds.has(section.id)) {
        return false;
      }

      if (
        lockedCodes.has(
          normalizeCode(section.courseCode)
        )
      ) {
        return false;
      }

      if (
        recommendedIds !== null &&
        !recommendedIds.has(section.id)
      ) {
        return false;
      }

      if (
        !fitsPreferences(section, preferences) ||
        !Number.isFinite(section.credits) ||
        section.credits <= 0
      ) {
        return false;
      }

      const eligibility = eligibilityFor(
        section.courseCode
      );

      return eligibility.status !== "ineligible";
    }
  );

  const grouped = new Map<
    string,
    CourseSection[]
  >();

  for (const section of eligible) {
    const code = normalizeCode(
      section.courseCode
    );

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

    // Try a section before skipping the course.
    // This favors populated schedules when the
    // search limit is reached.
    for (const section of groups[groupIndex]) {
      if (explored >= maxCombinations) break;

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

    // The student does not have to take every
    // recommended course in one semester.
    search(
      groupIndex + 1,
      selected,
      credits
    );
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
      b.sections.length - a.sections.length ||
      a.id.localeCompare(b.id)
  );

  const schedules = results.slice(
    0,
    maxResults
  );

  // Only warn about unknown prerequisite rules for
  // courses that appear in the returned schedules.
  const selectedCodes = new Set(
    schedules.flatMap((schedule) =>
      schedule.sections.map((section) =>
        normalizeCode(section.courseCode)
      )
    )
  );

  for (const code of selectedCodes) {
    const eligibility = eligibilityFor(code);

    if (eligibility.status === "unknown") {
      warnings.push(
        `${code}: prerequisites have not been verified. Check LionPATH and the official course description.`
      );
    }
  }

  return {
    schedules,
    errors,
    warnings,
  };
}
