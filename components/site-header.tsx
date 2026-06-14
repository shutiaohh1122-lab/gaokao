import Link from "next/link";
import { Database, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="shell flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">高考志愿查询平台</p>
            <p className="truncate text-xs text-[var(--muted)]">历年分数 · 最低位次 · 院校专业查询</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
          <Link href="/">查询首页</Link>
          <Link href="/results">录取数据</Link>
          <Link href="/universities/sysu">院校详情</Link>
          <Link href="/majors/computer-science">专业详情</Link>
          <Link href="/admin/import" className="inline-flex items-center gap-2">
            <Database className="h-4 w-4" />
            数据导入
          </Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
