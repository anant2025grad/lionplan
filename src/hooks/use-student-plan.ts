
"use client";

import { useMemo } from "react";

import {
  useAcademicStore,
} from "@/stores/academic-store";

import {
  DEMO_SECTIONS,
} from "@/data/scheduling/demo-sections";

import {
  buildStudentPlan,
} from "@/lib/academic/build-student-plan";

export function useStudentPlan() {
  const courses = useAcademicStore(
    (state) => state.courses
  );

  const reportLoaded = useAcademicStore(
    (state) => state.reportLoaded
  );

  const selectedProgramId = useAcademicStore(
    (state) => state.selectedProgramId
  );

  const cyberOption = useAcademicStore(
    (state) => state.cyberOption
  );

  const plan = useMemo(
    () =>
      buildStudentPlan({
        programId: selectedProgramId,
        optionId: cyberOption,
        courses,
        sections: DEMO_SECTIONS,
      }),
    [selectedProgramId, cyberOption, courses]
  );

  return {
    ...plan,
    courses,
    reportLoaded,
    selectedProgramId,
    cyberOption,
  };
}
