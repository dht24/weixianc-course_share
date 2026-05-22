"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function updateStatus(table: "reviews" | "resources", id: string, status: "published" | "rejected") {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from(table).update({ status }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin");
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
