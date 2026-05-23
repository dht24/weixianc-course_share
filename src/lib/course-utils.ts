import type { Course, CourseOffering, Resource, Review, SeedData, Teacher } from "@/lib/types";

export function getTeacher(data: SeedData, teacherId: string): Teacher | undefined {
  return data.teachers.find((teacher) => teacher.id === teacherId);
}

export function getCourse(data: SeedData, courseId: string): Course | undefined {
  return data.courses.find((course) => course.id === courseId);
}

export function getOffering(data: SeedData, offeringId: string): CourseOffering | undefined {
  return data.offerings.find((offering) => offering.id === offeringId);
}

export function getCourseOfferings(data: SeedData, courseId: string): CourseOffering[] {
  return data.offerings.filter((offering) => offering.courseId === courseId);
}

export function getPublishedReviews(data: SeedData, offeringId: string): Review[] {
  return data.reviews.filter((review) => review.offeringId === offeringId && review.status === "published");
}

export function getPublishedResources(data: SeedData, courseId: string): Resource[] {
  return data.resources.filter((resource) => resource.courseId === courseId && resource.status === "published");
}

export function getCourseStats(data: SeedData, courseId: string) {
  const offerings = getCourseOfferings(data, courseId);
  const reviews = offerings.flatMap((offering) => getPublishedReviews(data, offering.id));

  return {
    teacherCount: offerings.length,
    reviewCount: reviews.length,
  };
}

export function searchCourses(data: SeedData, query: string) {
  const needle = query.trim().toLowerCase();
  return data.courses.filter((course) => {
    const offerings = getCourseOfferings(data, course.id);
    const teachers = offerings.map((offering) => getTeacher(data, offering.teacherId)?.name ?? "");
    const haystack = [course.name, course.category, course.audience, course.program, ...course.aliases, ...teachers]
      .join(" ")
      .toLowerCase();
    return !needle || haystack.includes(needle);
  });
}
