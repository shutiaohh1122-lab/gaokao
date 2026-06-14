import { prisma } from "@/lib/prisma";
import type { ValidationApiResponse, ValidationIssue } from "@/lib/api-types";
import { buildLookupTables, resolveSuggestedIdByName } from "@/lib/import-match";
import { admissionFieldDefinitions, catalogFieldDefinitions } from "@/lib/import-mapping";

type GenericRow = Record<string, unknown>;

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function makeSummary(totalRows: number, issues: ValidationIssue[]) {
  const errorRows = new Set(issues.filter((issue) => issue.level === "error").map((issue) => issue.rowIndex));
  const errorCount = issues.filter((issue) => issue.level === "error").length;
  const warningCount = issues.filter((issue) => issue.level === "warning").length;

  return {
    totalRows,
    validRows: Math.max(0, totalRows - errorRows.size),
    errorCount,
    warningCount
  };
}

function validateRequiredFields(rows: GenericRow[], fields: Array<{ key: string; required: boolean; label: string }>) {
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    fields.forEach((field) => {
      if (field.required && !hasValue(row[field.key])) {
        issues.push({
          rowIndex: index + 1,
          level: "error",
          field: field.key,
          code: "REQUIRED_MISSING",
          message: `${field.label} 不能为空`
        });
      }
    });
  });

  return issues;
}

function validateDuplicates(rows: GenericRow[], key: string, label: string) {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number>();

  rows.forEach((row, index) => {
    const value = String(row[key] || "").trim();
    if (!value) return;
    if (seen.has(value)) {
      issues.push({
        rowIndex: index + 1,
        level: "error",
        field: key,
        code: "DUPLICATE_VALUE",
        message: `${label} 重复，和第 ${seen.get(value)} 行冲突`
      });
      return;
    }
    seen.set(value, index + 1);
  });

  return issues;
}

function validateNumericFields(rows: GenericRow[], numericKeys: string[]) {
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    numericKeys.forEach((key) => {
      const value = row[key];
      if (value === undefined || value === null || value === "") return;
      if (typeof value !== "number" || Number.isNaN(value)) {
        issues.push({
          rowIndex: index + 1,
          level: "error",
          field: key,
          code: "INVALID_NUMBER",
          message: `${key} 需要是数字`
        });
      }
    });
  });

  return issues;
}

export async function validateCatalogPayload(payload: {
  provinces?: GenericRow[];
  universities?: GenericRow[];
  majors?: GenericRow[];
}): Promise<ValidationApiResponse> {
  const provinces = payload.provinces || [];
  const universities = payload.universities || [];
  const majors = payload.majors || [];

  let rows = provinces;
  let fields: Array<{ key: string; required: boolean; label: string }> = [...catalogFieldDefinitions.provinces];
  let duplicateKey = "id";
  let duplicateLabel = "省份 ID";
  let typeLabel = "省份目录";

  if (universities.length) {
    rows = universities;
    fields = [...catalogFieldDefinitions.universities];
    duplicateKey = "id";
    duplicateLabel = "学校 ID";
    typeLabel = "院校目录";
  } else if (majors.length) {
    rows = majors;
    fields = [...catalogFieldDefinitions.majors];
    duplicateKey = "id";
    duplicateLabel = "专业 ID";
    typeLabel = "专业目录";
  }

  const issues = [
    ...validateRequiredFields(rows, fields),
    ...validateDuplicates(rows, duplicateKey, duplicateLabel)
  ];

  return {
    ok: !issues.some((issue) => issue.level === "error"),
    message: `${typeLabel} 校验完成`,
    summary: makeSummary(rows.length, issues),
    issues
  };
}

export async function validateAdmissionsPayload(payload: { admissions?: GenericRow[] }): Promise<ValidationApiResponse> {
  const admissions = payload.admissions || [];
  const issues: ValidationIssue[] = [
    ...validateRequiredFields(admissions, [...admissionFieldDefinitions]),
    ...validateDuplicates(admissions, "id", "记录 ID"),
    ...validateNumericFields(admissions, [
      "year",
      "planCount",
      "admittedCount",
      "minScore",
      "avgScore",
      "maxScore",
      "minRank",
      "avgRank",
      "provinceControlLine",
      "scoreGap"
    ])
  ];

  const lookups = await buildLookupTables();

  admissions.forEach((row, index) => {
    const provinceId = String(row.provinceId || "").trim();
    const universityId = String(row.universityId || "").trim();
    const majorId = String(row.majorId || "").trim();
    const provinceResolution = resolveSuggestedIdByName(row, {
      idField: "provinceId",
      nameFieldCandidates: ["provinceName", "province", "省份", "生源地"],
      idSet: lookups.provinceIdSet,
      nameToId: lookups.provinceNameToId
    });
    const universityResolution = resolveSuggestedIdByName(row, {
      idField: "universityId",
      nameFieldCandidates: ["universityName", "university", "schoolName", "学校名称", "院校名称"],
      idSet: lookups.universityIdSet,
      nameToId: lookups.universityNameToId
    });
    const majorResolution = resolveSuggestedIdByName(row, {
      idField: "majorId",
      nameFieldCandidates: ["majorName", "major", "专业名称"],
      idSet: lookups.majorIdSet,
      nameToId: lookups.majorNameToId
    });

    if (provinceId && !lookups.provinceIdSet.has(provinceId)) {
      issues.push({
        rowIndex: index + 1,
        level: "error",
        field: "provinceId",
        code: "PROVINCE_NOT_FOUND",
        message: `省份 ID ${provinceId} 不存在，请先导入省份目录`,
        suggestion: provinceResolution.resolvedId
          ? `可尝试改为 ${provinceResolution.resolvedId}（依据名称字段自动匹配）`
          : undefined,
        suggestionValue: provinceResolution.resolvedId || undefined
      });
    } else if (!provinceId && provinceResolution.resolvedId) {
      issues.push({
        rowIndex: index + 1,
        level: "warning",
        field: "provinceId",
        code: "PROVINCE_ID_SUGGESTED",
        message: "省份 ID 缺失，但可根据名称自动匹配",
        suggestion: `建议填入 ${provinceResolution.resolvedId}`,
        suggestionValue: provinceResolution.resolvedId
      });
    }

    if (universityId && !lookups.universityIdSet.has(universityId)) {
      issues.push({
        rowIndex: index + 1,
        level: "error",
        field: "universityId",
        code: "UNIVERSITY_NOT_FOUND",
        message: `学校 ID ${universityId} 不存在，请先导入院校目录`,
        suggestion: universityResolution.resolvedId
          ? `可尝试改为 ${universityResolution.resolvedId}（依据名称字段自动匹配）`
          : undefined,
        suggestionValue: universityResolution.resolvedId || undefined
      });
    } else if (!universityId && universityResolution.resolvedId) {
      issues.push({
        rowIndex: index + 1,
        level: "warning",
        field: "universityId",
        code: "UNIVERSITY_ID_SUGGESTED",
        message: "学校 ID 缺失，但可根据名称自动匹配",
        suggestion: `建议填入 ${universityResolution.resolvedId}`,
        suggestionValue: universityResolution.resolvedId
      });
    }

    if (majorId && !lookups.majorIdSet.has(majorId)) {
      issues.push({
        rowIndex: index + 1,
        level: "error",
        field: "majorId",
        code: "MAJOR_NOT_FOUND",
        message: `专业 ID ${majorId} 不存在，请先导入专业目录`,
        suggestion: majorResolution.resolvedId
          ? `可尝试改为 ${majorResolution.resolvedId}（依据名称字段自动匹配）`
          : undefined,
        suggestionValue: majorResolution.resolvedId || undefined
      });
    } else if (!majorId && majorResolution.resolvedId) {
      issues.push({
        rowIndex: index + 1,
        level: "warning",
        field: "majorId",
        code: "MAJOR_ID_SUGGESTED",
        message: "专业 ID 缺失，但可根据名称自动匹配",
        suggestion: `建议填入 ${majorResolution.resolvedId}`,
        suggestionValue: majorResolution.resolvedId
      });
    }
  });

  return {
    ok: !issues.some((issue) => issue.level === "error"),
    message: "录取数据校验完成",
    summary: makeSummary(admissions.length, issues),
    issues
  };
}
