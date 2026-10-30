
import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="font-display text-[10px] uppercase tracking-widest text-muted">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-xl font-medium tracking-tight">
          {title}
        </h2>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
