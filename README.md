# 选课分享网站

这是一个面向为先书院同学的选课经验分享网站。项目的初衷是替代微信群里的共享表格：不再让所有人直接编辑同一张表，而是把“课程库、授课老师、课程评价、资料链接、管理员审核”拆成结构化的数据和页面。

第一版目标是轻量、可维护、方便转发，不做复杂社区功能。普通同学只需要选择课程和老师，提交文字评价或资料链接；公开内容由管理员审核后发布，避免共享文档里常见的格式混乱、重复课程、评价分散和误删问题。

## 项目定位

- 这是一个课程评价与资料整理平台，不是正式教务系统。
- 公开页面服务普通同学，用于搜索课程、查看不同老师下的评价、提交新的评价或资料。
- 管理后台服务维护者，用于审核内容、维护课程和老师信息。
- 数据源从早期 Excel/共享表格迁移而来，后续以 Supabase 数据库为准。
- 当前部署方式是 Vercel + Supabase，适合快速上线；如果国内访问长期不稳定，可以迁移到国内云服务器和数据库。

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

## 管理员使用方法

管理员进入 `/admin` 后可以做两类事。

内容审核：

- 通过评价：评价变为公开内容，显示在对应课程详情页。
- 驳回评价：评价保留在数据库中，但不会公开展示。
- 通过资料：资料链接显示在对应课程详情页。
- 驳回资料：资料不会公开展示。

课程管理：

- 新增课程：填写课程名称，课程概要可选。
- 新增老师：填写老师姓名，院系和备注可选。
- 绑定老师到课程：选择一门课程和一位老师，必要时填写开课学期。
- 删除绑定：如果老师被错误挂到某门课下，优先删除绑定。
- 删除课程或老师：需要勾选“确认删除”才会执行。

注意：删除课程会连带删除这门课下的老师绑定、评价和资料；删除老师会连带删除该老师相关绑定及评价。日常维护更推荐删除错误绑定，谨慎删除课程或老师本体。

## 重新导入 Excel

导入脚本默认读取：

```text
C:\Users\dht\Downloads\选课分享.xlsx
C:\Users\dht\Downloads\TIC2选课.xlsx
```

运行：

```bash
npm run import:excel
```

导入会更新：

- `src/data/seed-data.ts`：本地演示数据
- `supabase/seed.sql`：完整重建数据用的 SQL
- `supabase/upsert-seed.sql`：合并更新线上数据用的 SQL

维护线上数据库时，通常优先使用 `supabase/upsert-seed.sql`。直接运行 `supabase/seed.sql` 会清空并重建表数据，除非你明确想重置数据库，否则不要在已有线上项目中随意执行。

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

核心关系是：一门课程可以绑定多个老师，一个老师也可以绑定多门课程；评价挂在具体的 `course_offerings` 上，也就是“某门课的某位老师”下面。

## 长期目标

- 增加普通同学申请新增课程和新增老师的入口，并进入管理员审核队列。
- 增加编辑功能，而不仅仅是新增和删除。
- 增加举报、纠错和过时评价反馈机制。
- 增加资料模块的细分管理，例如往年题、课件、笔记、复习整理。
- 增加课程热度、最新评价、按培养方案或课程类型筛选。
- 增加数据导出功能，把网站内容定期导出为 Excel 或 Markdown 备份。
- 如果访问量增加，考虑用户登录、收藏课程、点赞评价等功能。
- 如果国内访问 Vercel 不稳定，迁移到国内云服务并配置备案域名。

## AI 协作提示

后续让 AI 修改项目时，建议把任务说清楚，并提醒它先检查现有代码再动手。可以直接使用下面的提示模板。

小改文字：

```text
请在当前 Next.js 选课分享项目中修改页面文案。先搜索相关文案所在文件，再只改必要内容。修改后运行 npm run build 验证。
```

新增后台功能：

```text
请为管理员后台增加一个功能。当前项目使用 Next.js App Router + Supabase，管理员操作在 src/app/admin/actions.ts，后台页面在 src/app/admin/page.tsx 和 src/components/ 下。请先阅读现有后台代码和 Supabase schema，再实现功能、更新 README，并运行 npm run build。
```

修改数据库结构：

```text
请修改 Supabase 数据模型。需要同时更新 supabase/schema.sql、相关查询代码、管理员操作、README。如果会影响已有线上数据，请额外提供一个非破坏性的迁移 SQL，不要只给会清空数据的 seed.sql。
```

导入 Excel 数据：

```text
请根据新的 Excel 表格更新导入脚本 scripts/import_excel.py。要求保留已有课程数据，不要生成会误删线上数据的 SQL；同时更新 src/data/seed-data.ts、supabase/seed.sql 和 supabase/upsert-seed.sql，并说明应该在线上运行哪个 SQL。
```

部署或上线：

```text
请检查这个项目是否可以部署到 Vercel。确认 package.json、环境变量、Supabase 连接和构建结果。不要泄露 .env.local 中的密钥，只说明需要在 Vercel 配置哪些变量。
```

给 AI 的通用要求：

- 不要直接重置数据库，除非明确要求。
- 不要删除已有课程、老师、评价，除非明确说明删除范围。
- 涉及线上数据时，优先生成可合并、可回滚、非破坏性的 SQL。
- 修改后必须运行 `npm run build`。
- 如果改了用户使用方式，要同步更新 README。
