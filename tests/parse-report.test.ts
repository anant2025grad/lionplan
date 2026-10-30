
import { describe, expect, it } from "vitest";

import { parseWhatIfReport } from "../src/lib/academic/parse-report";

describe("LionPATH What-If parser", () => {
  it("reads completed, in-progress and dropped courses", () => {
    const report = `
      Pre-Major Audit
      Course History
      CMPSC 131 Programming and Computation I 3.00 FA 2025 A EN
      CYBER 262 Cyber Defense Studio 3.00 FA 2026 IP
      MATH 140 Calculus 4.00 SP 2026 LD EN
      IST 210 Organization of Data 3.00 SP 2026 B+ EN
    `;

    const result = parseWhatIfReport(report);

    expect(result.isPreMajor).toBe(true);
    expect(result.courses).toHaveLength(4);

    expect(result.courses[0].status).toBe("completed");
    expect(result.courses[1].status).toBe("in_progress");
    expect(result.courses[2].status).toBe("no_credit");
    expect(result.courses[3].status).toBe("completed");
  });

  it("reports when course history is missing", () => {
    const result = parseWhatIfReport(
      "This is not a What-If report."
    );

    expect(result.courses).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("does not retain state between imports", () => {
    const report = `
      Course History
      STAT 200 Statistics 4.00 FA 2025 A EN
    `;

    const first = parseWhatIfReport(report);
    const second = parseWhatIfReport(report);

    expect(first.courses).toEqual(second.courses);
  });
});
