
"use client";

import { create } from "zustand";

import type { StudentCourse } from "@/types/academic";

interface AcademicState {
  courses: StudentCourse[];
  reportLoaded: boolean;
  isPreMajor: boolean;
  warnings: string[];

  setReport: (
    courses: StudentCourse[],
    isPreMajor: boolean,
    warnings: string[]
  ) => void;

  clearReport: () => void;
}

export const useAcademicStore =
  create<AcademicState>((set) => ({
    courses: [],
    reportLoaded: false,
    isPreMajor: false,
    warnings: [],

    setReport: (courses, isPreMajor, warnings) =>
      set({
        courses,
        reportLoaded: true,
        isPreMajor,
        warnings,
      }),

    clearReport: () =>
      set({
        courses: [],
        reportLoaded: false,
        isPreMajor: false,
        warnings: [],
      }),
  }));
