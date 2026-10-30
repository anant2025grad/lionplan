
import type {
  CourseStatus,
  StudentCourse,
} from "@/types/academic";

export interface ParseResult {
  courses: StudentCourse[];
  isPreMajor: boolean;
  warnings: string[];
}

const COURSE_PATTERN =
  /\b([A-Z][A-Z-]{1,5})\s+(\d{1,3}[A-Z]{0,2}|X[A-Z]{3,6})\s+(.{1,70}?)\s+(\d\.\d\d)\s+(FA|SP|SU)\s+(\d{4})\s+(?:([A-DFPW][+-]?|SA|LD|TR|NR|AU)\s+)?(EN|TE|TR|IP|TC)\b/g;

function getCourseStatus(
  grade: string,
  source: string
): CourseStatus {
  if (source === "IP") {
    return "in_progress";
  }

  if (/^(A|B|C)[+-]?$|^(SA|P|TR)$/.test(grade)) {
    return "completed";
  }

  if (/^D[+-]?$/.test(grade)) {
    return "low_grade";
  }

  return "no_credit";
}

export function parseWhatIfReport(
  rawText: string
): ParseResult {
  const warnings: string[] = [];

  const isPreMajor = /Pre-Major Audit/i.test(rawText);

  const historyIndex = rawText.indexOf("Course History");

  if (historyIndex === -1) {
    return {
      courses: [],
      isPreMajor,
      warnings: [
        "The Course History section was not found.",
      ],
    };
  }

  const historyText = rawText
    .slice(historyIndex)
    .replace(/\s+/g, " ");

  const courses: StudentCourse[] = [];

  // Create a fresh RegExp so repeated calls do not
  // retain the previous match position.
  const pattern = new RegExp(
    COURSE_PATTERN.source,
    COURSE_PATTERN.flags
  );

  let match: RegExpExecArray | null;

  while ((match = pattern.exec(historyText))) {
    const [
      ,
      subject,
      number,
      title,
      credits,
      termCode,
      year,
      grade = "",
      source,
    ] = match;

    courses.push({
      code: `${subject} ${number}`,
      title: title.trim(),
      credits: Number.parseFloat(credits),
      term: `${termCode} ${year}`,
      grade,
      status: getCourseStatus(grade, source),
      source: source as StudentCourse["source"],
    });
  }

  if (courses.length === 0) {
    warnings.push(
      "No courses matched the expected LionPATH format."
    );
  }

  const unrecognized = courses.filter(
    (course) => course.status === "no_credit"
  );

  if (unrecognized.length > 0) {
    warnings.push(
      `${unrecognized.length} course record(s) received no credit under the prototype's grade rules. Review these entries.`
    );
  }

  return {
    courses,
    isPreMajor,
    warnings,
  };
}
