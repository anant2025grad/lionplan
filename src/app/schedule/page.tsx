
"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
    useStudentPlan,
} from "@/hooks/use-student-plan";

import {
    BookOpen,
    CalendarDays,
    Clock3,
    GraduationCap,
    Search,
    Trash2,
} from "lucide-react";

import { useAcademicStore } from "@/stores/academic-store";

import type {
    CourseSection,
} from "@/types/schedule";

import {
    DEMO_SECTIONS,
} from "@/data/scheduling/demo-sections";


import {
    canAddSection,
    formatMinutes,
    summarizeSchedule,
} from "@/lib/scheduling/schedule-engine";

import {
    evaluatePrerequisites,
} from "@/lib/academic/evaluate-prerequisites";

import {
    WeeklyCalendar,
} from "@/components/scheduling/weekly-calendar";

import {
    PreferredScheduleBuilder,
} from "@/components/scheduling/preferred-schedule-builder";

import {
    RecommendationInsights,
} from "@/components/scheduling/recommendation-insights";

import {
    PageHeader,
} from "@/components/ui/page-header";

import {
    MetricCard,
} from "@/components/ui/metric-card";

import {
    Button,
} from "@/components/ui/button";

function formatMeetingTimes(
    section: CourseSection
): string {
    if (section.meetings.length === 0) {
        return section.modality === "web"
            ? "Web / asynchronous"
            : "Arranged / no fixed meeting time";
    }

    return section.meetings
        .map((meeting) => {
            const days = meeting.days.join("");

            return `${days} ${formatMinutes(
                meeting.start
            )}–${formatMinutes(meeting.end)}`;
        })
        .join(" · ");
}

interface CourseGroupProps {
    courseCode: string;
    sections: CourseSection[];
    selectedIds: string[];
    onToggle: (section: CourseSection) => void;
    recommended: boolean;
    history: ReturnType<
        typeof useAcademicStore.getState
    >["courses"];
}

function CourseGroup({
    courseCode,
    sections,
    selectedIds,
    onToggle,
    recommended,
    history,
}: CourseGroupProps) {
    const firstSection = sections[0];

    const eligibility = evaluatePrerequisites(
        courseCode,
        history
    );

    return (
        <article className="border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                    <p className="font-display text-xs font-bold uppercase tracking-wider text-blue-accent">
                        {courseCode}
                    </p>

                    <h3 className="mt-2 text-sm font-semibold">
                        {firstSection.title}
                    </h3>

                    <p className="mt-1 text-xs text-muted">
                        {firstSection.credits} credits
                        {" · "}
                        {sections.length}{" "}
                        {sections.length === 1
                            ? "section"
                            : "sections"}
                    </p>
                </div>

                {recommended && (
                    <span className="border border-border bg-blue-soft px-3 py-2 text-[10px] uppercase tracking-wide text-blue-accent">
                        Recommended
                    </span>
                )}
            </div>

            <div className="space-y-3 p-4">
                {sections.map((section) => {
                    const selected = selectedIds.includes(
                        section.id
                    );

                    return (
                        <div
                            key={section.id}
                            className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background p-4"
                        >
                            <div>
                                <p className="font-display text-xs font-semibold">
                                    Section {section.section}
                                </p>

                                <p className="mt-2 text-xs text-muted">
                                    {formatMeetingTimes(section)}
                                </p>

                                <p className="mt-1 text-xs text-muted">
                                    {section.campus}
                                    {section.instructor
                                        ? ` · ${section.instructor}`
                                        : ""}
                                </p>
                            </div>

                            <Button
                                variant={
                                    selected ? "secondary" : "primary"
                                }
                                size="sm"
                                onClick={() => onToggle(section)}
                            >
                                {selected ? "Remove" : "Add section"}
                            </Button>
                        </div>
                    );
                })}

                {eligibility.status !== "eligible" && (
                    <p className="text-xs leading-5 text-muted">
                        {eligibility.status === "unknown"
                            ? "Prerequisites have not been verified."
                            : `Configured prerequisite rule not met: ${eligibility.explanation}`}
                    </p>
                )}
            </div>
        </article>
    );
}

export default function SchedulePage() {

    const {
        courses,
        reportLoaded,
        recommendations,
    } = useStudentPlan();

    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);

    const [search, setSearch] = useState("");

    const [showAll, setShowAll] = useState(false);

    const [warning, setWarning] =
        useState<string | null>(null);

    const selected = useMemo(
        () =>
            DEMO_SECTIONS.filter((section) =>
                selectedIds.includes(section.id)
            ),
        [selectedIds]
    );

    const summary = useMemo(
        () => summarizeSchedule(selected),
        [selected]
    );


    const recommendedCodes = useMemo(
        () =>
            new Set(
                recommendations.map(
                    (item) => item.courseCode
                )
            ),
        [recommendations]
    );

    const groupedSections = useMemo(() => {
        const filtered = DEMO_SECTIONS.filter(
            (section) => {
                const matchesSearch =
                    `${section.courseCode} ${section.title}`
                        .toLowerCase()
                        .includes(search.toLowerCase());

                const matchesMode =
                    showAll ||
                    !reportLoaded ||
                    recommendedCodes.has(
                        section.courseCode
                    );

                return matchesSearch && matchesMode;
            }
        );

        const groups = new Map<
            string,
            CourseSection[]
        >();

        for (const section of filtered) {
            const group =
                groups.get(section.courseCode) ?? [];

            group.push(section);
            groups.set(section.courseCode, group);
        }

        return [...groups.entries()].map(
            ([courseCode, sections]) => ({
                courseCode,
                sections,
            })
        );
    }, [
        search,
        showAll,
        reportLoaded,
        recommendedCodes,
    ]);

    function toggleSection(
        section: CourseSection
    ) {
        setWarning(null);

        if (selectedIds.includes(section.id)) {
            setSelectedIds((current) =>
                current.filter(
                    (id) => id !== section.id
                )
            );
            return;
        }

        const result = canAddSection(
            selected,
            section
        );

        if (!result.allowed) {
            setWarning(
                "This section conflicts with your current schedule. Remove the conflicting section before adding it."
            );
            return;
        }

        setSelectedIds((current) => [
            ...current,
            section.id,
        ]);
    }

    function removeSection(id: string) {
        setSelectedIds((current) =>
            current.filter((item) => item !== id)
        );

        setWarning(null);
    }

    function useGeneratedSchedule(
        sections: CourseSection[]
    ) {
        setSelectedIds(
            sections.map((section) => section.id)
        );

        setWarning(null);
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Semester planning"
                title="Schedule Builder"
                description="Explore course sections, understand recommendations, and build a conflict-free weekly schedule."
            />

            {!reportLoaded && (
                <section className="border border-border bg-surface p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="font-display text-sm uppercase tracking-wider">
                                Import your academic record
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-muted">
                                Import a LionPATH report or load the
                                fictional demo student to enable
                                degree-based recommendations.
                            </p>
                        </div>

                        <Link
                            href="/planner"
                            className="bg-psu-blue px-4 py-3 text-xs font-semibold text-white"
                        >
                            Go to Degree Planner
                        </Link>
                    </div>
                </section>
            )}


            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Selected credits"
                    value={summary.credits}
                    description="Total credits in your current schedule"
                    icon={<GraduationCap size={18} />}
                />

                <MetricCard
                    label="Selected courses"
                    value={summary.courseCount}
                    description="Distinct course codes selected"
                    icon={<BookOpen size={18} />}
                />

                <MetricCard
                    label="Conflicts"
                    value={summary.conflicts.length}
                    description="Detected overlapping meetings or duplicate courses"
                    icon={<Clock3 size={18} />}
                />

                <MetricCard
                    label="Recommended courses"
                    value={
                        new Set(
                            recommendations.map((item) => item.courseCode)
                        ).size
                    }
                    description="Courses matching unmet provisional requirements"
                    icon={<CalendarDays size={18} />}
                />
            </div>


            {reportLoaded && (
                <div className="space-y-8">
                    <RecommendationInsights
                        recommendations={recommendations}
                        history={courses}
                    />

                    <PreferredScheduleBuilder
                        catalogSections={DEMO_SECTIONS}
                        recommendations={recommendations}
                        history={courses}
                        onUseSchedule={useGeneratedSchedule}
                    />
                </div>
            )}

            <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display text-sm uppercase tracking-wider">
                            Course section catalog
                        </h2>

                        <p className="mt-2 text-xs text-muted">
                            Fictional section data for demonstration.
                            Not live LionPATH enrollment information.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={!showAll ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setShowAll(false)}
                        >
                            Recommended
                        </Button>

                        <Button
                            variant={showAll ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setShowAll(true)}
                        >
                            All sections
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3 border border-border bg-surface px-4 py-3">
                    <Search
                        size={16}
                        className="text-muted"
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search by course code or title"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                    />
                </div>

                {warning && (
                    <div
                        role="alert"
                        className="border border-border bg-surface-muted p-4 text-sm"
                    >
                        {warning}
                    </div>
                )}

                {groupedSections.length === 0 ? (
                    <div className="border border-border bg-surface p-6">
                        <p className="text-sm text-muted">
                            No sections match the current filters.
                            Try viewing all sections or changing
                            your search.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {groupedSections.map(
                            ({ courseCode, sections }) => (
                                <CourseGroup
                                    key={courseCode}
                                    courseCode={courseCode}
                                    sections={sections}
                                    selectedIds={selectedIds}
                                    onToggle={toggleSection}
                                    recommended={recommendedCodes.has(
                                        courseCode
                                    )}
                                    history={courses}
                                />
                            )
                        )}
                    </div>
                )}
            </section>

            <section className="border border-border bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <h2 className="font-display text-xs uppercase tracking-wider">
                        Selected sections
                    </h2>

                    {selected.length > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setSelectedIds([]);
                                setWarning(null);
                            }}
                        >
                            <Trash2 size={14} />
                            Clear schedule
                        </Button>
                    )}
                </div>

                {selected.length === 0 ? (
                    <div className="p-6">
                        <p className="text-sm text-muted">
                            No sections selected yet. Add classes
                            manually or generate a personalized
                            schedule.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {selected.map((section) => (
                            <div
                                key={section.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                            >
                                <div>
                                    <p className="font-display text-xs font-semibold">
                                        {section.courseCode}
                                        {" · "}
                                        Section {section.section}
                                    </p>

                                    <p className="mt-2 text-xs text-muted">
                                        {formatMeetingTimes(section)}
                                    </p>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        removeSection(section.id)
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <WeeklyCalendar sections={selected} />

            <p className="text-xs leading-5 text-muted">
                LionPlan is an independent academic planning
                prototype. Degree requirements, prerequisites,
                course sections, and registration eligibility
                must be verified using official Penn State
                resources and academic advising.
            </p>
        </div>
    );
}
