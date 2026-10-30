
export type RequirementCategory =
  | "major"
  | "option"
  | "supporting"
  | "general_education"
  | "elective";

export interface ProgramRequirement {
  id: string;
  label: string;
  description?: string;
  alternatives: string[];
  category: RequirementCategory;
}

export interface ProgramDefinition {
  id: string;
  name: string;
  degree: string;
  campus: string;
  bulletinYear: string;
  verified: boolean;
  options?: {
    id: string;
    name: string;
  }[];
  requirements: ProgramRequirement[];
  optionRequirements?: Record<
    string,
    ProgramRequirement[]
  >;
  manualReview: string[];
}

export interface ProgramSelection {
  programId: string;
  bulletinYear: string;
  optionId?: string;
}
