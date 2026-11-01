"use client";
import { create } from "zustand";
import type { StudentCourse } from "@/types/academic";
import type { CyberOption } from "@/data/programs/cyber-requirements";
interface AcademicState {
  courses: StudentCourse[];
  reportLoaded: boolean;
  recordConfirmed: boolean;
  isPreMajor: boolean;
  warnings: string[];
  setReport: (courses: StudentCourse[], isPreMajor: boolean, warnings: string[]) => void;
  confirmReport: () => void;
  selectedProgramId: string;
  setSelectedProgramId: (id: string) => void;
  cyberOption: CyberOption;
  setCyberOption: (option: CyberOption) => void;
  clearReport: () => void;
}
export const useAcademicStore = create<AcademicState>((set) => ({
  courses: [], reportLoaded: false, recordConfirmed: false, isPreMajor: false, warnings: [],
  selectedProgramId: "cybersecurity-bs", cyberOption: "operations",
  setSelectedProgramId: (selectedProgramId) => set({ selectedProgramId }),
  setCyberOption: (cyberOption) => set({ cyberOption }),
  setReport: (courses, isPreMajor, warnings) => {
    if (!Array.isArray(courses)) throw new Error("Invalid report: courses must be an array.");
    set({ courses, isPreMajor, warnings, reportLoaded: true, recordConfirmed: false });
  },
  confirmReport: () => set({ recordConfirmed: true }),
  clearReport: () => set({ courses: [], reportLoaded: false, recordConfirmed: false, isPreMajor: false, warnings: [] }),
}));
