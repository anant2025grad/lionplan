
"use client";

import { FlaskConical } from "lucide-react";

import {
  DEMO_STUDENT_COURSES,
} from "@/data/demo/demo-student";

import { useAcademicStore } from "@/stores/academic-store";

export function DemoStudentLoader() {
  function loadDemo() {
    const state = useAcademicStore.getState();

    state.setReport({
      courses: DEMO_STUDENT_COURSES.map(
        (course) => ({ ...course })
      ),
      warnings: [
        "Fictional demonstration record. Not an official LionPATH report.",
        "Academic requirements and course attributes are provisional.",
      ],
      isPreMajor: false,
    });

    state.setSelectedProgramId("cybersecurity-bs");
    state.setCyberOption("operations");
  }

  return (
    <button
      type="button"
      onClick={loadDemo}
      className="inline-flex items-center gap-2 border border-border bg-surface px-4 py-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
    >
      <FlaskConical
        size={15}
        className="text-blue-accent"
      />
      Load demo student
    </button>
  );
}
