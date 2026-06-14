"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Building2, Filter, GraduationCap, LoaderCircle, MapPin, SlidersHorizontal } from "lucide-react";
import type { AdmissionsApiResponse } from "@/lib/api-types";
import { formatNumber } from "@/lib/utils";

export function ResultsClient({
  initialData,
  initialQuery
}: {
  initialData: AdmissionsApiResponse;
  initialQuery: string;
}) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!initialQuery) return;
      setStatus("loading");
      try {
        const response = await fetch(`/api/admissions?${initialQuery}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("查询接口返回异常");
        }
        const payload = (await response.json()) as AdmissionsApiResponse;
        if (!cancelled) {
          setData(payload);
          setStatus("idle");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "查询失败");
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [initialQuery]);

  function makeQuery(overrides: Record<string, string>) {
    const query = new URLSearchParams(initialQuery);
    Object.entries(overrides).forEach(([key, value]) => {
      query.set(key, value);
    });
    return query.toString();
  }

  function makePageLink(nextPage: number) {
    return `/results?${makeQuery({ page: String(nextPage) })}`;
  }

  function makeSortLink(nextSortBy: string) {
    const nextOrder =
      data.filters.sortBy === nextSortBy && data.filters.order === "desc" ? "asc" : "desc";
    return `/results?${makeQuery({
      sortBy: nextSortBy,
      order: nextOrder,
      page: "1"
    })}`;
  }

  const sortOptions = [
    { key: "minScore", label: "最低分" },
    { key: "minRank", label: "最低位次" },
    { key: "planCount", label: "招生人数" },
    { key: "year", label: "年份" }
  ];
  const tierOptions = ["全部", "985", "211", "双一流"];
  const cityOptions = ["全部", "北京", "上海", "广州", "深圳", "南京", "武汉", "成都", "杭州"];
  const scoreRangeOptions = [
    { label: "全部分数", value: "" },
    { label: "650分以上", value: "score-650" },
    { label: "620-649分", value: "score-620" },
    { label: "600-619分", value: "score-600" }
  ];

  function makeFilterLink(key: string, value: string) {
    return `/results?${makeQuery({
      [key]: value === "全部" ? "" : value,
      page: "1"
    })}`;
  }

  return (
    <>
      <section className="panel-strong p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="label">录取结果</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">历年录取数据查询结果</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {data.filters.provinceName || "未知省份"} / {data.filters.year} / {data.filters.subjectType}，共匹配{" "}
              {data.pagination.total} 条记录。
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-3 rounded-xl bg-slate-50/90 p-4 dark:bg-slate-900/60 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs text-[var(--muted)]">查询省份</p>
                <p className="mt-1 font-semibold">{data.filters.provinceName}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">年份 / 科类</p>
                <p className="mt-1 font-semibold">
                  {data.filters.year} / {data.filters.subjectType}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">院校关键词</p>
                <p className="mt-1 font-semibold">{data.filters.universityKeyword || "不限"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">专业关键词</p>
                <p className="mt-1 font-semibold">{data.filters.majorKeyword || "不限"}</p>
              </div>
            </div>

            <Link href="/" className="button-secondary">
              返回筛选
            </Link>
          </div>

          <div className="rounded-xl border bg-white p-4 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <SlidersHorizontal className="h-4 w-4" />
              快捷筛选
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-[var(--muted)]">院校层次</p>
                <div className="flex flex-wrap gap-2">
                  {tierOptions.map((item) => {
                    const active = (data.filters.tierTag || "全部") === item;
                    return (
                      <Link
                        key={item}
                        href={makeFilterLink("tierTag", item)}
                        className={
                          active
                            ? "inline-flex h-9 items-center rounded-full bg-brand-600 px-3 text-xs font-semibold text-white"
                            : "inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        }
                      >
                        {item}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-[var(--muted)]">热门城市</p>
                <div className="flex flex-wrap gap-2">
                  {cityOptions.map((item) => {
                    const active = (data.filters.city || "全部") === item;
                    return (
                      <Link
                        key={item}
                        href={makeFilterLink("city", item)}
                        className={
                          active
                            ? "inline-flex h-9 items-center rounded-full bg-brand-600 px-3 text-xs font-semibold text-white"
                            : "inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        }
                      >
                        {item}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-[var(--muted)]">常用分数段入口</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {scoreRangeOptions.map((item) => (
                    <div key={item.label} className="rounded-xl border bg-slate-50/80 px-3 py-3 text-xs text-[var(--muted)] dark:bg-slate-900/70">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</p>
                      <p className="mt-1">下一步适合接入按分数段筛选结果。</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 dark:bg-slate-950 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Filter className="h-4 w-4" />
              排序方式
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((item) => {
                const isActive = data.filters.sortBy === item.key;
                return (
                  <Link
                    key={item.key}
                    href={makeSortLink(item.key)}
                    className={
                      isActive
                        ? "inline-flex h-9 items-center gap-1 rounded-full bg-brand-600 px-3 text-xs font-semibold text-white"
                        : "inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    }
                  >
                    {item.label}
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {status === "loading" ? (
        <section className="panel-strong flex items-center justify-center gap-3 p-10 text-sm text-[var(--muted)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          正在加载最新查询结果...
        </section>
      ) : null}

      {status === "error" ? (
        <section className="panel-strong p-6 text-sm text-rose-600 dark:text-rose-300">{errorMessage}</section>
      ) : null}

      {data.items.length ? (
        <>
          <section className="table-shell hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr className="border-b text-slate-500 dark:text-slate-300">
                    {[
                      ["year", "年份"],
                      ["province", "省份"],
                      ["university", "大学"],
                      ["major", "专业"],
                      ["minScore", "最低分"],
                      ["minRank", "最低位次"],
                      ["planCount", "招生人数"]
                    ].map(([key, label]) => (
                      <th key={key} className="px-4 py-3.5 font-medium">
                        {["minScore", "minRank", "planCount", "year"].includes(key) ? (
                          <Link href={makeSortLink(key)} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                            {label}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-900/70">
                      <td className="px-4 py-4 font-medium">{row.year}</td>
                      <td className="px-4 py-4">{row.provinceName}</td>
                      <td className="px-4 py-4">
                        <Link className="font-semibold hover:text-brand-600" href={`/universities/${row.universityId}`}>
                          {row.universityName}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">{row.universityTags.join(" / ") || "普通本科"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Link className="font-semibold hover:text-brand-600" href={`/majors/${row.majorId}`}>
                          {row.majorName}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">{row.batch}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{row.minScore}</div>
                        <div className="text-xs text-[var(--muted)]">平均分 {row.avgScore}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{formatNumber(row.minRank)}</div>
                        <div className="text-xs text-[var(--muted)]">平均位次 {formatNumber(row.avgRank)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{row.planCount}</div>
                        <div className="text-xs text-[var(--muted)]">录取 {row.admittedCount}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-3 lg:hidden">
            {data.items.map((row) => (
              <article key={`${row.id}-mobile`} className="panel overflow-hidden p-0">
                <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/universities/${row.universityId}`} className="block truncate text-base font-semibold hover:text-brand-600">
                        {row.universityName}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--muted)]">{row.majorName}</p>
                    </div>
                    <div className="chip shrink-0">{row.subjectType}</div>
                  </div>
                </div>

                <div className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                      <p className="text-xs text-[var(--muted)]">最低分</p>
                      <p className="mt-1 font-semibold">{row.minScore}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                      <p className="text-xs text-[var(--muted)]">最低位次</p>
                      <p className="mt-1 font-semibold">{formatNumber(row.minRank)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                      <p className="text-xs text-[var(--muted)]">年份</p>
                      <p className="mt-1 font-semibold">{row.year}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                      <p className="text-xs text-[var(--muted)]">招生人数</p>
                      <p className="mt-1 font-semibold">{row.planCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-[var(--muted)]">
                    <div className="flex items-center justify-between">
                      <span>录取批次</span>
                      <span>{row.batch}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>院校层次</span>
                      <span>{row.universityTags.join(" / ") || "普通本科"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>平均分 / 平均位次</span>
                      <span>
                        {row.avgScore} / {formatNumber(row.avgRank)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>省份</span>
                      <span>{row.provinceName}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/universities/${row.universityId}`} className="button-secondary h-10 flex-1 px-0">
                      院校详情
                    </Link>
                    <Link href={`/majors/${row.majorId}`} className="button-primary h-10 flex-1 px-0">
                      专业详情
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 text-sm dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[var(--muted)]">
              第 {data.pagination.page} / {data.pagination.totalPages} 页，共 {data.pagination.total} 条
            </p>
            <div className="flex gap-3">
              <Link
                href={makePageLink(Math.max(1, data.pagination.page - 1))}
                className="button-secondary h-10 px-4"
                aria-disabled={data.pagination.page === 1}
              >
                上一页
              </Link>
              <Link
                href={makePageLink(Math.min(data.pagination.totalPages, data.pagination.page + 1))}
                className="button-primary h-10 px-4"
                aria-disabled={data.pagination.page === data.pagination.totalPages}
              >
                下一页
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section className="panel-strong p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">暂无匹配数据</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">可以尝试放宽院校或专业关键词，或者切换年份与科类重新查询。</p>
          <Link href="/" className="button-primary mt-6 inline-flex">
            返回首页
          </Link>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: GraduationCap,
            title: "专业筛选扩展",
            desc: "后续可继续扩展专业门类、选科要求、就业方向等高级筛选。"
          },
          {
            icon: MapPin,
            title: "区域条件扩展",
            desc: "后续适合增加城市、学费区间、办学层次和院校类型组合筛选。"
          },
          {
            icon: Building2,
            title: "院校对比能力",
            desc: "下一版很适合增加院校对比抽屉，支持多校并排比较分数与位次。"
          }
        ].map((card) => (
          <article key={card.title} className="panel p-5">
            <card.icon className="h-5 w-5 text-brand-600" />
            <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.desc}</p>
          </article>
        ))}
      </section>
    </>
  );
}
