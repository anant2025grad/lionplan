"use client";
import { DEMO_STUDENT_COURSES } from "@/data/demo/demo-student";
import { useAcademicStore } from "@/stores/academic-store";
export function DemoStudentLoader() {
  function loadDemo() {
    const state = useAcademicStore.getState();
    state.setSelectedProgramId("cybersecurity-bs");
    state.setCyberOption("operations");
    state.setReport(
      DEMO_STUDENT_COURSES.map((course) => ({ ...course })),
      false,
      ["Fictional demo student. Not an official LionPATH report."]
    );
  }
  return <button type="button" onClick={loadDemo} className="text-sm text-muted underline underline-offset-4 hover:text-foreground">Try with demo data</button>;
}
