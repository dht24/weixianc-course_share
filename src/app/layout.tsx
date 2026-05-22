import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, ClipboardCheck, Library, LogIn, PlusCircle } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "选课分享",
  description: "课程评价、授课老师体验和资料整理平台",
};

const navItems = [
  { href: "/", label: "课程库", icon: Library },
  { href: "/submit", label: "提交评价", icon: PlusCircle },
  { href: "/admin", label: "审核后台", icon: ClipboardCheck },
  { href: "/login", label: "登录", icon: LogIn },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <BookOpenCheck aria-hidden="true" />
            <span>选课分享</span>
          </Link>
          <nav aria-label="主导航">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
