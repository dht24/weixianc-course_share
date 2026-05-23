import { Check, ShieldCheck, Trash2 } from "lucide-react";
import { approveResource, approveReview, rejectResource, rejectReview } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

type PendingReview = {
  id: string;
  content: string;
  course_offerings: {
    courses: { name: string } | null;
    teachers: { name: string } | null;
  } | null;
};

type PendingResource = {
  id: string;
  title: string;
  type: string;
  url: string;
  note: string;
  courses: { name: string } | null;
};

export async function AdminSupabaseQueue() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="page">
        <section className="panel">
          <h1>还没有配置 Supabase</h1>
          <p className="lead">请先填写 `.env.local`，并在 Supabase 中执行 schema 和 seed。</p>
        </section>
      </div>
    );
  }

  const [reviewsResult, resourcesResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, content, course_offerings(courses(name), teachers(name))")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("id, title, type, url, note, courses(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const reviews = (reviewsResult.data ?? []) as unknown as PendingReview[];
  const resources = (resourcesResult.data ?? []) as unknown as PendingResource[];

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">管理员审核</p>
          <h1>公开内容先过一遍质量关。</h1>
          <p className="lead">通过后的评价和资料会进入公开课程页；驳回内容会保留在数据库中便于追溯。</p>
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
            <strong>{reviews.length + resources.length}</strong>
            <span>全部待办</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>待审核评价</h2>
        <div className="admin-list">
          {reviews.map((review) => (
            <article className="admin-item" key={review.id}>
              <div className="badge-row">
                <span className="badge">{review.course_offerings?.courses?.name ?? "未知课程"}</span>
                <span className="badge">{review.course_offerings?.teachers?.name ?? "未知老师"}</span>
              </div>
              <p style={{ lineHeight: 1.8, marginTop: 12, whiteSpace: "pre-wrap" }}>{review.content}</p>
              <div className="admin-actions">
                <form action={approveReview}>
                  <input name="id" type="hidden" value={review.id} />
                  <button className="button" type="submit">
                    <Check aria-hidden="true" />
                    通过
                  </button>
                </form>
                <form action={rejectReview}>
                  <input name="id" type="hidden" value={review.id} />
                  <button className="button danger" type="submit">
                    <Trash2 aria-hidden="true" />
                    驳回
                  </button>
                </form>
              </div>
            </article>
          ))}
          {!reviews.length ? <div className="empty">暂无待审核评价。</div> : null}
        </div>
      </section>

      <section className="section panel">
        <h2>待审核资料</h2>
        <div className="admin-list">
          {resources.map((resource) => (
            <article className="admin-item" key={resource.id}>
              <div className="badge-row">
                <span className="badge">{resource.courses?.name ?? "未知课程"}</span>
                <span className="badge">{resource.type}</span>
              </div>
              <h3>{resource.title}</h3>
              <p>{resource.url}</p>
              <p>{resource.note}</p>
              <div className="admin-actions">
                <form action={approveResource}>
                  <input name="id" type="hidden" value={resource.id} />
                  <button className="button" type="submit">
                    <ShieldCheck aria-hidden="true" />
                    通过
                  </button>
                </form>
                <form action={rejectResource}>
                  <input name="id" type="hidden" value={resource.id} />
                  <button className="button danger" type="submit">
                    <Trash2 aria-hidden="true" />
                    驳回
                  </button>
                </form>
              </div>
            </article>
          ))}
          {!resources.length ? <div className="empty">暂无待审核资料。</div> : null}
        </div>
      </section>
    </div>
  );
}
