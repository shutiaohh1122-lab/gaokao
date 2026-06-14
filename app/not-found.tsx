import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <main className="shell flex min-h-screen items-center justify-center py-16">
      <section className="panel-strong max-w-lg p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
          <FileSearch className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">页面未找到</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          可能是院校或专业编号不存在，也可能是链接已经变更。
        </p>
        <Link href="/" className="button-primary mt-6 inline-flex">
          返回首页
        </Link>
      </section>
    </main>
  );
}
