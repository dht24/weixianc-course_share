import { data as fallbackData } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Course, CourseOffering, Resource, Review, SeedData, Teacher } from "@/lib/types";

type DbCourse = Omit<Course, "aliases"> & { aliases: string[] | null };
type DbTeacher = Teacher;
type DbOffering = {
  id: string;
  course_id: string;
  teacher_id: string;
  term: string;
  status: "pending" | "published" | "rejected";
};
type DbReview = {
  id: string;
  offering_id: string;
  term: string;
  workload: string;
  grading: string;
  assessment: string;
  rating: number;
  content: string;
  tags: string[] | null;
  contact: string;
  status: "pending" | "published" | "rejected";
  created_at: string;
};
type DbResource = {
  id: string;
  course_id: string;
  offering_id: string | null;
  title: string;
  type: string;
  url: string;
  note: string;
  status: "pending" | "published" | "rejected";
  created_at: string;
};

function mapOffering(offering: DbOffering): CourseOffering {
  return {
    id: offering.id,
    courseId: offering.course_id,
    teacherId: offering.teacher_id,
    term: offering.term,
    status: offering.status,
  };
}

function mapReview(review: DbReview): Review {
  return {
    id: review.id,
    offeringId: review.offering_id,
    term: review.term,
    workload: review.workload,
    grading: review.grading,
    assessment: review.assessment,
    rating: review.rating,
    content: review.content,
    tags: review.tags ?? [],
    contact: review.contact,
    status: review.status,
    createdAt: review.created_at.slice(0, 10),
  };
}

function mapResource(resource: DbResource): Resource {
  return {
    id: resource.id,
    courseId: resource.course_id,
    offeringId: resource.offering_id ?? undefined,
    title: resource.title,
    type: resource.type,
    url: resource.url,
    note: resource.note,
    status: resource.status,
    createdAt: resource.created_at.slice(0, 10),
  };
}

async function getSupabaseData(): Promise<SeedData | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const [coursesResult, teachersResult, offeringsResult, reviewsResult, resourcesResult] = await Promise.all([
    supabase.from("courses").select("id, name, category, audience, program, aliases, summary").order("name"),
    supabase.from("teachers").select("id, name, department, note").order("name"),
    supabase.from("course_offerings").select("id, course_id, teacher_id, term, status").eq("status", "published"),
    supabase.from("reviews").select("id, offering_id, term, workload, grading, assessment, rating, content, tags, contact, status, created_at").eq("status", "published"),
    supabase.from("resources").select("id, course_id, offering_id, title, type, url, note, status, created_at").eq("status", "published"),
  ]);

  if (coursesResult.error || teachersResult.error || offeringsResult.error || reviewsResult.error || resourcesResult.error) {
    return null;
  }

  return {
    courses: ((coursesResult.data ?? []) as DbCourse[]).map((course) => ({ ...course, aliases: course.aliases ?? [] })),
    teachers: (teachersResult.data ?? []) as DbTeacher[],
    offerings: ((offeringsResult.data ?? []) as DbOffering[]).map(mapOffering),
    reviews: ((reviewsResult.data ?? []) as DbReview[]).map(mapReview),
    resources: ((resourcesResult.data ?? []) as DbResource[]).map(mapResource),
  };
}

export async function getAppData(): Promise<SeedData> {
  return (await getSupabaseData()) ?? fallbackData;
}
