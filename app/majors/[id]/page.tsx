import { notFound } from "next/navigation";
import { BriefcaseBusiness, BookOpenText, LineChart } from "lucide-react";
import { RankTrendChart, ScoreTrendChart } from "@/components/charts";
import { SiteHeader } from "@/components/site-header";
import { getMajorTrend } from "@/lib/mock-data";
import { findMajorById, findProvinceById, findUniversityById, getAllAdmissionsData } from "@/lib/data-source";
import { formatNumber } from "@/lib/utils";

type MajorPageProps = {
  params: { id: string };
};

export default async function MajorDetailPage({ params }: MajorPageProps) {
  const major = await findMajorById(params.id);
  if (!major) notFound();

  const allAdmissions = await getAllAdmissionsData();
  const admissions = allAdmissions.filter((item) => item.majorId === params.id).slice(0, 8);
  const trend = getMajorTrend(params.id, "guangdong", "物理");
  const resolvedAdmissions = await Promise.all(
    admissions.map(async (row) => ({
      ...row,
      universityName: (await findUniversityById(row.universityId))?.name || row.universityId,
      provinceName: (await findProvinceById(row.provinceId))?.name || row.provinceId
    }))
  );

  return (
    <div className="pb-12">
      <SiteHeader />

      <main className="shell mt-6 space-y-6">
        <section className="panel-strong p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="chip">{major.category}</span>
            <span className="chip">{major.degree}</span>
            <span className="chip">{major.duration}</span>
            <span className="chip">热度 {major.heat}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold">{major.name}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">{major.overview}</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="panel p-5">
            <BookOpenText className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-xl font-semibold">专业介绍</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              学制 {major.duration}，学费约 {formatNumber(major.tuition)} 元/年，选科要求为 {major.subjectRequirements}。
            </p>
          </article>
          <article className="panel p-5">
            <BriefcaseBusiness className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-xl font-semibold">就业方向</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{major.careers.join("、")}</p>
          </article>
          <article className="panel p-5">
            <LineChart className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-xl font-semibold">核心课程</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{major.courses.join("、")}</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ScoreTrendChart data={trend as Array<{ year: number; minScore: number }>} title="专业分数趋势图" />
          <RankTrendChart data={trend as Array<{ year: number; minRank: number }>} title="专业位次趋势图" />
        </section>

        <section className="panel-strong overflow-hidden">
          <div className="border-b px-5 py-4">
            <p className="label">历年录取分数</p>
            <h2 className="mt-1 text-xl font-semibold">各院校同专业录取样本</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b text-slate-500 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4 font-medium">院校</th>
                  <th className="px-5 py-4 font-medium">省份</th>
                  <th className="px-5 py-4 font-medium">年份</th>
                  <th className="px-5 py-4 font-medium">最低分</th>
                  <th className="px-5 py-4 font-medium">最低位次</th>
                </tr>
              </thead>
              <tbody>
                {resolvedAdmissions.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-5 py-4">{row.universityName}</td>
                    <td className="px-5 py-4">{row.provinceName}</td>
                    <td className="px-5 py-4">{row.year}</td>
                    <td className="px-5 py-4">{row.minScore}</td>
                    <td className="px-5 py-4">{formatNumber(row.minRank)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
