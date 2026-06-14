import { NextResponse } from "next/server";
import {
  admissionScores,
  dataCatalogManifest,
  majorCatalog,
  majors,
  provinces,
  universities,
  universityCatalog,
  years
} from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    provinces: provinces.length,
    universities: universities.length,
    majors: majors.length,
    universityCatalog: universityCatalog.length,
    majorCatalog: majorCatalog.length,
    years: years.length,
    records: admissionScores.length,
    manifest: dataCatalogManifest
  });
}
