from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EXCEL = Path(r"C:\Users\dht\Downloads\选课分享.xlsx")
OUT = ROOT / "src" / "data" / "seed-data.ts"
SQL_OUT = ROOT / "supabase" / "seed.sql"


def clean(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def slugify(text: str) -> str:
    normalized = re.sub(r"\s+", "-", text.strip().lower())
    normalized = re.sub(r"[^\w\u4e00-\u9fff（）()\-]+", "", normalized)
    return normalized.strip("-") or "item"


def detect_workload(text: str) -> str:
    if any(word in text for word in ["作业量很大", "课程量大", "任务量大", "偏多", "很大"]):
        return "重"
    if any(word in text for word in ["作业不多", "任务量小", "课外时间", "轻松", "不占用"]):
        return "轻"
    return "不确定"


def detect_grading(text: str) -> str:
    if any(word in text for word in ["给分好", "好拿高分", "包4.0", "A+", "给分不错", "给分也好"]):
        return "偏好"
    if any(word in text for word in ["给分差", "给分都很差", "难拿高分", "偏严"]):
        return "偏严"
    if "给分" in text:
        return "正常"
    return "不确定"


def detect_assessment(text: str) -> str:
    parts: list[str] = []
    for label, words in {
        "考试": ["考试", "期中", "期末", "闭卷", "开卷"],
        "论文": ["论文", "小论文", "大论文"],
        "展示": ["pre", "展示", "汇报"],
        "作业": ["作业", "报告"],
    }.items():
        if any(word in text for word in words):
            parts.append(label)
    return " / ".join(parts) if parts else "不确定"


def score(text: str) -> int:
    if any(word in text for word in ["神", "无脑入", "强力推荐", "推荐", "很好", "非常好"]):
        return 5
    if any(word in text for word in ["不推荐", "差评", "给分差"]):
        return 2
    if any(word in text for word in ["中规中矩", "还行", "一般"]):
        return 3
    return 4


def read_excel(path: Path) -> dict[str, dict[str, list[str]]]:
    wb = load_workbook(path, data_only=True)
    ws = wb.active

    merged: dict[tuple[int, int], Any] = {}
    for cell_range in ws.merged_cells.ranges:
        min_col, min_row, max_col, max_row = cell_range.bounds
        merged_value = ws.cell(min_row, min_col).value
        for row in range(min_row, max_row + 1):
            for col in range(min_col, max_col + 1):
                merged[(row, col)] = merged_value

    def value(row: int, col: int) -> str:
        return clean(ws.cell(row, col).value or merged.get((row, col)))

    courses: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
    current_course = ""
    current_teacher = ""

    for row in range(4, ws.max_row + 1):
        course = value(row, 1)
        teacher = value(row, 2)
        if course:
            current_course = course
            current_teacher = ""
        if teacher:
            current_teacher = teacher
        if not current_course or not current_teacher:
            continue

        for col in range(3, ws.max_column + 1):
            review = value(row, col)
            if review:
                courses[current_course][current_teacher].append(review)

    return courses


def build_seed(raw: dict[str, dict[str, list[str]]]) -> dict[str, Any]:
    courses = []
    teachers_by_name: dict[str, dict[str, str]] = {}
    offerings = []
    reviews = []

    for course_index, (course_name, teacher_map) in enumerate(raw.items(), start=1):
        course_id = f"course-{course_index:03d}-{slugify(course_name)}"
        courses.append(
            {
                "id": course_id,
                "name": course_name,
                "category": "培养方案课程",
                "audience": "四字班 / 五字班",
                "program": "下学期培养方案",
                "aliases": [],
                "summary": "由共享表格迁移而来，等待管理员进一步校对。",
            }
        )

        for teacher_name, teacher_reviews in teacher_map.items():
            if teacher_name not in teachers_by_name:
                teacher_id = f"teacher-{len(teachers_by_name) + 1:03d}-{slugify(teacher_name)[:24]}"
                teachers_by_name[teacher_name] = {
                    "id": teacher_id,
                    "name": teacher_name,
                    "department": "",
                    "note": "",
                }
            teacher = teachers_by_name[teacher_name]
            offering_id = f"offering-{len(offerings) + 1:03d}"
            offerings.append(
                {
                    "id": offering_id,
                    "courseId": course_id,
                    "teacherId": teacher["id"],
                    "term": "待补充",
                    "status": "published",
                }
            )

            for review_text in teacher_reviews:
                reviews.append(
                    {
                        "id": f"review-{len(reviews) + 1:04d}",
                        "offeringId": offering_id,
                        "term": "历史共享表",
                        "workload": detect_workload(review_text),
                        "grading": detect_grading(review_text),
                        "assessment": detect_assessment(review_text),
                        "rating": score(review_text),
                        "content": review_text,
                        "tags": [],
                        "contact": "",
                        "status": "published",
                        "createdAt": "2026-05-22",
                    }
                )

    return {
        "courses": courses,
        "teachers": list(teachers_by_name.values()),
        "offerings": offerings,
        "reviews": reviews,
        "resources": [],
    }


def sql_quote(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, list):
        return "array[" + ", ".join(sql_quote(item) for item in value) + "]::text[]"
    text = str(value).replace("'", "''")
    return f"'{text}'"


def write_sql_seed(seed: dict[str, Any]) -> None:
    lines = [
        "-- Seed data generated from 选课分享.xlsx.",
        "-- Execute supabase/schema.sql first, then run this file in Supabase SQL Editor.",
        "begin;",
    ]

    for table in ["reviews", "resources", "course_offerings", "teachers", "courses"]:
        lines.append(f"delete from {table};")

    for course in seed["courses"]:
        lines.append(
            "insert into courses (id, name, category, audience, program, aliases, summary) values "
            f"({sql_quote(course['id'])}, {sql_quote(course['name'])}, {sql_quote(course['category'])}, "
            f"{sql_quote(course['audience'])}, {sql_quote(course['program'])}, {sql_quote(course['aliases'])}, "
            f"{sql_quote(course['summary'])});"
        )

    for teacher in seed["teachers"]:
        lines.append(
            "insert into teachers (id, name, department, note) values "
            f"({sql_quote(teacher['id'])}, {sql_quote(teacher['name'])}, "
            f"{sql_quote(teacher['department'])}, {sql_quote(teacher['note'])});"
        )

    for offering in seed["offerings"]:
        lines.append(
            "insert into course_offerings (id, course_id, teacher_id, term, status) values "
            f"({sql_quote(offering['id'])}, {sql_quote(offering['courseId'])}, "
            f"{sql_quote(offering['teacherId'])}, {sql_quote(offering['term'])}, {sql_quote(offering['status'])});"
        )

    for review in seed["reviews"]:
        lines.append(
            "insert into reviews (id, offering_id, term, workload, grading, assessment, rating, content, tags, contact, status, created_at) values "
            f"({sql_quote(review['id'])}, {sql_quote(review['offeringId'])}, {sql_quote(review['term'])}, "
            f"{sql_quote(review['workload'])}, {sql_quote(review['grading'])}, {sql_quote(review['assessment'])}, "
            f"{review['rating']}, {sql_quote(review['content'])}, {sql_quote(review['tags'])}, "
            f"{sql_quote(review['contact'])}, {sql_quote(review['status'])}, {sql_quote(review['createdAt'])});"
        )

    lines.append("commit;")
    SQL_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    raw = read_excel(DEFAULT_EXCEL)
    seed = build_seed(raw)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(seed, ensure_ascii=False, indent=2)
    OUT.write_text(
        "import type { SeedData } from '@/lib/types';\n\n"
        f"export const seedData = {body} satisfies SeedData;\n",
        encoding="utf-8",
    )
    write_sql_seed(seed)
    print(
        f"Imported {len(seed['courses'])} courses, "
        f"{len(seed['teachers'])} teachers, {len(seed['reviews'])} reviews."
    )


if __name__ == "__main__":
    main()
