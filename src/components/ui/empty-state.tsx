
import type { ReactNode } from "react";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-border text-muted">
        <FileQuestion size={24} strokeWidth={1.3} />
      </div>

      <h3 className="mt-6 text-lg font-medium">
        {title}
      </h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>

      {action && (
        <div className="mt-7">
          {action}
        </div>
      )}
    </div>
  );
}
