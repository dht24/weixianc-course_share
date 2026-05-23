import { BookOpen, Link2, Plus, Trash2, UserRound } from "lucide-react";
import { createCourse, createOffering, createTeacher, deleteCourse, deleteOffering, deleteTeacher } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

type AdminCourse = {
  id: string;
  name: string;
  summary: string;
};

type AdminTeacher = {
  id: string;
  name: string;
  department: string;
  note: string;
};

type AdminOffering = {
  id: string;
  term: string;
  courses: { id: string; name: string } | null;
  teachers: { id: string; name: string } | null;
};

export async function AdminCourseManager() {
  const supabase = await createClient();

  if (!supabase) return null;

  const [coursesResult, teachersResult, offeringsResult] = await Promise.all([
    supabase.from("courses").select("id, name, summary").order("name"),
    supabase.from("teachers").select("id, name, department, note").order("name"),
    supabase
      .from("course_offerings")
      .select("id, term, courses(id, name), teachers(id, name)")
      .order("created_at", { ascending: false }),
  ]);

  const courses = (coursesResult.data ?? []) as unknown as AdminCourse[];
  const teachers = (teachersResult.data ?? []) as unknown as AdminTeacher[];
  const offerings = (offeringsResult.data ?? []) as unknown as AdminOffering[];

  return (
    <section className="section panel">
      <div className="teacher-heading">
        <div>
          <p className="eyebrow">课程管理</p>
          <h2>维护课程、老师和开课关联。</h2>
          <p className="lead">新增课程和老师后，需要把老师绑定到课程，学生才能在提交评价时选择对应老师。</p>
        </div>
      </div>

      <div className="management-grid">
        <form action={createCourse} className="admin-item form-grid">
          <div className="field wide">
            <label htmlFor="new-course-name">新增课程名称</label>
            <input className="input" id="new-course-name" name="name" placeholder="例如：信号与系统" required />
          </div>
          <div className="field wide">
            <label htmlFor="new-course-summary">课程概要（选填）</label>
            <textarea className="textarea compact" id="new-course-summary" name="summary" placeholder="可简单写课程内容、适合人群或备注。" />
          </div>
          <button className="button" type="submit">
            <Plus aria-hidden="true" />
            新增课程
          </button>
        </form>

        <form action={createTeacher} className="admin-item form-grid">
          <div className="field wide">
            <label htmlFor="new-teacher-name">新增老师姓名</label>
            <input className="input" id="new-teacher-name" name="name" placeholder="例如：张三" required />
          </div>
          <div className="field">
            <label htmlFor="new-teacher-department">院系（选填）</label>
            <input className="input" id="new-teacher-department" name="department" />
          </div>
          <div className="field">
            <label htmlFor="new-teacher-note">备注（选填）</label>
            <input className="input" id="new-teacher-note" name="note" />
          </div>
          <button className="button" type="submit">
            <Plus aria-hidden="true" />
            新增老师
          </button>
        </form>
      </div>

      <form action={createOffering} className="section admin-item form-grid">
        <div className="field">
          <label htmlFor="offering-course">选择课程</label>
          <select className="select" id="offering-course" name="courseId" required>
            <option value="">请选择课程</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="offering-teacher">选择老师</label>
          <select className="select" id="offering-teacher" name="teacherId" required>
            <option value="">请选择老师</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="offering-term">开课学期（选填）</label>
          <input className="input" id="offering-term" name="term" placeholder="例如：2026 春；不填也可以" />
        </div>
        <button className="button" type="submit">
          <Link2 aria-hidden="true" />
          绑定老师到课程
        </button>
      </form>

      <div className="management-grid section">
        <div>
          <h3>
            <BookOpen aria-hidden="true" /> 课程列表
          </h3>
          <div className="admin-list compact-list">
            {courses.map((course) => (
              <article className="admin-item" key={course.id}>
                <strong>{course.name}</strong>
                {course.summary ? <p>{course.summary}</p> : null}
                <form action={deleteCourse} className="danger-form">
                  <input name="id" type="hidden" value={course.id} />
                  <label>
                    <input name="confirm" type="checkbox" value="yes" /> 确认删除
                  </label>
                  <button className="button danger" type="submit">
                    <Trash2 aria-hidden="true" />
                    删除课程
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h3>
            <UserRound aria-hidden="true" /> 老师列表
          </h3>
          <div className="admin-list compact-list">
            {teachers.map((teacher) => (
              <article className="admin-item" key={teacher.id}>
                <strong>{teacher.name}</strong>
                {teacher.department || teacher.note ? (
                  <p>
                    {[teacher.department, teacher.note].filter(Boolean).join(" / ")}
                  </p>
                ) : null}
                <form action={deleteTeacher} className="danger-form">
                  <input name="id" type="hidden" value={teacher.id} />
                  <label>
                    <input name="confirm" type="checkbox" value="yes" /> 确认删除
                  </label>
                  <button className="button danger" type="submit">
                    <Trash2 aria-hidden="true" />
                    删除老师
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h3>
          <Link2 aria-hidden="true" /> 已绑定的课程老师
        </h3>
        <div className="admin-list">
          {offerings.map((offering) => (
            <article className="admin-item" key={offering.id}>
              <div className="badge-row">
                <span className="badge">{offering.courses?.name ?? "未知课程"}</span>
                <span className="badge">{offering.teachers?.name ?? "未知老师"}</span>
                {offering.term ? <span className="badge">{offering.term}</span> : null}
              </div>
              <form action={deleteOffering} className="danger-form">
                <input name="id" type="hidden" value={offering.id} />
                <input name="courseId" type="hidden" value={offering.courses?.id ?? ""} />
                <label>
                  <input name="confirm" type="checkbox" value="yes" /> 确认删除
                </label>
                <button className="button danger" type="submit">
                  <Trash2 aria-hidden="true" />
                  删除绑定
                </button>
              </form>
            </article>
          ))}
          {!offerings.length ? <div className="empty">暂无课程老师绑定。</div> : null}
        </div>
      </div>

      <p className="lead section">
        删除课程会同时删除这门课下的老师绑定、评价和资料；删除老师会删除该老师相关绑定及评价。日常维护更推荐先删除错误绑定，谨慎删除课程或老师本体。
      </p>
    </section>
  );
}
