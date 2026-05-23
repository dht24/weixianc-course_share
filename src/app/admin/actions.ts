"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized.replace(/[^\w\u4e00-\u9fff（）()-]+/g, "").replace(/^-+|-+$/g, "") || "item";
}

function makeId(prefix: string, name: string) {
  return `${prefix}-${slugify(name).slice(0, 40)}-${Date.now().toString(36)}`;
}

async function getAdminSupabase() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return admin ? supabase : null;
}

function revalidateAdminData(courseId?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (courseId) revalidatePath(`/courses/${courseId}`);
}

async function updateStatus(table: "reviews" | "resources", id: string, status: "published" | "rejected") {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  await supabase.from(table).update({ status }).eq("id", id);
  revalidateAdminData();
}

export async function approveReview(formData: FormData) {
  await updateStatus("reviews", String(formData.get("id")), "published");
}

export async function rejectReview(formData: FormData) {
  await updateStatus("reviews", String(formData.get("id")), "rejected");
}

export async function approveResource(formData: FormData) {
  await updateStatus("resources", String(formData.get("id")), "published");
}

export async function rejectResource(formData: FormData) {
  await updateStatus("resources", String(formData.get("id")), "rejected");
}

export async function createCourse(formData: FormData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const name = String(formData.get("name") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!name) return;

  await supabase.from("courses").insert({
    id: makeId("course", name),
    name,
    category: "",
    audience: "",
    program: "课程概要",
    aliases: [],
    summary,
  });
  revalidateAdminData();
}

export async function createTeacher(formData: FormData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!name) return;

  await supabase.from("teachers").insert({
    id: makeId("teacher", name),
    name,
    department,
    note,
  });
  revalidateAdminData();
}

export async function createOffering(formData: FormData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const courseId = String(formData.get("courseId") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  if (!courseId || !teacherId) return;

  await supabase
    .from("course_offerings")
    .upsert(
      {
        id: makeId("offering", `${courseId}-${teacherId}-${term || "default"}`),
        course_id: courseId,
        teacher_id: teacherId,
        term,
        status: "published",
      },
      { onConflict: "course_id,teacher_id,term", ignoreDuplicates: true },
    );
  revalidateAdminData(courseId);
}

export async function deleteOffering(formData: FormData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const confirmed = formData.get("confirm") === "yes";
  if (!id || !confirmed) return;

  await supabase.from("course_offerings").delete().eq("id", id);
  revalidateAdminData(courseId);
}

export async function deleteCourse(formData: FormData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const confirmed = formData.get("confirm") === "yes";
  if (!id || !confirmed) return;

  await supabase.from("courses").delete().eq("id", id);
  revalidateAdminData(id);
}

export async function deleteTeacher(formData: FormData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const confirmed = formData.get("confirm") === "yes";
  if (!id || !confirmed) return;

  await supabase.from("teachers").delete().eq("id", id);
  revalidateAdminData();
}
