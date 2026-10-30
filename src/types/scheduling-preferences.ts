
import type {
  MeetingDay,
} from "@/types/schedule";

export interface SchedulingPreferences {
  earliestStart: number;
  latestEnd: number;
  daysOff: MeetingDay[];
  lockedSectionIds: string[];
  targetCredits: number;
  maxCredits: number;
}

export const DEFAULT_SCHEDULING_PREFERENCES: SchedulingPreferences = {
  earliestStart: 8 * 60,
  latestEnd: 18 * 60,
  daysOff: [],
  lockedSectionIds: [],
  targetCredits: 15,
  maxCredits: 19,
};
