create extension if not exists "pgcrypto";

create type review_status as enum ('pending', 'published', 'rejected');
create type resource_status as enum ('pending', 'published', 'rejected');

create table courses (
  id text primary key,
  name text not null,
  category text not null default '',
  audience text not null default '',
  program text not null default '',
  aliases text[] not null default '{}',
  summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teachers (
  id text primary key,
  name text not null,
  department text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table course_offerings (
  id text primary key,
  course_id text not null references courses(id) on delete cascade,
  teacher_id text not null references teachers(id) on delete cascade,
  term text not null default '',
  status review_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, teacher_id, term)
);

create table reviews (
  id text primary key,
  offering_id text not null references course_offerings(id) on delete cascade,
  term text not null default '',
  workload text not null default '不确定',
  grading text not null default '不确定',
  assessment text not null default '不确定',
  rating int not null check (rating between 1 and 5),
  content text not null,
  tags text[] not null default '{}',
  contact text not null default '',
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table resources (
  id text primary key,
  course_id text not null references courses(id) on delete cascade,
  offering_id text references course_offerings(id) on delete set null,
  title text not null,
  type text not null default '网盘资料',
  url text not null,
  note text not null default '',
  status resource_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admin_users (
  user_id uuid primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create index courses_name_idx on courses using gin (to_tsvector('simple', name));
create index teachers_name_idx on teachers using gin (to_tsvector('simple', name));
create index reviews_status_idx on reviews (status);
create index resources_status_idx on resources (status);

alter table courses enable row level security;
alter table teachers enable row level security;
alter table course_offerings enable row level security;
alter table reviews enable row level security;
alter table resources enable row level security;
alter table admin_users enable row level security;

create policy "Public can read courses" on courses for select using (true);
create policy "Public can read teachers" on teachers for select using (true);
create policy "Public can read published offerings" on course_offerings for select using (status = 'published');
create policy "Public can read offering ids for submissions" on course_offerings for select using (true);
create policy "Public can read published reviews" on reviews for select using (status = 'published');
create policy "Anyone can submit pending reviews" on reviews for insert to anon, authenticated with check (status = 'pending');
create policy "Public can read published resources" on resources for select using (status = 'published');
create policy "Anyone can submit pending resources" on resources for insert to anon, authenticated with check (status = 'pending');
create policy "Users can read own admin role" on admin_users for select to authenticated using (user_id = auth.uid());

create policy "Admins manage courses" on courses for all using (
  exists (select 1 from admin_users where user_id = auth.uid())
) with check (
  exists (select 1 from admin_users where user_id = auth.uid())
);

create policy "Admins manage teachers" on teachers for all using (
  exists (select 1 from admin_users where user_id = auth.uid())
) with check (
  exists (select 1 from admin_users where user_id = auth.uid())
);

create policy "Admins manage offerings" on course_offerings for all using (
  exists (select 1 from admin_users where user_id = auth.uid())
) with check (
  exists (select 1 from admin_users where user_id = auth.uid())
);

create policy "Admins manage reviews" on reviews for all using (
  exists (select 1 from admin_users where user_id = auth.uid())
) with check (
  exists (select 1 from admin_users where user_id = auth.uid())
);

create policy "Admins manage resources" on resources for all using (
  exists (select 1 from admin_users where user_id = auth.uid())
) with check (
  exists (select 1 from admin_users where user_id = auth.uid())
);
