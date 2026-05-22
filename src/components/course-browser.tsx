"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, Star, UserRound } from "lucide-react";
import { getCourseOfferings, getCourseStats, getTeacher, searchCourses } from "@/lib/course-utils";
import type { SeedData } from "@/lib/types";

type Props = {
  data: SeedData;
};

export function CourseBrowser({ data }: Props) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const courses = useMemo(
    () => searchCourses(data, deferredQuery, "全部", "全部"),
    [data, deferredQuery],
  );

  return (
    <>
      <section className="toolbar single" aria-label="课程搜索">
        <div className="field">
          <label htmlFor="search">搜索课程或老师</label>
          <input
            className="input"
            id="search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：科技创新与挑战2B、尉昊赟、林涛"
            value={query}
          />
        </div>
      </section>

      <div className="badge-row" style={{ marginBottom: 16 }}>
        <span className="badge">
          <Search aria-hidden="true" />
          找到 {courses.length} 门课
        </span>
      </div>

      <section className="course-grid" aria-label="课程列表">
        {courses.map((course) => {
          const stats = getCourseStats(data, course.id);
          const teachers = getCourseOfferings(data, course.id)
            .map((offering) => getTeacher(data, offering.teacherId)?.name)
            .filter(Boolean)
            .slice(0, 4);

          return (
            <Link className="course-card" href={`/courses/${course.id}`} key={course.id}>
              <div>
                <h2>{course.name}</h2>
              </div>
              <p>{teachers.length ? `授课老师：${teachers.join("、")}` : "暂无授课老师信息"}</p>
              <div className="badge-row">
                <span className="badge">
                  <UserRound aria-hidden="true" />
                  {stats.teacherCount} 位老师
                </span>
                <span className="badge">
                  <GraduationCap aria-hidden="true" />
                  {stats.reviewCount} 条评价
                </span>
                <span className="badge">
                  <Star aria-hidden="true" />
                  {stats.averageRating ? stats.averageRating.toFixed(1) : "暂无"} 分
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
