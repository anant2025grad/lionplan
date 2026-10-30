
export type CourseStatus =
  | "completed"
  | "in_progress"
  | "low_grade"
  | "no_credit";

export interface StudentCourse {
  code: string;
  title: string;
  credits: number;
  term: string;
  grade?: string;
  status: CourseStatus;
}

export interface DegreeRequirement {
  id: string;
  name: string;
  description?: string;
  courses: string[];
  creditsRequired: number;
  minimumGrade?: string;
}

export interface DegreeProgram {
  id: string;
  name: string;
  degree: "BS" | "BA" | "AS" | "AAS";
  campus: string;
  bulletinYear: string;
  totalCredits: number;
  requirements: DegreeRequirement[];
}

export interface RequirementResult {
  requirement: DegreeRequirement;
  status: "completed" | "in_progress" | "missing";
  matchedCourses: StudentCourse[];
  creditsSatisfied: number;
}

export interface DegreeEvaluation {
  programId: string;
  requirements: RequirementResult[];
  completedCount: number;
  inProgressCount: number;
  missingCount: number;
  progressPercentage: number;
}
