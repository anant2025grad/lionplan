
export type PrerequisiteRule =
  | {
      type: "course";
      code: string;
    }
  | {
      type: "all";
      rules: PrerequisiteRule[];
    }
  | {
      type: "any";
      rules: PrerequisiteRule[];
    };

export type EligibilityStatus =
  | "eligible"
  | "ineligible"
  | "unknown";

export interface EligibilityResult {
  status: EligibilityStatus;
  explanation: string;
}
