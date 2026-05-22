"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Search, Star, UserRound } from "lucide-react";
import { getCourseOfferings, getCourseStats, getTeacher, searchCourses } from "@/lib/course-utils";
import type { SeedData } from "@/lib/types";

const audiences = ["全部", "四字班", "五字班"];

type Props = {
  data: SeedData;
};

export function CourseBrowser({ data }: Props) {
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("全部");
  const [category, setCategory] = useState("全部");
  const deferredQuery = useDeferredValue(query);
  const categories = useMemo(() => ["全部", ...Array.from(new Set(data.courses.map((course) => course.category)))], [data]);

  const courses = useMemo(
    () => searchCourses(data, deferredQuery, audience, category),
    [audience, category, data, deferredQuery],
  );

  return (
    <>
      <section className="toolbar" aria-label="课程筛选">
        <div className="field">
          <label htmlFor="search">搜索课程或老师</label>
          <input
            className="input"
            id="search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：化学原理、叶俊、马克思主义"
            value={query}
          />
        </div>
        <div className="field">
          <label htmlFor="audience">适用班级</label>
          <select className="select" id="audience" onChange={(event) => setAudience(event.target.value)} value={audience}>
            {audiences.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="category">课程类别</label>
          <select className="select" id="category" onChange={(event) => setCategory(event.target.value)} value={category}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
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
                <div className="badge-row" style={{ marginBottom: 12 }}>
                  <span className="badge">
                    <BookOpen aria-hidden="true" />
                    {course.category}
                  </span>
                </div>
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
