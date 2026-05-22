export type ReviewStatus = "pending" | "published" | "rejected";
export type ResourceStatus = "pending" | "published" | "rejected";

export type Course = {
  id: string;
  name: string;
  category: string;
  audience: string;
  program: string;
  aliases: string[];
  summary: string;
};

export type Teacher = {
  id: string;
  name: string;
  department: string;
  note: string;
};

export type CourseOffering = {
  id: string;
  courseId: string;
  teacherId: string;
  term: string;
  status: ReviewStatus;
};

export type Review = {
  id: string;
  offeringId: string;
  term: string;
  workload: string;
  grading: string;
  assessment: string;
  rating: number;
  content: string;
  tags: string[];
  contact: string;
  status: ReviewStatus;
  createdAt: string;
};

export type Resource = {
  id: string;
  courseId: string;
  offeringId?: string;
  title: string;
  type: string;
  url: string;
  note: string;
  status: ResourceStatus;
  createdAt: string;
};

export type SeedData = {
  courses: Course[];
  teachers: Teacher[];
  offerings: CourseOffering[];
  reviews: Review[];
  resources: Resource[];
};

export type ReviewDraft = Omit<Review, "id" | "status" | "createdAt"> & {
  courseName: string;
  teacherName: string;
};

export type ResourceDraft = Omit<Resource, "id" | "status" | "createdAt">;
