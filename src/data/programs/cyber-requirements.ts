
export type CyberOption = "operations" | "analytics";

export interface CourseRequirement {
  id: string;
  label: string;
  alternatives: string[];
  category: "common" | "option";
}

export interface CyberRequirementCatalog {
  programId: string;
  programName: string;
  bulletinYear: string;
  option: CyberOption;
  verified: boolean;
  requirements: CourseRequirement[];
  manualReview: string[];
}

const COMMON: string[][] = [
  ["CYBER 221"],
  ["CYBER 342W"],
  ["CYBER 440"],
  ["CYBER 451"],
  ["CYBER 454"],
  ["CYBER 456"],
  ["IST 210"],
  ["IST 220"],
  ["IST 432"],
  ["IST 495"],
  ["SRA 111"],
  ["SRA 231"],
  ["SRA 311"],
  ["SRA 365"],
  ["CYBER 100", "CYBER 100S"],
  ["ENGL 202C", "ENGL 202D"],
  ["IST 140", "CMPSC 121", "CMPSC 131"],
  ["STAT 200", "SCM 200"],
];

const OPERATIONS: string[][] = [
  ["CYBER 262"],
  ["IST 230"],
  ["IST 242", "CMPSC 122", "CMPSC 132"],
  ["IST 256", "IST 261", "HCDD 361"],
  ["MATH 110", "MATH 140"],
];

const ANALYTICS: string[][] = [
  ["ECON 102", "ECON 104"],
  ["MATH 26", "MATH 41", "MATH 110", "MATH 140"],
  ["PSYCH 100", "SOC 5", "A-I 100"],
  ["GEOG 128", "PLSC 1", "PLSC 14"],
];

function makeRequirements(
  groups: string[][],
  category: "common" | "option"
): CourseRequirement[] {
  return groups.map((alternatives, index) => ({
    id: `${category}-${index + 1}`,
    label: alternatives.join(" / "),
    alternatives,
    category,
  }));
}

export function getCyberCatalog(
  option: CyberOption
): CyberRequirementCatalog {
  return {
    programId: "cybersecurity-bs",
    programName:
      "Cybersecurity Analytics and Operations, B.S.",
    bulletinYear: "2026–2027",
    option,
    verified: false,
    requirements: [
      ...makeRequirements(COMMON, "common"),
      ...makeRequirements(
        option === "operations" ? OPERATIONS : ANALYTICS,
        "option"
      ),
    ],
    manualReview: [
      "Application Focus requirements",
      "Supporting course requirements",
      "List A and List B requirements",
      "First-Year Seminar",
      "General Education requirements",
      "Cultures requirements",
      "Course prerequisites and minimum grades",
      "Transfer equivalencies and substitutions",
      "Bulletin-year applicability",
    ],
  };
}
