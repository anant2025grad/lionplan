
export type MeetingDay =
  | "M"
  | "T"
  | "W"
  | "Th"
  | "F"
  | "Sa"
  | "Su";

export interface ClassMeeting {
  days: MeetingDay[];
  start: number;
  end: number;
  location?: string;
}

export interface CourseSection {
  id: string;
  courseCode: string;
  title: string;
  section: string;
  campus: string;
  credits: number;
  instructor?: string;
  modality: "in_person" | "web" | "arranged";
  meetings: ClassMeeting[];
  seatsAvailable?: number;
}

export interface ScheduleConflict {
  firstSectionId: string;
  secondSectionId: string;
  day: MeetingDay | null;
  reason: "time_overlap" | "same_course";
}

export interface ScheduleSummary {
  credits: number;
  courseCount: number;
  conflicts: ScheduleConflict[];
}
