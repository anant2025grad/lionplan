
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
}

export function MetricCard({
  label,
  value,
  description,
  icon,
}: MetricCardProps) {
  return (
    <div className="border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-[10px] uppercase tracking-widest text-muted">
          {label}
        </p>

        {icon && (
          <div className="text-blue-accent">
            {icon}
          </div>
        )}
      </div>

      <p className="mt-8 font-display text-4xl tracking-tight">
        {value}
      </p>

      {description && (
        <p className="mt-3 text-xs leading-5 text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
