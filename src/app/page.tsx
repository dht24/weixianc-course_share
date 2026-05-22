import { CourseBrowser } from "@/components/course-browser";
import { getAppData } from "@/lib/supabase/queries";

export default async function HomePage() {
  const data = await getAppData();

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">课程评价、授课体验、资料线索统一整理</p>
          <h1>为先书院选课分享网站</h1>
          <p className="lead">
            这是为先书院选课分享网站，这里是网站介绍。
          </p>
        </div>
        <div className="metric-strip" aria-label="当前数据概览">
          <div className="metric">
            <strong>{data.courses.length}</strong>
            <span>门课程</span>
          </div>
          <div className="metric">
            <strong>{data.teachers.length}</strong>
            <span>位老师</span>
          </div>
          <div className="metric">
            <strong>{data.reviews.length}</strong>
            <span>条历史评价</span>
          </div>
        </div>
      </section>
      <CourseBrowser data={data} />
    </div>
  );
}
