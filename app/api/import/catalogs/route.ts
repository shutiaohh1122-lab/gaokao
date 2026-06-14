import { NextRequest, NextResponse } from "next/server";
import { importCatalogPayload } from "@/lib/import-service";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await importCatalogPayload(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "目录导入失败",
        imported: {}
      },
      { status: 400 }
    );
  }
}
