import { Suspense } from "react";
import { SubmitForm } from "@/components/submit-form";
import { getAppData } from "@/lib/supabase/queries";

export default async function SubmitPage() {
  const data = await getAppData();

  return (
    <Suspense fallback={<div className="page">正在加载提交表单...</div>}>
      <SubmitForm data={data} />
    </Suspense>
  );
}
