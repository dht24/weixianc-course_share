import { seedData } from "@/data/seed-data";
import type { Course, CourseOffering, Resource, Review, SeedData, Teacher } from "@/lib/types";

export const data: SeedData = seedData;

export function getTeacher(teacherId: string): Teacher | undefined {
  return data.teachers.find((teacher) => teacher.id === teacherId);
}

export function getCourse(courseId: string): Course | undefined {
  return data.courses.find((course) => course.id === courseId);
}

export function getOffering(offeringId: string): CourseOffering | undefined {
  return data.offerings.find((offering) => offering.id === offeringId);
}

export function getCourseOfferings(courseId: string): CourseOffering[] {
  return data.offerings.filter((offering) => offering.courseId === courseId);
}

export function getPublishedReviews(offeringId: string): Review[] {
  return data.reviews.filter((review) => review.offeringId === offeringId && review.status === "published");
}

export function getPublishedResources(courseId: string): Resource[] {
  return data.resources.filter((resource) => resource.courseId === courseId && resource.status === "published");
}

export function getCourseStats(courseId: string) {
  const offerings = getCourseOfferings(courseId);
  const reviews = offerings.flatMap((offering) => getPublishedReviews(offering.id));
  const ratings = reviews.map((review) => review.rating).filter(Boolean);
  const averageRating = ratings.length
    ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    : 0;

  return {
    teacherCount: offerings.length,
    reviewCount: reviews.length,
    averageRating,
  };
}

export function searchCourses(query: string, audience: string, category: string) {
  const needle = query.trim().toLowerCase();
  return data.courses.filter((course) => {
    const offerings = getCourseOfferings(course.id);
    const teachers = offerings.map((offering) => getTeacher(offering.teacherId)?.name ?? "");
    const haystack = [course.name, course.category, course.audience, course.program, ...course.aliases, ...teachers]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !needle || haystack.includes(needle);
    const matchesAudience = audience === "全部" || course.audience.includes(audience);
    const matchesCategory = category === "全部" || course.category === category;
    return matchesQuery && matchesAudience && matchesCategory;
  });
}
