import { cn } from "@/lib/utils";

export type AcademicStatus = "completed" | "in_progress" | "no_credit" | "low_grade" | "missing" | "attention";

const styles: Record<AcademicStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "status-completed" },
  in_progress: { label: "In progress", className: "status-in-progress" },
  no_credit: { label: "No credit", className: "status-no-credit" },
  low_grade: { label: "Grade review", className: "status-no-credit" },
  missing: { label: "No credit", className: "status-no-credit" },
  attention: { label: "Needs review", className: "status-in-progress" },
};

export function AcademicStatusBadge({ status, className }: { status: AcademicStatus; className?: string }) {
  const config = styles[status];
  return <span className={cn("academic-status inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", config.className, className)}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{config.label}</span>;
}
