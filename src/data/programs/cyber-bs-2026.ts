
import type { DegreeProgram } from "@/types/academic";

export const cyberProgram: DegreeProgram = {
  id: "cyber-bs-2026",
  name: "Cybersecurity Analytics and Operations",
  degree: "BS",
  campus: "Beaver",
  bulletinYear: "2026-2027",
  totalCredits: 0, // Placeholder until verified
  requirements: [
    {
      id: "cyber-221",
      name: "Overview of Information Security",
      courses: ["CYBER 221"],
      creditsRequired: 3,
    },
    {
      id: "cyber-262",
      name: "Cyber Defense Studio",
      courses: ["CYBER 262"],
      creditsRequired: 3,
    },
    {
      id: "programming",
      name: "Programming Requirement",
      courses: ["IST 140", "CMPSC 121", "CMPSC 131"],
      creditsRequired: 3,
    },
    {
      id: "database",
      name: "Organization of Data",
      courses: ["IST 210"],
      creditsRequired: 3,
    },
    {
      id: "statistics",
      name: "Statistics Requirement",
      courses: ["STAT 200", "SCM 200"],
      creditsRequired: 3,
    },
  ],
};
