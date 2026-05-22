import { signIn } from "@/app/login/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">管理员登录</p>
          <h1>这是审核入口，只给管理员使用。</h1>
          <p className="lead">同学可以直接提交评价；由管理员负责通过、驳回或整理内容。</p>
        </div>
      </section>

      <section className="panel">
        {error ? (
          <div className="badge-row" style={{ marginBottom: 16 }}>
            <span className="badge">{decodeURIComponent(error)}</span>
          </div>
        ) : null}
        <form action={signIn} className="form-grid">
          <div className="field">
            <label htmlFor="email">邮箱</label>
            <input className="input" id="email" name="email" required type="email" />
          </div>
          <div className="field">
            <label htmlFor="password">密码</label>
            <input className="input" id="password" name="password" required type="password" />
          </div>
          <button className="button" type="submit">
            登录后台
          </button>
        </form>
      </section>
    </div>
  );
}
