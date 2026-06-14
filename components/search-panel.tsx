"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CatalogApiResponse, CatalogSearchItem } from "@/lib/api-types";
import { provinces, years } from "@/lib/mock-data";
import type { SubjectType } from "@/lib/types";

export function SearchPanel() {
  const [provinceId, setProvinceId] = useState("guangdong");
  const [year, setYear] = useState(String(years[0].value));
  const [subjectType, setSubjectType] = useState<SubjectType>("物理");
  const [universityKeyword, setUniversityKeyword] = useState("");
  const [majorKeyword, setMajorKeyword] = useState("");
  const [universitySuggestions, setUniversitySuggestions] = useState<CatalogSearchItem[]>([]);
  const [majorSuggestions, setMajorSuggestions] = useState<CatalogSearchItem[]>([]);

  const subjectOptions = useMemo(() => {
    const province = provinces.find((item) => item.id === provinceId);
    return (province?.subjects || ["物理", "历史"]) as SubjectType[];
  }, [provinceId]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!universityKeyword.trim()) {
        setUniversitySuggestions([]);
        return;
      }
      const response = await fetch(`/api/catalog/universities?keyword=${encodeURIComponent(universityKeyword)}`);
      const payload = (await response.json()) as CatalogApiResponse;
      setUniversitySuggestions(payload.items);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [universityKeyword]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!majorKeyword.trim()) {
        setMajorSuggestions([]);
        return;
      }
      const response = await fetch(`/api/catalog/majors?keyword=${encodeURIComponent(majorKeyword)}`);
      const payload = (await response.json()) as CatalogApiResponse;
      setMajorSuggestions(payload.items);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [majorKeyword]);

  function handleProvinceChange(nextProvinceId: string) {
    setProvinceId(nextProvinceId);
    const province = provinces.find((item) => item.id === nextProvinceId);
    const defaultSubject = ((province?.subjects || ["物理", "历史"])[0] || "物理") as SubjectType;
    setSubjectType(defaultSubject);
  }

  const query = new URLSearchParams({
    provinceId,
    year,
    subjectType,
    universityKeyword,
    majorKeyword
  }).toString();

  return (
    <section className="panel-strong p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label">查询工作台</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">按条件快速检索录取数据</h2>
          </div>
          <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-200">
            支持院校 / 专业关键词联想
          </div>
        </div>
        <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-3">
          <span>按省份、年份、科类筛选</span>
          <span>支持院校和专业名称检索</span>
          <span>结果页可继续排序与分页</span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">省份</label>
            <select className="select" value={provinceId} onChange={(event) => handleProvinceChange(event.target.value)}>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">年份</label>
            <select className="select" value={year} onChange={(event) => setYear(event.target.value)}>
              {years.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">科类</label>
            <select
              className="select"
              value={subjectType}
              onChange={(event) => setSubjectType(event.target.value as SubjectType)}
            >
              {subjectOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">院校名称</label>
            <input
              className="input"
              placeholder="例如：中山大学"
              value={universityKeyword}
              onChange={(event) => setUniversityKeyword(event.target.value)}
            />
            {universitySuggestions.length ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-xl border bg-white p-2 shadow-soft dark:bg-slate-950">
                {universitySuggestions.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-start justify-between rounded-xl px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => {
                      setUniversityKeyword(item.name);
                      setUniversitySuggestions([]);
                    }}
                  >
                    <span>
                      <span className="block text-sm font-medium">{item.name}</span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">{item.subtitle}</span>
                    </span>
                    <span className="chip">{item.tags[0] || item.source}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">专业名称</label>
            <input
              className="input"
              placeholder="例如：计算机科学与技术"
              value={majorKeyword}
              onChange={(event) => setMajorKeyword(event.target.value)}
            />
            {majorSuggestions.length ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-xl border bg-white p-2 shadow-soft dark:bg-slate-950">
                {majorSuggestions.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-start justify-between rounded-xl px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => {
                      setMajorKeyword(item.name);
                      setMajorSuggestions([]);
                    }}
                  >
                    <span>
                      <span className="block text-sm font-medium">{item.name}</span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">{item.subtitle}</span>
                    </span>
                    <span className="chip">{item.tags[0] || item.source}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 rounded-xl bg-slate-50/90 p-4 dark:bg-slate-900/60 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-3 sm:gap-4">
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">查询维度</p>
              <p className="mt-1">省份 / 年份 / 科类</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">结果能力</p>
              <p className="mt-1">排序 / 分页 / 关键词筛选</p>
            </div>
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-200">详情能力</p>
              <p className="mt-1">院校趋势 / 专业走势</p>
            </div>
          </div>

          <Link href={`/results?${query}`} className="button-primary gap-2 lg:min-w-[160px]">
            <Search className="h-4 w-4" />
            查询录取数据
          </Link>
        </div>
      </div>
    </section>
  );
}
