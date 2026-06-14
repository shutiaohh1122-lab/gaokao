import { notFound } from "next/navigation";
import { Building2, GraduationCap, TrendingUp } from "lucide-react";
import { HotMajorChart, RankTrendChart, ScoreTrendChart } from "@/components/charts";
import { SiteHeader } from "@/components/site-header";
import {
  getHotMajors,
  getUniversityTrend,
  summarizeAdmissions
} from "@/lib/mock-data";
import { findMajorById, findUniversityById, getAllAdmissionsData } from "@/lib/data-source";
import { formatNumber } from "@/lib/utils";

type UniversityPageProps = {
  params: { id: string };
};

export default async function UniversityDetailPage({ params }: UniversityPageProps) {
  const university = await findUniversityById(params.id);
  if (!university) notFound();

  const allAdmissions = await getAllAdmissionsData();
  const admissions = allAdmissions.filter((item) => item.universityId === params.id).slice(0, 8);
  const trend = getUniversityTrend(params.id, "guangdong", "物理");
  const hotMajors = getHotMajors(params.id);
  const summary = summarizeAdmissions(allAdmissions.filter((item) => item.universityId === params.id));
  const resolvedAdmissions = await Promise.all(
    admissions.map(async (row) => ({
      ...row,
      majorName: (await findMajorById(row.majorId))?.name || row.majorId
    }))
  );

  return (
    <div className="pb-12">
      <SiteHeader />

      <main className="shell mt-6 space-y-6">
        <section className="panel-strong p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {university.tierTags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-4xl font-semibold">{university.name}</h1>
              <p className="mt-2 text-lg text-brand-700 dark:text-brand-200">{university.slogan}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{university.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              {[
                ["院校类型", university.type],
                ["所在城市", university.city],
                ["隶属单位", university.affiliation],
                ["建校时间", `${university.foundedYear} 年`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border bg-white/70 p-4 dark:bg-slate-900/50">
                  <p className="text-xs text-[var(--muted)]">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="panel p-5">
            <Building2 className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-xl font-semibold">大学简介</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {university.name}在{university.city}具有较强区位优势，优势专业包括{university.dominantMajors.join("、")}。
            </p>
          </article>
          <article className="panel p-5">
            <GraduationCap className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-xl font-semibold">热门专业</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{university.dominantMajors.join("、")}</p>
          </article>
          <article className="panel p-5">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-xl font-semibold">升学与就业</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              升学比例约 {university.graduateRate}% ，毕业去向落实率约 {university.employmentRate}%。
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["平均最低分", `${summary.avgMinScore}`],
            ["平均最低位次", formatNumber(summary.avgMinRank)],
            ["平均招生计划", `${summary.avgPlanCount}`]
          ].map(([label, value]) => (
            <article key={label} className="panel p-5">
              <p className="text-xs text-[var(--muted)]">{label}</p>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ScoreTrendChart data={trend as Array<{ year: number; minScore: number }>} title="院校录取趋势" />
          <RankTrendChart data={trend as Array<{ year: number; minRank: number }>} title="院校位次趋势" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="panel-strong overflow-hidden">
            <div className="border-b px-5 py-4">
              <p className="label">专业录取情况</p>
              <h2 className="mt-1 text-xl font-semibold">近年招生计划与录取门槛</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b text-slate-500 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-4 font-medium">专业</th>
                    <th className="px-5 py-4 font-medium">最低分</th>
                    <th className="px-5 py-4 font-medium">最低位次</th>
                    <th className="px-5 py-4 font-medium">招生计划</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedAdmissions.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="px-5 py-4">{row.majorName}</td>
                      <td className="px-5 py-4">{row.minScore}</td>
                      <td className="px-5 py-4">{formatNumber(row.minRank)}</td>
                      <td className="px-5 py-4">{row.planCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <HotMajorChart data={hotMajors} />
        </section>
      </main>
    </div>
  );
}
