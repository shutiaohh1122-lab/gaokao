"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getRecommendations, provinces } from "@/lib/mock-data";
import type { RecommendationResult, SubjectType } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function RecommendationPanel() {
  const [provinceId, setProvinceId] = useState("guangdong");
  const [score, setScore] = useState("620");
  const [subjectType, setSubjectType] = useState<SubjectType>("物理");
  const [results, setResults] = useState<RecommendationResult[]>(() =>
    getRecommendations("guangdong", 620, "物理")
  );

  function handleSubmit() {
    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore)) return;
    setResults(getRecommendations(provinceId, parsedScore, subjectType));
  }

  return (
    <section className="panel-strong p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label">智能推荐</p>
          <h2 className="mt-2 section-title">输入分数，生成冲稳保建议</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            基于最近五年 mock 录取数据，按分数、位次波动、院校层次与城市热度给出推荐。
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-4 lg:max-w-3xl">
          <select className="select" value={provinceId} onChange={(event) => setProvinceId(event.target.value)}>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
          <select className="select" value={subjectType} onChange={(event) => setSubjectType(event.target.value as SubjectType)}>
            <option value="物理">物理 / 理科偏向</option>
            <option value="历史">历史</option>
            <option value="理科">理科</option>
            <option value="文科">文科</option>
            <option value="综合">综合</option>
          </select>
          <input
            className="input"
            inputMode="numeric"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            placeholder="输入高考分数"
          />
          <button type="button" className="button-primary gap-2" onClick={handleSubmit}>
            <Sparkles className="h-4 w-4" />
            生成建议
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {results.length ? (
          results.map((item) => (
            <article key={item.type} className="rounded-xl border bg-white p-5 dark:bg-slate-950">
              <div className="chip mb-4">{item.type}</div>
              <h3 className="text-lg font-semibold">{item.universityName}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.majorName}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/70">
                  <p className="text-xs text-[var(--muted)]">参考最低分</p>
                  <p className="mt-1 font-semibold">{item.expectedScore}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/70">
                  <p className="text-xs text-[var(--muted)]">参考最低位次</p>
                  <p className="mt-1 font-semibold">{formatNumber(item.expectedRank)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.reason}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-sm text-[var(--muted)] lg:col-span-3">
            当前条件下没有匹配到推荐结果，可以换一个省份、科类或分数段试试。
          </div>
        )}
      </div>
    </section>
  );
}
