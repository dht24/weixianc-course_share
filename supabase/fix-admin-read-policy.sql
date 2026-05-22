drop policy if exists "Users can read own admin role" on admin_users;
create policy "Users can read own admin role"
on admin_users
for select
to authenticated
using (user_id = auth.uid());
