import { prisma } from "@/lib/prisma";

type LookupTables = {
  provinceIdSet: Set<string>;
  universityIdSet: Set<string>;
  majorIdSet: Set<string>;
  provinceNameToId: Map<string, string>;
  universityNameToId: Map<string, string>;
  majorNameToId: Map<string, string>;
};

function normalizeText(value: unknown) {
  return String(value || "").trim().replace(/\s+/g, "");
}

export async function buildLookupTables(): Promise<LookupTables> {
  const [provinceRows, universityRows, majorRows] = await Promise.all([
    prisma.province.findMany({ select: { id: true, name: true } }),
    prisma.university.findMany({ select: { id: true, name: true } }),
    prisma.major.findMany({ select: { id: true, name: true } })
  ]);

  return {
    provinceIdSet: new Set(provinceRows.map((item) => item.id)),
    universityIdSet: new Set(universityRows.map((item) => item.id)),
    majorIdSet: new Set(majorRows.map((item) => item.id)),
    provinceNameToId: new Map(provinceRows.map((item) => [normalizeText(item.name), item.id])),
    universityNameToId: new Map(universityRows.map((item) => [normalizeText(item.name), item.id])),
    majorNameToId: new Map(majorRows.map((item) => [normalizeText(item.name), item.id]))
  };
}

export function resolveSuggestedIdByName(
  row: Record<string, unknown>,
  options: {
    idField: string;
    nameFieldCandidates: string[];
    idSet: Set<string>;
    nameToId: Map<string, string>;
  }
) {
  const existingId = normalizeText(row[options.idField]);
  if (existingId && options.idSet.has(existingId)) {
    return { resolvedId: existingId, matchedBy: "id" as const };
  }

  for (const field of options.nameFieldCandidates) {
    const normalizedName = normalizeText(row[field]);
    if (!normalizedName) continue;
    const suggestion = options.nameToId.get(normalizedName);
    if (suggestion) {
      return { resolvedId: suggestion, matchedBy: field };
    }
  }

  return { resolvedId: "", matchedBy: "" };
}
