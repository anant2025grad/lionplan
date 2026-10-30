
import { describe, expect, it } from "vitest";

import type {
  ProgramDefinition,
} from "../src/types/program";

import type {
  StudentCourse,
} from "../src/types/academic";

import {
  cybersecurityBS2026,
} from "../src/data/programs/cybersecurity/bs-2026";

import {
  getAvailablePrograms,
  getProgram,
} from "../src/data/programs/registry";

import {
  evaluateProgram,
} from "../src/lib/academic/evaluate-program";

import {
  recommendProgramCourses,
} from "../src/lib/academic/recommend-program-courses";

import {
  DEMO_SECTIONS,
} from "../src/data/scheduling/demo-sections";

function completed(code: string): StudentCourse {
  return {
    code,
    title: code,
    credits: 3,
    term: "FA 2025",
    status: "completed",
  };
}

describe("multi-major program architecture", () => {
  it("registers the Cybersecurity program", () => {
    expect(
      getAvailablePrograms().some(
        (program) =>
          program.id === "cybersecurity-bs"
      )
    ).toBe(true);
  });

  it("retrieves a program by ID and Bulletin year", () => {
    const program = getProgram({
      programId: "cybersecurity-bs",
      bulletinYear: "2026–2027",
    });

    expect(program).toBeDefined();
  });

  it("evaluates completed courses", () => {
    const result = evaluateProgram(
      cybersecurityBS2026,
      [completed("IST 210")],
      "operations"
    );

    expect(result.completed).toBe(1);
  });

  it("evaluates the selected option", () => {
    const operations = evaluateProgram(
      cybersecurityBS2026,
      [],
      "operations"
    );

    const analytics = evaluateProgram(
      cybersecurityBS2026,
      [],
      "analytics"
    );

    expect(
      operations.requirements.some((item) =>
        item.requirement.alternatives.includes(
          "CYBER 262"
        )
      )
    ).toBe(true);

    expect(
      analytics.requirements.some((item) =>
        item.requirement.alternatives.includes(
          "CYBER 262"
        )
      )
    ).toBe(false);
  });

  it("supports an unrelated degree definition", () => {
    const exampleProgram: ProgramDefinition = {
      id: "example-bs",
      name: "Example Program",
      degree: "B.S.",
      campus: "Test Campus",
      bulletinYear: "2026–2027",
      verified: false,
      requirements: [
        {
          id: "example-101",
          label: "EXAMPLE 101",
          alternatives: ["EXAMPLE 101"],
          category: "major",
        },
      ],
      manualReview: [],
    };

    const result = evaluateProgram(
      exampleProgram,
      [completed("EXAMPLE 101")]
    );

    expect(result.completed).toBe(1);
    expect(result.total).toBe(1);
  });

  it("recommends courses through the generic engine", () => {
    const evaluation = evaluateProgram(
      cybersecurityBS2026,
      [],
      "operations"
    );

    const recommendations = recommendProgramCourses(
      evaluation,
      DEMO_SECTIONS
    );

    expect(
      recommendations.some(
        (item) => item.courseCode === "CYBER 262"
      )
    ).toBe(true);
  });
});
