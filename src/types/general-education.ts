
export type GenEdAttribute =
  | "GQ"
  | "GWS"
  | "GA"
  | "GH"
  | "GS"
  | "GN"
  | "GHW"
  | "ID";

export type CultureAttribute = "US" | "IL";

export interface CourseAttributes {
  genEd: GenEdAttribute[];
  cultures: CultureAttribute[];
}

export interface CreditBucket {
  id: GenEdAttribute;
  name: string;
  required: number;
}

export interface GenEdAllocation {
  code: string;
  bucket: GenEdAttribute;
  credits: number;
  status: "completed" | "in_progress";
}

export interface BucketResult extends CreditBucket {
  completed: number;
  inProgress: number;
  remaining: number;
}

export interface GeneralEducationResult {
  buckets: BucketResult[];
  allocations: GenEdAllocation[];
  unknownCourses: string[];
  cultures: Record<
    CultureAttribute,
    {
      completed: string[];
      inProgress: string[];
    }
  >;
}
