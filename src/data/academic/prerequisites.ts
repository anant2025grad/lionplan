
import type {
  PrerequisiteRule,
} from "@/types/prerequisites";

// Demonstration rules only.
// These are NOT official Penn State prerequisites.
//
// Do not add actual course codes until their
// rules have been checked against the Bulletin.

export const DEMO_PREREQUISITES: Record<
  string,
  PrerequisiteRule
> = {
  "DEMO 201": {
    type: "course",
    code: "DEMO 101",
  },
  "DEMO 301": {
    type: "all",
    rules: [
      { type: "course", code: "DEMO 201" },
      {
        type: "any",
        rules: [
          { type: "course", code: "DEMO 210" },
          { type: "course", code: "DEMO 220" },
        ],
      },
    ],
  },
};
