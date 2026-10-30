
import type {
  ProgramDefinition,
  ProgramSelection,
} from "@/types/program";

import {
  cybersecurityBS2026,
} from "@/data/programs/cybersecurity/bs-2026";

export const PROGRAM_REGISTRY: ProgramDefinition[] = [
  cybersecurityBS2026,
];

export function getProgram(
  selection: ProgramSelection
): ProgramDefinition | undefined {
  return PROGRAM_REGISTRY.find(
    (program) =>
      program.id === selection.programId &&
      program.bulletinYear ===
        selection.bulletinYear
  );
}

export function getAvailablePrograms(): ProgramDefinition[] {
  return PROGRAM_REGISTRY;
}

export function getProgramRequirements(
  program: ProgramDefinition,
  optionId?: string
): ProgramDefinition["requirements"] {
  const common = program.requirements;

  if (!program.options?.length) {
    return common;
  }

  if (!optionId) {
    return common;
  }

  const option = program.options.find(
    (item) => item.id === optionId
  );

  if (!option) {
    return common;
  }

  return [
    ...common,
    ...(program.optionRequirements?.[optionId] ?? []),
  ];
}
