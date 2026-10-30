
import type {
  ProgramDefinition,
  ProgramRequirement,
} from "@/types/program";

import {
  getCyberCatalog,
} from "@/data/programs/cyber-requirements";

function convertRequirements(
  option: "operations" | "analytics"
): ProgramRequirement[] {
  const catalog = getCyberCatalog(option);

  return catalog.requirements.map((item) => ({
    id: item.id,
    label: item.label,
    alternatives: item.alternatives,
    category:
      item.category === "common"
        ? "major"
        : "option",
  }));
}

const operations = convertRequirements("operations");
const analytics = convertRequirements("analytics");

export const cybersecurityBS2026: ProgramDefinition = {
  id: "cybersecurity-bs",
  name: "Cybersecurity Analytics and Operations",
  degree: "B.S.",
  campus: "Penn State Beaver",
  bulletinYear: "2026–2027",
  verified: false,

  options: [
    {
      id: "operations",
      name: "Operations",
    },
    {
      id: "analytics",
      name: "Analytics",
    },
  ],

  requirements: operations.filter(
    (item) => item.category === "major"
  ),

  optionRequirements: {
    operations: operations.filter(
      (item) => item.category === "option"
    ),
    analytics: analytics.filter(
      (item) => item.category === "option"
    ),
  },

  manualReview: getCyberCatalog(
    "operations"
  ).manualReview,
};
