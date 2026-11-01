import type { CourseAttributes } from "@/types/general-education";
import { BEAVER_SPRING_2027_ATTRIBUTES } from "@/data/general-education/beaver-spring-2027-attributes";

// Only courses in the supplied Spring 2027 Beaver listing.
// W and FYS are separate designations; neither is a Gen Ed credit bucket.
// An empty mapping means no match in the checked Bulletin lists, NOT no degree credit.
const genEdCodes = new Set(["GQ", "GWS", "GA", "GH", "GS", "GN", "GHW", "ID"]);
export const COURSE_ATTRIBUTES: Record<string, CourseAttributes> = Object.fromEntries(
  Object.entries(BEAVER_SPRING_2027_ATTRIBUTES).map(([code, tags]) => [code, {
    genEd: tags.filter((tag) => genEdCodes.has(tag)) as CourseAttributes["genEd"],
    cultures: tags.filter((tag) => tag === "US" || tag === "IL") as CourseAttributes["cultures"],
  }])
);
export function getBeaverCourseAttributes(code: string): string[] | undefined {
  return BEAVER_SPRING_2027_ATTRIBUTES[code.trim().toUpperCase().replace(/\s+/g, " ")];
}
