
import type {
  CreditBucket,
} from "@/types/general-education";

// Planning baseline adapted from the original
// LionPlan prototype. Not a complete official audit.
//
// Inter-Domain and Exploration rules require
// separate validation and are not included here.

export const GEN_ED_BUCKETS: CreditBucket[] = [
  {
    id: "GQ",
    name: "Quantification",
    required: 6,
  },
  {
    id: "GWS",
    name: "Writing and Speaking",
    required: 9,
  },
  {
    id: "GA",
    name: "Arts",
    required: 3,
  },
  {
    id: "GH",
    name: "Humanities",
    required: 3,
  },
  {
    id: "GS",
    name: "Social and Behavioral Sciences",
    required: 3,
  },
  {
    id: "GN",
    name: "Natural Sciences",
    required: 3,
  },
  {
    id: "GHW",
    name: "Health and Wellness",
    required: 3,
  },
];

export const GEN_ED_REVIEW_ITEMS = [
  "Inter-Domain course requirements",
  "Exploration credit requirements",
  "Integrative Studies rules",
  "Additional course-level restrictions",
  "Approved substitutions and exceptions",
  "Applicable Bulletin year",
];
