# 选课分享网站

这是一个选课经验分享网站的尝试。项目的初衷是替代共享表格，建立一个网站来管理课程评价。


## 项目定位

- 这是一个课程评价与资料整理平台，不是正式教务系统。
- 公开页面服务普通同学，用于搜索课程、查看不同老师下的评价、提交新的评价或资料。
- 管理后台服务维护者，用于审核内容、维护课程和老师信息。
- 当前部署方式是 Vercel + Supabase。

## 当前功能

- 首页课程库：按课程名或老师名搜索课程。
- 课程详情页：每门课独立页面，按授课老师分组展示公开评价。
- 评价提交：同学选择课程和老师后填写文字评价，提交后进入待审核状态。
- 资料提交：同学可以提交网盘资料、往年题、课件、笔记等链接，提交后进入待审核状态。
- 管理员登录：只有加入 `admin_users` 表的账号可以访问后台。
- 审核后台：管理员可以通过或驳回待审核评价和资料。
- 课程管理：管理员可以新增课程、新增老师、绑定老师到课程，也可以删除错误绑定、课程或老师。
- Excel 导入：可以从本地 Excel 生成初始数据、完整 seed SQL 和合并更新 SQL。
- 本地演示模式：未配置 Supabase 时，网站会使用本地种子数据和浏览器存储做演示。

## 技术栈

- 前端与后端：Next.js App Router
- 数据库：Supabase Postgres
- 登录：Supabase Auth
- 部署：Vercel
- 数据迁移：Python + openpyxl

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

然后打开：

```text
http://localhost:3000
```

常用页面：

- `/`：课程库首页
- `/courses/[courseId]`：课程详情页
- `/submit`：提交评价和资料
- `/login`：管理员登录
- `/admin`：审核后台和课程管理

## 接入 Supabase

1. 在 Supabase 新建项目。
2. 在 SQL Editor 中执行 `supabase/schema.sql`。
3. 如果是首次导入数据，执行 `supabase/seed.sql`。
4. 如果只是合并更新已有线上数据，优先执行 `supabase/upsert-seed.sql`，不要直接运行会清空数据的完整 seed。
5. 复制 `.env.example` 为 `.env.local`。
6. 填入：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon/public key
```

7. 在 Supabase Auth 中创建管理员邮箱账号，或先访问 `/login` 登录一次。
8. 在 SQL Editor 中授权管理员：

```sql
insert into admin_users (user_id, role)
select id, 'admin'
from auth.users
where email = '你的管理员邮箱@example.com'
on conflict (user_id) do update set role = 'admin';
```

配置完成后，公开页面会优先读取 Supabase 数据；同学提交的新评价和资料会进入 `pending` 状态；管理员登录 `/admin` 后可以审核和维护数据。

## 部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 导入该 GitHub 仓库。
3. Framework Preset 选择 Next.js。
4. 在 Environment Variables 中添加：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon/public key
```

5. 点击 Deploy。
6. 后续本地修改代码后，提交并推送到 GitHub，Vercel 会自动重新部署。

常用提交流程：

```bash
git add .
git commit -m "Describe your change"
git push
```

## 数据模型

- `courses`：课程名称、课程概要、别名等。
- `teachers`：老师姓名、院系、备注。
- `course_offerings`：课程和老师的绑定关系。
- `reviews`：课程评价，包含审核状态。
- `resources`：课程资料链接，包含审核状态。
- `admin_users`：管理员账号和权限。

## 长期目标

- 增加普通同学申请新增课程和新增老师的入口，并进入管理员审核队列。
- 增加举报、纠错和过时评价反馈机制。
- 增加资料模块的细分管理，例如往年题、课件、笔记、复习整理。
- 增加课程热度、最新评价、按培养方案或课程类型筛选。
- 增加数据导出功能，把网站内容定期导出为 Excel 或 Markdown 备份。
- 如果访问量增加，考虑用户登录、收藏课程、点赞评价等功能。
- 如果国内访问不稳定，迁移到国内云服务并配置备案域名。

## AI 协作提示

- 本项目含有大量codex生成内容，请注意辨别。
