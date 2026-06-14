import { NextRequest, NextResponse } from "next/server";
import { importAdmissionsPayload } from "@/lib/import-service";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await importAdmissionsPayload(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "录取数据导入失败",
        imported: {}
      },
      { status: 400 }
    );
  }
}
