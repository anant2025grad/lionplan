
"use client";

import {
  getAvailablePrograms,
} from "@/data/programs/registry";

import { useAcademicStore } from "@/stores/academic-store";

export function ProgramSelector() {
  const programs = getAvailablePrograms();

  const selectedProgramId = useAcademicStore(
    (state) => state.selectedProgramId
  );

  const setSelectedProgramId = useAcademicStore(
    (state) => state.setSelectedProgramId
  );

  const selectedProgram = programs.find(
    (program) => program.id === selectedProgramId
  );

  return (
    <section className="border border-border bg-surface p-6">
      <p className="font-display text-[10px] uppercase tracking-widest text-muted">
        Academic program
      </p>

      <label
        htmlFor="degree-program"
        className="mt-4 block text-xs text-muted"
      >
        Degree program
      </label>

      <select
        id="degree-program"
        value={selectedProgramId}
        onChange={(event) =>
          setSelectedProgramId(event.target.value)
        }
        className="mt-2 w-full max-w-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
      >
        {programs.map((program) => (
          <option key={program.id} value={program.id}>
            {program.name} ({program.degree})
          </option>
        ))}
      </select>

      {selectedProgram && (
        <div className="mt-4 space-y-2 text-xs text-muted">
          <p>
            Campus: {selectedProgram.campus}
          </p>

          <p>
            Bulletin: {selectedProgram.bulletinYear}
          </p>

          <p>
            {selectedProgram.verified
              ? "Verified catalog data"
              : "Provisional requirement data — adviser verification required"}
          </p>
        </div>
      )}

      <p className="mt-5 text-xs leading-6 text-muted">
        Additional Penn State Beaver degree programs
        will appear here as their requirement catalogs
        are implemented and validated.
      </p>
    </section>
  );
}
