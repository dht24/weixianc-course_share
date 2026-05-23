import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, MessageSquarePlus } from "lucide-react";
import {
  getCourse,
  getCourseOfferings,
  getCourseStats,
  getPublishedResources,
  getPublishedReviews,
  getTeacher,
} from "@/lib/course-utils";
import { getAppData } from "@/lib/supabase/queries";
import { LocalPublishedContent } from "@/components/local-published-content";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const data = await getAppData();
  const course = getCourse(data, decodeURIComponent(courseId));
  if (!course) notFound();

  const offerings = getCourseOfferings(data, course.id);
  const resources = getPublishedResources(data, course.id);
  const stats = getCourseStats(data, course.id);

  return (
    <div className="page">
      <Link className="button secondary" href="/" style={{ marginBottom: 22 }}>
        <ArrowLeft aria-hidden="true" />
        返回课程库
      </Link>

      <section className="panel">
        <p className="eyebrow">{course.program}</p>
        <h1>{course.name}</h1>
        {course.summary ? <p className="lead">{course.summary}</p> : null}
        <div className="badge-row">
          <span className="badge">{stats.teacherCount} 位老师</span>
          <span className="badge">{stats.reviewCount} 条评价</span>
        </div>
      </section>

      <section className="section panel">
        {offerings.map((offering) => {
          const teacher = getTeacher(data, offering.teacherId);
          const reviews = getPublishedReviews(data, offering.id);

          return (
            <article className="teacher-block" key={offering.id}>
              <div className="teacher-heading">
                <div>
                  <h2>{teacher?.name ?? "待补充老师"}</h2>
                  <div className="badge-row">
                    <span className="badge">{reviews.length} 条评价</span>
                  </div>
                </div>
                <Link className="button secondary" href={`/submit?course=${course.id}&offering=${offering.id}`}>
                  <MessageSquarePlus aria-hidden="true" />
                  写评价
                </Link>
              </div>
              <div className="review-list">
                {reviews.map((review) => (
                  <div className="review" key={review.id}>
                    <p>{review.content}</p>
                  </div>
                ))}
                {!reviews.length ? <div className="empty">这位老师暂时还没有公开评价。</div> : null}
              </div>
            </article>
          );
        })}
      </section>

      <LocalPublishedContent courseId={course.id} />

      <section className="section panel">
        <div className="teacher-heading">
          <div>
            <h2>课程资料</h2>
            <p className="lead">（建设中）计划收集网盘链接，通过审核后展示在课程页面。</p>
          </div>
          <Link className="button secondary" href={`/submit?course=${course.id}#resource`}>
            <Download aria-hidden="true" />
            提交资料
          </Link>
        </div>
        {resources.length ? (
          <div className="review-list">
            {resources.map((resource) => (
              <a className="review" href={resource.url} key={resource.id} rel="noreferrer" target="_blank">
                <strong>{resource.title}</strong>
                <p>{resource.note}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty">暂无已审核资料。</div>
        )}
      </section>
    </div>
  );
}
