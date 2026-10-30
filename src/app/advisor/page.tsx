
import {
  ArrowRight,
  ClipboardList,
  FileText,
  ShieldAlert,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdvisorPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Advisor Workspace / 01"
        title="Advising, simplified."
        description="Review academic progress, identify potential graduation risks, and collaborate with students on informed course selections."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Student Sessions"
          value="—"
          description="No student report loaded"
          icon={<FileText size={20} />}
        />

        <MetricCard
          label="Requirements Reviewed"
          value="—"
          description="Awaiting academic evaluation"
          icon={<ClipboardList size={20} />}
        />

        <MetricCard
          label="Potential Risks"
          value="—"
          description="Not yet evaluated"
          icon={<ShieldAlert size={20} />}
        />
      </div>

      <EmptyState
        title="No active advising session"
        description="Import a student's What-If report to begin reviewing degree requirements, course recommendations, and potential scheduling concerns."
      />

      <div className="flex items-center gap-2 border-t border-border pt-6 text-xs text-muted">
        <span>
          Future capability: collaborative academic planning
        </span>
        <ArrowRight size={14} />
      </div>
    </div>
  );
}
