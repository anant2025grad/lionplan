
import {
  Check,
  Clock3,
  AlertCircle,
  Circle,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type Status =
  | "completed"
  | "in_progress"
  | "missing"
  | "attention";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  completed: {
    label: "Completed",
    icon: Check,
  },
  in_progress: {
    label: "In progress",
    icon: Clock3,
  },
  missing: {
    label: "Missing",
    icon: Circle,
  },
  attention: {
    label: "Needs review",
    icon: AlertCircle,
  },
};

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2",
        "border border-border bg-surface-muted",
        "px-3 py-1.5 font-display",
        "text-[10px] uppercase tracking-wider",
        "text-foreground",
        className
      )}
    >
      <Icon size={12} strokeWidth={1.8} />
      {config.label}
    </span>
  );
}
