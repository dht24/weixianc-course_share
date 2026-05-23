"use client";

import { useEffect, useState } from "react";
import { getOffering, getTeacher } from "@/lib/data";
import { getPublishedLocalResources, getPublishedLocalReviews } from "@/lib/storage";
import type { Resource, Review } from "@/lib/types";

type Props = {
  courseId: string;
};

export function LocalPublishedContent({ courseId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const courseReviews = getPublishedLocalReviews().filter((review) => {
      const offering = getOffering(review.offeringId);
      return offering?.courseId === courseId;
    });
    const courseResources = getPublishedLocalResources().filter((resource) => resource.courseId === courseId);
    setReviews(courseReviews);
    setResources(courseResources);
  }, [courseId]);

  if (!reviews.length && !resources.length) return null;

  return (
    <section className="section panel">
      <h2>本机审核通过的新内容</h2>
      {reviews.length ? (
        <div className="review-list" style={{ marginBottom: 18 }}>
          {reviews.map((review) => {
            const offering = getOffering(review.offeringId);
            const teacher = offering ? getTeacher(offering.teacherId) : undefined;
            return (
              <div className="review" key={review.id}>
                <div className="review-meta">
                  <span>{teacher?.name ?? "未知老师"}</span>
                </div>
                <p>{review.content}</p>
              </div>
            );
          })}
        </div>
      ) : null}
      {resources.length ? (
        <div className="review-list">
          {resources.map((resource) => (
            <a className="review" href={resource.url} key={resource.id} rel="noreferrer" target="_blank">
              <strong>{resource.title}</strong>
              <p>{resource.note}</p>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
