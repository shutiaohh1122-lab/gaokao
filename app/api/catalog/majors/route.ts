import { NextRequest, NextResponse } from "next/server";
import { getMajorsData } from "@/lib/data-source";
import type { CatalogApiResponse } from "@/lib/api-types";

export async function GET(request: NextRequest) {
  const keyword = (request.nextUrl.searchParams.get("keyword") || "").trim();
  const majors = await getMajorsData();

  const items = majors
    .filter((item) => !keyword || item.name.includes(keyword) || item.category.includes(keyword))
    .slice(0, 20)
    .map((item) => ({
      id: item.id,
      name: item.name,
      subtitle: `${item.category} · ${item.degree}`,
      tags: [item.duration, item.subjectRequirements],
      source: process.env.DATA_SOURCE === "database" ? "database" : "mock"
    }));

  const payload: CatalogApiResponse = {
    items,
    total: items.length,
    keyword
  };

  return NextResponse.json(payload);
}
