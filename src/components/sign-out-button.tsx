import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="button secondary" type="submit">
        退出登录
      </button>
    </form>
  );
}
