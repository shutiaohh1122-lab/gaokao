import { NextRequest, NextResponse } from "next/server";
import { validateCatalogPayload } from "@/lib/import-validation";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await validateCatalogPayload(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "目录校验失败",
        summary: {
          totalRows: 0,
          validRows: 0,
          errorCount: 0,
          warningCount: 0
        },
        issues: []
      },
      { status: 400 }
    );
  }
}
