# 选课分享网站

这是一个把共享表格升级为课程评价网站的 MVP。当前版本已经包含课程库、课程详情、评价提交、资料提交、审核后台和从 Excel 迁移来的初始数据。

## 当前状态

- 首页可以按课程名、老师名、班级和课程类别检索。
- 每门课有独立详情页，并按授课老师分组展示评价。
- 普通同学可以提交评价和资料链接，内容先进入待审核队列。
- 配置 Supabase 后，管理后台需要登录，并可通过或驳回数据库里的待审内容。
- 未配置 Supabase 时，项目会使用本地种子数据和浏览器存储做演示。
- `supabase/schema.sql` 和 `supabase/seed.sql` 提供数据库结构与初始数据。

## 本地运行

安装依赖后运行：

```bash
npm install
npm run dev
```

然后打开 `http://localhost:3000`。

## 重新导入 Excel

默认从 `C:\Users\dht\Downloads\选课分享.xlsx` 读取数据：

```bash
npm run import:excel
```

导入结果会写入 `src/data/seed-data.ts`，并同步生成 `supabase/seed.sql`。

## 接入 Supabase

1. 在 Supabase 项目 SQL Editor 中执行 `supabase/schema.sql`。
2. 再执行 `supabase/seed.sql`，导入从 Excel 生成的初始课程、老师和评价。
3. 复制 `.env.example` 为 `.env.local`。
4. 填入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
5. 在 Supabase Auth 中创建管理员邮箱账号，或先在 `/login` 登录一次。
6. 在 SQL Editor 中执行下面的语句，把账号加入管理员表：

```sql
insert into admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = '你的管理员邮箱@example.com';
```

配置完成后，公开页面会优先读取 Supabase 数据；同学提交的新评价和资料会进入 `pending` 状态；管理员登录 `/admin` 后可以通过或驳回。

## 下一步目标

- 给新增课程、新增老师申请做单独审核队列。
- 给公开评价增加举报和纠错入口。
- 使用国内服务器与数据库维护网站。
