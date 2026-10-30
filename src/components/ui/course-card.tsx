
import { BookOpen } from "lucide-react";

import { StatusBadge, type Status } from "./status-badge";

interface CourseCardProps {
  code: string;
  title: string;
  credits: number;
  requirement?: string;
  status?: Status;
}

export function CourseCard({
  code,
  title,
  credits,
  requirement,
  status,
}: CourseCardProps) {
  return (
    <article className="border border-border bg-surface p-5 transition-colors duration-200 hover:bg-surface-muted">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-blue-accent">
            <BookOpen size={18} strokeWidth={1.5} />
          </div>

          <div>
            <p className="font-display text-xs text-blue-accent">
              {code}
            </p>

            <h3 className="mt-1 text-sm font-medium">
              {title}
            </h3>

            {requirement && (
              <p className="mt-2 text-xs text-muted">
                {requirement}
              </p>
            )}
          </div>
        </div>

        <span className="shrink-0 font-display text-xs text-muted">
          {credits} CR
        </span>
      </div>

      {status && (
        <div className="mt-5 border-t border-border pt-4">
          <StatusBadge status={status} />
        </div>
      )}
    </article>
  );
}
