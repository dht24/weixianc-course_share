"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, Trash2 } from "lucide-react";
import { getCourse, getOffering, getTeacher } from "@/lib/data";
import {
  getPendingResources,
  getPendingReviews,
  savePublishedLocalResource,
  savePublishedLocalReview,
  updatePendingResources,
  updatePendingReviews,
} from "@/lib/storage";
import type { Resource, Review } from "@/lib/types";

export function AdminQueue() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    setReviews(getPendingReviews());
    setResources(getPendingResources());
  }, []);

  function rejectReview(id: string) {
    const next = reviews.filter((review) => review.id !== id);
    setReviews(next);
    updatePendingReviews(next);
  }

  function approveReview(id: string) {
    const approved = reviews.find((review) => review.id === id);
    if (approved) savePublishedLocalReview(approved);
    const next = reviews.filter((review) => review.id !== id);
    setReviews(next);
    updatePendingReviews(next);
  }

  function rejectResource(id: string) {
    const next = resources.filter((resource) => resource.id !== id);
    setResources(next);
    updatePendingResources(next);
  }

  function approveResource(id: string) {
    const approved = resources.find((resource) => resource.id === id);
    if (approved) savePublishedLocalResource(approved);
    const next = resources.filter((resource) => resource.id !== id);
    setResources(next);
    updatePendingResources(next);
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">管理员审核</p>
          <h1>公开内容先过一遍质量关。</h1>
          <p className="lead">
            这里展示浏览器本地待审核队列；按钮会更新数据库里的审核状态。
          </p>
        </div>
        <div className="metric-strip">
          <div className="metric">
            <strong>{reviews.length}</strong>
            <span>待审评价</span>
          </div>
          <div className="metric">
            <strong>{resources.length}</strong>
            <span>待审资料</span>
          </div>
          <div className="metric">
            <strong>0</strong>
            <span>今日驳回</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>待审核评价</h2>
        <div className="admin-list">
          {reviews.map((review) => {
            const offering = getOffering(review.offeringId);
            const course = offering ? getCourse(offering.courseId) : undefined;
            const teacher = offering ? getTeacher(offering.teacherId) : undefined;
            return (
              <article className="admin-item" key={review.id}>
                <div className="badge-row">
                  <span className="badge">{course?.name ?? "未知课程"}</span>
                  <span className="badge">{teacher?.name ?? "未知老师"}</span>
                  <span className="badge">{review.term}</span>
                  <span className="badge">{review.rating}/5</span>
                </div>
                <p style={{ lineHeight: 1.8, marginTop: 12, whiteSpace: "pre-wrap" }}>{review.content}</p>
                <div className="admin-actions">
                  <button className="button" onClick={() => approveReview(review.id)} type="button">
                    <Check aria-hidden="true" />
                    通过
                  </button>
                  <button className="button danger" onClick={() => rejectReview(review.id)} type="button">
                    <Trash2 aria-hidden="true" />
                    驳回
                  </button>
                </div>
              </article>
            );
          })}
          {!reviews.length ? <div className="empty">暂无待审核评价。</div> : null}
        </div>
      </section>

      <section className="section panel">
        <h2>待审核资料</h2>
        <div className="admin-list">
          {resources.map((resource) => {
            const course = getCourse(resource.courseId);
            return (
              <article className="admin-item" key={resource.id}>
                <div className="badge-row">
                  <span className="badge">{course?.name ?? "未知课程"}</span>
                  <span className="badge">{resource.type}</span>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.url}</p>
                <p>{resource.note}</p>
                <div className="admin-actions">
                  <button className="button" onClick={() => approveResource(resource.id)} type="button">
                    <ShieldCheck aria-hidden="true" />
                    通过
                  </button>
                  <button className="button danger" onClick={() => rejectResource(resource.id)} type="button">
                    <Trash2 aria-hidden="true" />
                    驳回
                  </button>
                </div>
              </article>
            );
          })}
          {!resources.length ? <div className="empty">暂无待审核资料。</div> : null}
        </div>
      </section>
    </div>
  );
}
