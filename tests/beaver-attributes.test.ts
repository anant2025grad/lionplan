import { describe, expect, it } from "vitest";
import { COURSE_ATTRIBUTES, getBeaverCourseAttributes } from "@/data/general-education/attributes";

describe("Spring 2027 Beaver Bulletin attributes", () => {
  it("preserves multiple attributes and cultures", () => {
    expect(getBeaverCourseAttributes("hist 144")).toEqual(["GH", "IL", "US"]);
    expect(COURSE_ATTRIBUTES["HIST 144"]).toEqual({genEd:["GH"],cultures:["IL","US"]});
  });
  it("does not count writing across curriculum as a Gen Ed bucket", () => {
    expect(getBeaverCourseAttributes("CYBER 342W")).toEqual(["W"]);
    expect(COURSE_ATTRIBUTES["CYBER 342W"].genEd).toEqual([]);
  });
  it("distinguishes no match from absent course", () => {
    expect(getBeaverCourseAttributes("CYBER 221")).toEqual([]);
    expect(getBeaverCourseAttributes("ASTRO 1")).toBeUndefined();
  });
  it("retains Inter-Domain dual attributes", () => {
    expect(COURSE_ATTRIBUTES["ENGL 163N"].genEd).toEqual(["GH", "GN", "ID"]);
  });
});
