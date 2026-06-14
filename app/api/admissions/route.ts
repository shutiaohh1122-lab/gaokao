import { NextRequest, NextResponse } from "next/server";
import { getAdmissionsResult } from "@/lib/admission-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provinceId = searchParams.get("provinceId") || "guangdong";
  const year = Number(searchParams.get("year") || "2025");
  const subjectType = searchParams.get("subjectType") || "物理";
  const universityKeyword = searchParams.get("universityKeyword") || "";
  const majorKeyword = searchParams.get("majorKeyword") || "";
  const tierTag = searchParams.get("tierTag") || "";
  const city = searchParams.get("city") || "";
  const sortBy = searchParams.get("sortBy") || "minScore";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "12");

  const payload = await getAdmissionsResult({
    provinceId,
    year,
    subjectType: subjectType as never,
    universityKeyword,
    majorKeyword,
    tierTag,
    city,
    sortBy,
    order,
    page,
    pageSize
  });

  return NextResponse.json(payload);
}
