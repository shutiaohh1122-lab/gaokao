import { NextRequest, NextResponse } from "next/server";
import { getUniversitiesData } from "@/lib/data-source";
import type { CatalogApiResponse } from "@/lib/api-types";

export async function GET(request: NextRequest) {
  const keyword = (request.nextUrl.searchParams.get("keyword") || "").trim();
  const universities = await getUniversitiesData();

  const items = universities
    .filter((item) => !keyword || item.name.includes(keyword) || item.city.includes(keyword))
    .slice(0, 20)
    .map((item) => ({
      id: item.id,
      name: item.name,
      subtitle: `${item.city} · ${item.type}`,
      tags: item.tierTags,
      source: process.env.DATA_SOURCE === "database" ? "database" : "mock"
    }));

  const payload: CatalogApiResponse = {
    items,
    total: items.length,
    keyword
  };

  return NextResponse.json(payload);
}
