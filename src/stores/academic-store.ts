
"use client";

import { create } from "zustand";

import type { StudentCourse } from "@/types/academic";

import type { CyberOption } from "@/data/programs/cyber-requirements";


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

    selectedProgramId: string;
    setSelectedProgramId: (id: string) => void;

    cyberOption: CyberOption;
    setCyberOption: (option: CyberOption) => void;


    clearReport: () => void;
}

export const useAcademicStore =
    create<AcademicState>((set) => ({
        courses: [],
        reportLoaded: false,
        isPreMajor: false,
        warnings: [],

        selectedProgramId: "cybersecurity-bs",

        setSelectedProgramId: (id) =>
            set({ selectedProgramId: id }),

        cyberOption: "operations",
        setCyberOption: (option) =>
            set({ cyberOption: option }),


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
