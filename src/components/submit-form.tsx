"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, FileUp, Send } from "lucide-react";
import { getCourseOfferings, getTeacher } from "@/lib/course-utils";
import { savePendingResource, savePendingReview } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { Resource, Review, SeedData } from "@/lib/types";

const today = new Date().toISOString().slice(0, 10);

type Props = {
  data: SeedData;
};

export function SubmitForm({ data }: Props) {
  const searchParams = useSearchParams();
  const initialCourse = searchParams.get("course") ?? data.courses[0]?.id ?? "";
  const initialOffering = searchParams.get("offering") ?? "";
  const [courseId, setCourseId] = useState(initialCourse);
  const offerings = useMemo(() => getCourseOfferings(data, courseId), [courseId, data]);
  const [offeringId, setOfferingId] = useState(initialOffering || offerings[0]?.id || "");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [term, setTerm] = useState("2025 秋");
  const [workload, setWorkload] = useState("中");
  const [grading, setGrading] = useState("不确定");
  const [assessment, setAssessment] = useState("混合");
  const [rating, setRating] = useState(4);
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState("网盘资料");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceNote, setResourceNote] = useState("");

  useEffect(() => {
    if (!offerings.some((offering) => offering.id === offeringId)) {
      setOfferingId(offerings[0]?.id ?? "");
    }
  }, [offeringId, offerings]);

  const selectedCourse = data.courses.find((course) => course.id === courseId);
  const selectedOffering = offerings.find((offering) => offering.id === offeringId);
  const selectedTeacher = selectedOffering ? getTeacher(data, selectedOffering.teacherId) : undefined;

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse || !selectedTeacher || !selectedOffering || !content.trim()) return;
    setIsSubmitting(true);
    setError("");

    const review: Review = {
      id: `pending-review-${Date.now()}`,
      offeringId: selectedOffering.id,
      term,
      workload,
      grading,
      assessment,
      rating,
      content: content.trim(),
      tags: [],
      contact: contact.trim(),
      status: "pending",
      createdAt: today,
    };

    const supabase = createClient();
    if (supabase) {
      const { error: insertError } = await supabase.from("reviews").insert({
        id: review.id,
        offering_id: review.offeringId,
        term: review.term,
        workload: review.workload,
        grading: review.grading,
        assessment: review.assessment,
        rating: review.rating,
        content: review.content,
        tags: review.tags,
        contact: review.contact,
        status: "pending",
      });

      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }
    } else {
      savePendingReview(review);
    }

    setContent("");
    setContact("");
    setSubmitted("评价已提交，等待管理员审核。");
    setIsSubmitting(false);
  }

  async function submitResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse || !resourceTitle.trim() || !resourceUrl.trim()) return;
    setIsSubmitting(true);
    setError("");

    const resource: Resource = {
      id: `pending-resource-${Date.now()}`,
      courseId: selectedCourse.id,
      offeringId: selectedOffering?.id,
      title: resourceTitle.trim(),
      type: resourceType,
      url: resourceUrl.trim(),
      note: resourceNote.trim(),
      status: "pending",
      createdAt: today,
    };

    const supabase = createClient();
    if (supabase) {
      const { error: insertError } = await supabase.from("resources").insert({
        id: resource.id,
        course_id: resource.courseId,
        offering_id: resource.offeringId ?? null,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        note: resource.note,
        status: "pending",
      });

      if (insertError) {
        setError(insertError.message);
        setIsSubmitting(false);
        return;
      }
    } else {
      savePendingResource(resource);
    }

    setResourceTitle("");
    setResourceUrl("");
    setResourceNote("");
    setSubmitted("资料已提交，等待管理员审核。");
    setIsSubmitting(false);
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">提交入口</p>
          <h1>新增内容先进入审核队列。</h1>
          <p className="lead">同学只需要按表单提交，公开页面不会被直接修改；管理员通过后再进入课程详情页。</p>
        </div>
        <div className="metric-strip">
          <div className="metric">
            <strong>1</strong>
            <span>选择课程和老师</span>
          </div>
          <div className="metric">
            <strong>2</strong>
            <span>填写体验或资料</span>
          </div>
          <div className="metric">
            <strong>3</strong>
            <span>审核后公开</span>
          </div>
        </div>
      </section>

      {submitted ? (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="badge-row">
            <span className="badge">
              <CheckCircle2 aria-hidden="true" />
              {submitted}
            </span>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="badge-row">
            <span className="badge">{error}</span>
          </div>
        </div>
      ) : null}

      <section className="panel">
        <h2>提交课程评价</h2>
        <form className="form-grid" onSubmit={submitReview}>
          <div className="field">
            <label htmlFor="course">课程</label>
            <select className="select" id="course" onChange={(event) => setCourseId(event.target.value)} value={courseId}>
              {data.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="teacher">授课老师</label>
            <select className="select" id="teacher" onChange={(event) => setOfferingId(event.target.value)} value={offeringId}>
              {offerings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {getTeacher(data, offering.teacherId)?.name ?? "待补充"}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="term">上课学期</label>
            <input className="input" id="term" onChange={(event) => setTerm(event.target.value)} value={term} />
          </div>
          <div className="field">
            <label htmlFor="workload">工作量</label>
            <select className="select" id="workload" onChange={(event) => setWorkload(event.target.value)} value={workload}>
              {["轻", "中", "重", "不确定"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="grading">给分情况</label>
            <select className="select" id="grading" onChange={(event) => setGrading(event.target.value)} value={grading}>
              {["偏好", "正常", "偏严", "不确定"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="assessment">考核方式</label>
            <select className="select" id="assessment" onChange={(event) => setAssessment(event.target.value)} value={assessment}>
              {["考试", "论文", "展示", "作业", "混合", "不确定"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rating">推荐指数</label>
            <select className="select" id="rating" onChange={(event) => setRating(Number(event.target.value))} value={rating}>
              {[5, 4, 3, 2, 1].map((item) => (
                <option key={item} value={item}>
                  {item} 分
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="contact">联系方式（选填）</label>
            <input className="input" id="contact" onChange={(event) => setContact(event.target.value)} value={contact} />
          </div>
          <div className="field wide">
            <label htmlFor="content">课程评价</label>
            <textarea
              className="textarea"
              id="content"
              onChange={(event) => setContent(event.target.value)}
              placeholder="建议写清事实和个人感受，例如考核方式、任务量、给分体验、适合什么样的同学。"
              required
              value={content}
            />
          </div>
          <button className="button" disabled={isSubmitting} type="submit">
            <Send aria-hidden="true" />
            {isSubmitting ? "提交中..." : "提交评价"}
          </button>
        </form>
      </section>

      <section className="section panel" id="resource">
        <h2>提交课程资料</h2>
        <form className="form-grid" onSubmit={submitResource}>
          <div className="field">
            <label htmlFor="resource-title">资料名称</label>
            <input className="input" id="resource-title" onChange={(event) => setResourceTitle(event.target.value)} required value={resourceTitle} />
          </div>
          <div className="field">
            <label htmlFor="resource-type">资料类型</label>
            <select className="select" id="resource-type" onChange={(event) => setResourceType(event.target.value)} value={resourceType}>
              {["网盘资料", "往年题", "课件", "笔记", "复习整理"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="field wide">
            <label htmlFor="resource-url">资料链接</label>
            <input className="input" id="resource-url" onChange={(event) => setResourceUrl(event.target.value)} required value={resourceUrl} />
          </div>
          <div className="field wide">
            <label htmlFor="resource-note">备注</label>
            <textarea className="textarea" id="resource-note" onChange={(event) => setResourceNote(event.target.value)} value={resourceNote} />
          </div>
          <button className="button" disabled={isSubmitting} type="submit">
            <FileUp aria-hidden="true" />
            {isSubmitting ? "提交中..." : "提交资料"}
          </button>
        </form>
      </section>
    </div>
  );
}
