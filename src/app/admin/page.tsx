import { redirect } from "next/navigation";
import { AdminQueue } from "@/components/admin-queue";
import { AdminSupabaseQueue } from "@/components/admin-supabase-queue";
import { SignOutButton } from "@/components/sign-out-button";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  if (!hasSupabaseEnv()) {
    return <AdminQueue />;
  }

  const supabase = await createClient();
  if (!supabase) return <AdminQueue />;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) {
    return (
      <div className="page">
        <section className="panel">
          <h1>没有后台权限</h1>
          <p className="lead">当前账号已经登录，但还没有加入 `admin_users` 表。</p>
          <div className="review" style={{ marginBottom: 18 }}>
            <p>当前邮箱：{user.email ?? "未读取到邮箱"}</p>
            <p>当前用户 ID：{user.id}</p>
          </div>
          <p className="lead">可以在 Supabase SQL Editor 中用这个用户 ID 授权：</p>
          <pre className="code-block">{`insert into admin_users (user_id, role)
values ('${user.id}', 'admin')
on conflict (user_id) do update set role = 'admin';`}</pre>
          <SignOutButton />
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="page" style={{ paddingBottom: 0 }}>
        <SignOutButton />
      </div>
      <AdminSupabaseQueue />
    </>
  );
}
