
import type { CourseSection } from "@/types/schedule";

// Fictional demonstration sections.
// NOT live Penn State course availability.

export const DEMO_SECTIONS: CourseSection[] = [
  {
    id: "demo-cyber-262-001",
    courseCode: "CYBER 262",
    title: "Cyber Defense Studio",
    section: "001",
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: ["M", "W", "F"],
        start: 540,
        end: 590,
        location: "Demo Classroom A",
      },
    ],
  },
  {
    id: "demo-cyber-262-002",
    courseCode: "CYBER 262",
    title: "Cybersecurity Course",
    section: "002",
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: ["T", "Th"],
        start: 780,
        end: 855,
        location: "Demo Classroom B",
      },
    ],
  },
  {
    id: "demo-ist-210-001",
    courseCode: "IST 210",
    title: "Organization of Data",
    section: "001",
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: ["M", "W", "F"],
        start: 570,
        end: 620,
        location: "Demo Classroom C",
      },
    ],
  },
  {
    id: "demo-ist-210-002",
    courseCode: "IST 210",
    title: "Organization of Data",
    section: "002",
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: ["T", "Th"],
        start: 600,
        end: 675,
        location: "Demo Classroom D",
      },
    ],
  },
  {
    id: "demo-stat-200-001",
    courseCode: "STAT 200",
    title: "Elementary Statistics",
    section: "001",
    campus: "Beaver",
    credits: 4,
    modality: "in_person",
    meetings: [
      {
        days: ["M", "W", "F"],
        start: 660,
        end: 710,
        location: "Demo Classroom E",
      },
    ],
  },
  {
    id: "demo-engl-202d-001",
    courseCode: "ENGL 202D",
    title: "Effective Writing: Business Writing",
    section: "001",
    campus: "Beaver",
    credits: 3,
    modality: "in_person",
    meetings: [
      {
        days: ["T", "Th"],
        start: 690,
        end: 765,
        location: "Demo Classroom F",
      },
    ],
  },
  {
    id: "demo-psych-100-001",
    courseCode: "PSYCH 100",
    title: "Introductory Psychology",
    section: "001",
    campus: "Beaver",
    credits: 3,
    modality: "web",
    meetings: [],
  },
];
