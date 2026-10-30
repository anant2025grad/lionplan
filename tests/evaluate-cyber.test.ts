
import { describe, expect, it } from "vitest";

import type { StudentCourse } from "../src/types/academic";

import {
  getCyberCatalog,
} from "../src/data/programs/cyber-requirements";

import {
  evaluateCyberRequirements,
} from "../src/lib/academic/evaluate-cyber";

function course(
  code: string,
  status: StudentCourse["status"]
): StudentCourse {
  return {
    code,
    title: code,
    credits: 3,
    term: "FA 2026",
    status,
  };
}

describe("Cybersecurity requirement evaluator", () => {
  it("recognizes alternative course choices", () => {
    const catalog = getCyberCatalog("operations");

    const result = evaluateCyberRequirements(
      catalog,
      [course("CMPSC 131", "completed")]
    );

    const programming = result.requirements.find(
      (item) =>
        item.requirement.alternatives.includes(
          "CMPSC 131"
        )
    );

    expect(programming?.status).toBe("completed");
  });

  it("does not treat in-progress courses as completed", () => {
    const result = evaluateCyberRequirements(
      getCyberCatalog("operations"),
      [course("CYBER 262", "in_progress")]
    );

    expect(result.inProgress).toBe(1);
    expect(result.completed).toBe(0);
  });

  it("prefers a completed attempt over a failed attempt", () => {
    const result = evaluateCyberRequirements(
      getCyberCatalog("operations"),
      [
        course("CYBER 262", "no_credit"),
        course("CYBER 262", "completed"),
      ]
    );

    const requirement = result.requirements.find(
      (item) =>
        item.requirement.alternatives.includes(
          "CYBER 262"
        )
    );

    expect(requirement?.status).toBe("completed");
  });

  it("flags low-grade attempts for review", () => {
    const result = evaluateCyberRequirements(
      getCyberCatalog("operations"),
      [course("CYBER 262", "low_grade")]
    );

    expect(result.attention).toBe(1);
  });

  it("changes requirements when the option changes", () => {
    const operations = getCyberCatalog("operations");
    const analytics = getCyberCatalog("analytics");

    expect(
      operations.requirements.some((item) =>
        item.alternatives.includes("CYBER 262")
      )
    ).toBe(true);

    expect(
      analytics.requirements.some((item) =>
        item.alternatives.includes("CYBER 262")
      )
    ).toBe(false);
  });
});
