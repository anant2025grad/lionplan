
import type {
  CourseAttributes,
} from "@/types/general-education";

// Starter attribute data from the original LionPlan prototype.
// Provisional until verified against Penn State course data.

export const COURSE_ATTRIBUTES: Record<
  string,
  CourseAttributes
> = {
  "MATH 140": { genEd: ["GQ"], cultures: [] },
  "MATH 141": { genEd: ["GQ"], cultures: [] },
  "STAT 200": { genEd: ["GQ"], cultures: [] },

  "ENGL 15": { genEd: ["GWS"], cultures: [] },
  "ENGL 202D": { genEd: ["GWS"], cultures: [] },
  "CAS 100A": { genEd: ["GWS"], cultures: [] },

  "PSYCH 100": { genEd: ["GS"], cultures: [] },
  "ECON 102": { genEd: ["GS"], cultures: [] },
  "ECON 104": { genEd: ["GS"], cultures: [] },

  "BIOL 110": { genEd: ["GN"], cultures: [] },
  "CHEM 110": { genEd: ["GN"], cultures: [] },
  "PHYS 211": { genEd: ["GN"], cultures: [] },

  "KINES 77": { genEd: ["GHW"], cultures: [] },
  "KINES 81": { genEd: ["GHW"], cultures: [] },

  "HIST 153": { genEd: ["GH"], cultures: ["US"] },
  "HIST 144": { genEd: ["GH"], cultures: ["US", "IL"] },
  "HIST 173": { genEd: ["GH"], cultures: ["IL"] },

  "PLSC 1": { genEd: ["GS"], cultures: ["US"] },

  "ENGL 163N": {
    genEd: ["GH", "GN", "ID"],
    cultures: [],
  },
};
