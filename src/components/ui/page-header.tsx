
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-border pb-9 md:flex-row md:items-end">
      <div>
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-blue-accent">
          {eyebrow}
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] md:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
