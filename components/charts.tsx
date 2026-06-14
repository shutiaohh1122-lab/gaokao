"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const chartColors = ["#3568db", "#2fae97", "#f4b95e", "#e97354", "#6b7fd7", "#1e9ac5"];

export function ScoreTrendChart({
  data,
  title = "分数趋势"
}: {
  data: Array<{ year: number; minScore: number }>;
  title?: string;
}) {
  return (
    <div className="panel p-5 sm:p-6">
      <div className="mb-4">
        <p className="label">{title}</p>
        <h3 className="mt-1 text-lg font-semibold">最低分变化</h3>
      </div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="minScore" stroke="#3568db" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RankTrendChart({
  data,
  title = "位次趋势"
}: {
  data: Array<{ year: number; minRank: number }>;
  title?: string;
}) {
  return (
    <div className="panel p-5 sm:p-6">
      <div className="mb-4">
        <p className="label">{title}</p>
        <h3 className="mt-1 text-lg font-semibold">最低位次变化</h3>
      </div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis reversed stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="minRank" stroke="#2fae97" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HotMajorChart({ data }: { data: Array<{ name: string; heat: number }> }) {
  return (
    <div className="panel p-5 sm:p-6">
      <div className="mb-4">
        <p className="label">热门专业</p>
        <h3 className="mt-1 text-lg font-semibold">专业热度分布</h3>
      </div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={72} />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="heat" radius={[12, 12, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProvinceComparisonChart({ data }: { data: Array<{ province: string; averageScore: number }> }) {
  return (
    <div className="panel p-5 sm:p-6">
      <div className="mb-4">
        <p className="label">区域比较</p>
        <h3 className="mt-1 text-lg font-semibold">各省录取对比</h3>
      </div>
      <div className="h-56 sm:h-64 lg:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.24)" />
            <XAxis dataKey="province" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageScore" fill="#3568db" radius={[12, 12, 0, 0]} name="平均最低分" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
