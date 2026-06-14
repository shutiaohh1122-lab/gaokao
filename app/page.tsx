import Link from "next/link";
import { ArrowRight, BarChart3, Building2, Database, Flame, MapPinned, SearchCheck, Sparkles } from "lucide-react";
import { ProvinceComparisonChart } from "@/components/charts";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { SearchPanel } from "@/components/search-panel";
import { SiteHeader } from "@/components/site-header";
import {
  admissionScores,
  dataCatalogManifest,
  getProvinceComparison,
  majorCatalog,
  majors,
  provinces,
  universities,
  universityCatalog,
  years
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const quickStats = [
  { label: "覆盖省份", value: `${provinces.length}` },
  { label: "可用院校目录", value: `${universityCatalog.length}+` },
  { label: "可用专业目录", value: `${majorCatalog.length}+` },
  { label: "近年数据", value: `${years.length} 年` }
];

const featuredUniversities = universities.slice(0, 5);
const featuredMajors = [...majors]
  .sort((a, b) => b.heat - a.heat)
  .slice(0, 6);
const latestRecords = admissionScores.filter((item) => item.year === years[0].value);
const latestSummary = {
  records: latestRecords.length,
  avgScore: Math.round(latestRecords.reduce((sum, item) => sum + item.minScore, 0) / latestRecords.length),
  avgRank: Math.round(latestRecords.reduce((sum, item) => sum + item.minRank, 0) / latestRecords.length)
};

export default function HomePage() {
  return (
    <div className="pb-12">
      <SiteHeader />

      <main className="shell space-y-6 py-5 sm:py-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="space-y-6">
            <div className="panel-strong px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">34 个省级地区</span>
                <span className="chip">近 5 年录取数据</span>
                <span className="chip">院校 / 专业 / 位次查询</span>
              </div>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
                    高考历年录取分数查询
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                    查询全国高校历年最低分、最低位次、招生专业与录取趋势。
                  </p>
                </div>

                <div className="grid min-w-0 gap-2 sm:grid-cols-3 lg:max-w-[430px]">
                  {[
                    { title: "按分数查学校", href: "/results?provinceId=guangdong&year=2025&subjectType=物理", desc: "适合先看录取线" },
                    { title: "按学校查专业", href: "/universities/sysu", desc: "查看院校内专业情况" },
                    { title: "按专业看趋势", href: "/majors/computer-science", desc: "关注专业近年走势" }
                  ].map((entry) => (
                    <Link key={entry.title} href={entry.href} className="dense-card text-sm">
                      <p className="font-semibold">{entry.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{entry.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 subtle-grid">
                {quickStats.map((item) => (
                  <div key={item.label} className="data-kpi">
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <SearchPanel />
          </div>

          <aside className="space-y-6">
            <div className="panel-strong p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-900/60 dark:text-accent-200">
                  <SearchCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="label">快捷入口</p>
                  <h2 className="mt-1 text-lg font-semibold">常用查询场景</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Link href="/results?provinceId=guangdong&year=2025&subjectType=物理" className="flex items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-sm dark:bg-slate-900">
                  <span>广东 2025 物理类录取线</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/universities/sysu" className="flex items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-sm dark:bg-slate-900">
                  <span>查看中山大学详情</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/majors/computer-science" className="flex items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-sm dark:bg-slate-900">
                  <span>查看计算机专业详情</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 rounded-xl border bg-slate-50/90 p-4 text-sm leading-6 text-[var(--muted)] dark:bg-slate-900/60">
                当前目录规模：
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{universityCatalog.length}+</p>
                    <p>全国院校目录</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{majorCatalog.length}+</p>
                    <p>全国专业目录</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel p-5 sm:p-6">
              <p className="label">平台能力</p>
              <div className="mt-5 space-y-4">
                {[
                  { icon: BarChart3, title: "趋势分析", desc: "分数、位次、各省录取对比图统一呈现。" },
                  { icon: Building2, title: "院校专业联动", desc: "支持院校与专业双关键词联想查询。" },
                  { icon: MapPinned, title: "省份科类切换", desc: "兼容新高考与传统文理科省份筛选逻辑。" },
                  { icon: Database, title: "后续可接真实数据", desc: "当前已预留目录导入与录取数据导入能力。" }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <ProvinceComparisonChart data={getProvinceComparison("物理")} />

          <div className="grid gap-6">
            <section className="panel p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="label">热门院校</p>
                  <h2 className="mt-1 text-lg font-semibold">高关注院校入口</h2>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {featuredUniversities.map((item) => (
                  <Link
                    key={item.id}
                    href={`/universities/${item.id}`}
                    className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="mt-1 truncate text-xs text-[var(--muted)]">
                        {item.city} · {item.type} · {item.tierTags.join(" / ")}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="panel p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700 dark:bg-accent-900/50 dark:text-accent-200">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="label">热门专业</p>
                  <h2 className="mt-1 text-lg font-semibold">高热度专业方向</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {featuredMajors.map((major) => (
                  <Link
                    key={major.id}
                    href={`/majors/${major.id}`}
                    className="rounded-xl border bg-white px-4 py-3 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{major.name}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {major.category} · {major.subjectRequirements}
                        </p>
                      </div>
                      <span className="chip shrink-0">热度 {major.heat}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section className="panel p-5 sm:p-6">
            <p className="label">查询说明</p>
            <h2 className="mt-2 section-title">筛选逻辑与结果展示</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "省份、年份、科类、院校、专业多维组合查询",
                "结果页展示最低分、平均分、最低位次、招生人数",
                "院校详情页展示学校层次、简介、趋势图与热门专业",
                "专业详情页展示专业介绍、就业方向与录取走势"
              ].map((text) => (
                <div key={text} className="rounded-xl border bg-white p-4 text-sm leading-6 dark:bg-slate-900">
                  {text}
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="label">数据概览</p>
                <h2 className="mt-1 text-lg font-semibold">当前样例数据规模</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border bg-slate-50/90 p-4 dark:bg-slate-900/60">
                <p className="text-xs text-[var(--muted)]">最新年度记录数</p>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(latestSummary.records)}</p>
              </div>
              <div className="rounded-xl border bg-slate-50/90 p-4 dark:bg-slate-900/60">
                <p className="text-xs text-[var(--muted)]">平均最低分</p>
                <p className="mt-1 text-2xl font-semibold">{latestSummary.avgScore}</p>
              </div>
              <div className="rounded-xl border bg-slate-50/90 p-4 dark:bg-slate-900/60">
                <p className="text-xs text-[var(--muted)]">平均最低位次</p>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(latestSummary.avgRank)}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border bg-white p-4 text-sm leading-6 text-[var(--muted)] dark:bg-slate-900">
              当前首页不再只放说明文案，而是优先展示用户会真正点击的信息入口。后续这里还能继续扩展为热门榜单、最近查询、分数段导航。
            </div>
          </section>
        </section>

        <RecommendationPanel />
      </main>
    </div>
  );
}
