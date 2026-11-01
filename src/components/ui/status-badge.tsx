import { AcademicStatusBadge } from "./academic-status";
import type { AcademicStatus } from "./academic-status";
export type Status = Extract<AcademicStatus, "completed" | "in_progress" | "missing" | "attention">;
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return <AcademicStatusBadge status={status} className={className} />;
}
