"use client";

import type { Resource, Review } from "@/lib/types";

const REVIEW_KEY = "course-share.pending-reviews";
const RESOURCE_KEY = "course-share.pending-resources";
const PUBLISHED_REVIEW_KEY = "course-share.published-reviews";
const PUBLISHED_RESOURCE_KEY = "course-share.published-resources";

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getPendingReviews(): Review[] {
  return readList<Review>(REVIEW_KEY);
}

export function savePendingReview(review: Review) {
  const reviews = getPendingReviews();
  writeList(REVIEW_KEY, [review, ...reviews]);
}

export function updatePendingReviews(reviews: Review[]) {
  writeList(REVIEW_KEY, reviews);
}

export function getPendingResources(): Resource[] {
  return readList<Resource>(RESOURCE_KEY);
}

export function savePendingResource(resource: Resource) {
  const resources = getPendingResources();
  writeList(RESOURCE_KEY, [resource, ...resources]);
}

export function updatePendingResources(resources: Resource[]) {
  writeList(RESOURCE_KEY, resources);
}

export function getPublishedLocalReviews(): Review[] {
  return readList<Review>(PUBLISHED_REVIEW_KEY);
}

export function savePublishedLocalReview(review: Review) {
  const reviews = getPublishedLocalReviews();
  writeList(PUBLISHED_REVIEW_KEY, [{ ...review, status: "published" }, ...reviews]);
}

export function getPublishedLocalResources(): Resource[] {
  return readList<Resource>(PUBLISHED_RESOURCE_KEY);
}

export function savePublishedLocalResource(resource: Resource) {
  const resources = getPublishedLocalResources();
  writeList(PUBLISHED_RESOURCE_KEY, [{ ...resource, status: "published" }, ...resources]);
}
