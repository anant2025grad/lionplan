
import { GraduationCap } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function PlannerPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Academic Planning / 01"
        title="Degree planner."
        description="Explore degree requirements, review completed coursework, and build a schedule aligned with your academic goals."
      />

      <EmptyState
        title="Your academic plan starts here"
        description="The next step is connecting our What-If report parser to the academic engine so LionPlan can evaluate real course histories."
        action={
          <div className="flex items-center gap-2 text-xs text-blue-accent">
            <GraduationCap size={16} />
            PDF import coming next
          </div>
        }
      />
    </div>
  );
}
