"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import type { ImportApiResponse, ValidationApiResponse } from "@/lib/api-types";

type MappingField = {
  key: string;
  label: string;
  required: boolean;
};

type ParsedRow = Record<string, string>;
type ParsedSheet = {
  name: string;
  rows: ParsedRow[];
  headers: string[];
};

function normalizeValue(fieldKey: string, value: string) {
  if (fieldKey === "subjects" || fieldKey === "tierTags") {
    return value
      .split(/[,，/|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (
    ["year", "foundedYear", "tuition", "heat", "planCount", "admittedCount", "minScore", "avgScore", "maxScore", "minRank", "avgRank", "provinceControlLine", "scoreGap"].includes(
      fieldKey
    )
  ) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  return value.trim();
}

function scoreSectionMatch(headers: string[], section: { key: string; fields: MappingField[] }) {
  const lowerHeaders = headers.map((header) => header.toLowerCase());
  return section.fields.reduce((score, field) => {
    const fieldKey = field.key.toLowerCase();
    const fieldLabel = field.label.toLowerCase();
    const matched = lowerHeaders.some(
      (header) => header.includes(fieldKey) || header.includes(fieldLabel) || fieldLabel.includes(header)
    );
    return score + (matched ? (field.required ? 3 : 1) : 0);
  }, 0);
}

function parseSpreadsheet(file: File): Promise<ParsedSheet[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = reader.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheets = workbook.SheetNames.map((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: ""
          });
          const normalizedRows = rows.map((row) =>
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => [key, String(value ?? "")])
            )
          );
          return {
            name: sheetName,
            rows: normalizedRows,
            headers: normalizedRows.length ? Object.keys(normalizedRows[0]) : []
          };
        });
        resolve(sheets);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsBinaryString(file);
  });
}

export function FileImportMapper({
  title,
  description,
  endpoint,
  payloadKey,
  sections
}: {
  title: string;
  description: string;
  endpoint: string;
  payloadKey: string;
  sections: Array<{
    key: string;
    label: string;
    fields: MappingField[];
  }>;
}) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState("");
  const [selectedSectionKey, setSelectedSectionKey] = useState(sections[0]?.key || "");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [appliedOverrides, setAppliedOverrides] = useState<Record<number, Record<string, string>>>({});
  const [result, setResult] = useState<ImportApiResponse | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState<"all" | "validOnly">("all");

  const selectedSection = useMemo(
    () => sections.find((section) => section.key === selectedSectionKey) || sections[0],
    [sections, selectedSectionKey]
  );

  const selectedSheet = useMemo(
    () => sheets.find((sheet) => sheet.name === selectedSheetName) || sheets[0],
    [selectedSheetName, sheets]
  );

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const transformedRows = useMemo(() => {
    if (!selectedSection) return [];
    return rows.map((row, rowIndex) => {
      const mapped = Object.fromEntries(
        selectedSection.fields
          .filter((field) => mapping[field.key])
          .map((field) => [field.key, normalizeValue(field.key, row[mapping[field.key]] || "")])
          .filter(([, value]) => value !== undefined && value !== "")
      );
      return {
        ...mapped,
        ...(appliedOverrides[rowIndex] || {})
      };
    });
  }, [appliedOverrides, mapping, rows, selectedSection]);

  const invalidRowIndexes = useMemo(() => {
    return Array.from(new Set((validationResult?.issues || []).map((issue) => issue.rowIndex - 1))).sort((a, b) => a - b);
  }, [validationResult]);

  const errorRowIndexes = useMemo(() => {
    return new Set(
      (validationResult?.issues || [])
        .filter((issue) => issue.level === "error")
        .map((issue) => issue.rowIndex - 1)
    );
  }, [validationResult]);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    const parsedSheets = await parseSpreadsheet(file);
    const firstSheet = parsedSheets[0];
    setSheets(parsedSheets);
    setSelectedSheetName(firstSheet?.name || "");
    setRows(firstSheet?.rows || []);
    setHeaders(firstSheet?.headers || []);
    setResult(null);
    setValidationResult(null);
    setAppliedOverrides({});
    if (firstSheet) {
      const bestSection = [...sections]
        .map((section) => ({
          key: section.key,
          score: scoreSectionMatch(firstSheet.headers, section)
        }))
        .sort((left, right) => right.score - left.score)[0];
      if (bestSection) {
        setSelectedSectionKey(bestSection.key);
      }
    }
  }

  function handleSheetChange(nextSheetName: string) {
    setSelectedSheetName(nextSheetName);
    const nextSheet = sheets.find((sheet) => sheet.name === nextSheetName);
    setRows(nextSheet?.rows || []);
    setHeaders(nextSheet?.headers || []);
    setResult(null);
    setValidationResult(null);
    setAppliedOverrides({});
    if (nextSheet) {
      const bestSection = [...sections]
        .map((section) => ({
          key: section.key,
          score: scoreSectionMatch(nextSheet.headers, section)
        }))
        .sort((left, right) => right.score - left.score)[0];
      if (bestSection) {
        setSelectedSectionKey(bestSection.key);
      }
    }
  }

  function buildPayload() {
    const rowsToImport =
      importMode === "validOnly" && validationResult
        ? transformedRows.filter((_, index) => !errorRowIndexes.has(index))
        : transformedRows;

    return {
      [payloadKey]:
        payloadKey === "admissions"
          ? rowsToImport
          : {
              provinces: selectedSection?.key === "provinces" ? rowsToImport : [],
              universities: selectedSection?.key === "universities" ? rowsToImport : [],
              majors: selectedSection?.key === "majors" ? rowsToImport : []
            }
    };
  }

  async function handleValidate() {
    if (!selectedSection) return;
    setLoading(true);
    setResult(null);
    try {
      const payload = buildPayload();
      const response = await fetch(`${endpoint}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payloadKey === "admissions" ? payload : payload[payloadKey as keyof typeof payload])
      });
      const data = (await response.json()) as ValidationApiResponse;
      setValidationResult(data);
    } catch (error) {
      setValidationResult({
        ok: false,
        message: error instanceof Error ? error.message : "校验失败",
        summary: {
          totalRows: 0,
          validRows: 0,
          errorCount: 0,
          warningCount: 0
        },
        issues: []
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const payload = buildPayload();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payloadKey === "admissions" ? payload : payload[payloadKey as keyof typeof payload])
      });
      const data = (await response.json()) as ImportApiResponse;
      const skippedCount =
        importMode === "validOnly" && validationResult ? errorRowIndexes.size : 0;
      setResult(data);
      setResult({
        ...data,
        imported: {
          ...data.imported,
          skipped: skippedCount
        }
      });
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : "导入失败",
        imported: {}
      });
    } finally {
      setLoading(false);
    }
  }

  function handleApplySuggestions() {
    if (!validationResult?.issues.length) return;
    const nextOverrides: Record<number, Record<string, string>> = { ...appliedOverrides };
    validationResult.issues.forEach((issue) => {
      if (!issue.suggestionValue) return;
      const rowIndex = issue.rowIndex - 1;
      nextOverrides[rowIndex] = {
        ...(nextOverrides[rowIndex] || {}),
        [issue.field]: issue.suggestionValue
      };
    });
    setAppliedOverrides(nextOverrides);
  }

  function handleExportInvalidRows() {
    if (!invalidRowIndexes.length) return;
    const exportedRows = invalidRowIndexes.map((index) => {
      const rawRow = rows[index] || {};
      const rowIssues = (validationResult?.issues || [])
        .filter((issue) => issue.rowIndex - 1 === index)
        .map((issue) => `${issue.field}: ${issue.message}${issue.suggestion ? ` | 建议: ${issue.suggestion}` : ""}`)
        .join(" || ");
      return {
        ...rawRow,
        __issues: rowIssues
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "invalid_rows");
    XLSX.writeFile(workbook, "gaokao-import-invalid-rows.xlsx");
  }

  return (
    <article className="panel-strong p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label">{title}</p>
          <h2 className="mt-1 text-2xl font-semibold">{description}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="button-secondary cursor-pointer px-4">
            选择 CSV / Excel
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
            />
          </label>
          <button type="button" className="button-secondary" onClick={handleValidate} disabled={!rows.length || loading}>
            {loading ? "处理中..." : "先校验"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={handleApplySuggestions}
            disabled={!validationResult?.issues.some((issue) => issue.suggestionValue)}
          >
            应用建议
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={handleExportInvalidRows}
            disabled={!invalidRowIndexes.length}
          >
            导出问题行
          </button>
          <button type="button" className="button-primary" onClick={handleSubmit} disabled={!rows.length || loading}>
            {loading ? "导入中..." : "确认导入"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {sheets.length > 1 ? (
          <div className="min-w-[220px]">
            <label className="mb-2 block text-sm font-medium">工作表</label>
            <select
              className="select h-10"
              value={selectedSheetName}
              onChange={(event) => handleSheetChange(event.target.value)}
            >
              {sheets.map((sheet) => (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name} ({sheet.rows.length} 行)
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <button
          type="button"
          className={importMode === "all" ? "button-primary h-10 px-4" : "button-secondary h-10 px-4"}
          onClick={() => setImportMode("all")}
        >
          导入全部映射行
        </button>
        <button
          type="button"
          className={importMode === "validOnly" ? "button-primary h-10 px-4" : "button-secondary h-10 px-4"}
          onClick={() => setImportMode("validOnly")}
          disabled={!validationResult}
        >
          仅导入校验通过行
        </button>
        <span className="self-center text-sm text-[var(--muted)]">
          {importMode === "validOnly"
            ? `当前将跳过 ${errorRowIndexes.size} 行错误数据`
            : "当前会提交所有映射后的行"}
        </span>
        {selectedSheet ? (
          <span className="self-center text-sm text-[var(--muted)]">
            当前工作表：{selectedSheet.name}
          </span>
        ) : null}
        {selectedSection ? (
          <span className="self-center text-sm text-[var(--muted)]">
            自动识别类型：{selectedSection.label}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border bg-white/70 p-4 dark:bg-slate-900/50">
          <label className="mb-2 block text-sm font-medium">数据类型</label>
          <select
            className="select"
            value={selectedSectionKey}
            onChange={(event) => setSelectedSectionKey(event.target.value)}
          >
            {sections.map((section) => (
              <option key={section.key} value={section.key}>
                {section.label}
              </option>
            ))}
          </select>

          <div className="mt-4 space-y-3">
            {selectedSection?.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                  {field.label} {field.required ? "*" : ""}
                </label>
                <select
                  className="select h-10"
                  value={mapping[field.key] || ""}
                  onChange={(event) =>
                    setMapping((current) => ({
                      ...current,
                      [field.key]: event.target.value
                    }))
                  }
                >
                  <option value="">未映射</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border bg-white/70 p-4 dark:bg-slate-900/50">
            <p className="text-sm font-medium">原始表头</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {headers.length ? headers.map((header) => <span key={header} className="chip">{header}</span>) : <span className="text-sm text-[var(--muted)]">上传文件后显示</span>}
            </div>
          </div>

          <div className="rounded-3xl border bg-white/70 p-4 dark:bg-slate-900/50">
            <p className="text-sm font-medium">预览前 5 行</p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b">
                    {headers.map((header) => (
                      <th key={header} className="px-3 py-2 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      {headers.map((header) => (
                        <td key={header} className="px-3 py-2 text-[var(--muted)]">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border bg-white/70 p-4 dark:bg-slate-900/50">
            <p className="text-sm font-medium">映射结果预览</p>
            <pre className="mt-3 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(transformedRows.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {result ? (
        <div className="mt-4 rounded-3xl border bg-white/70 p-4 text-sm dark:bg-slate-900/50">
          <p className={result.ok ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
            {result.message}
          </p>
          <p className="mt-2 text-[var(--muted)]">
            省份 {result.imported.provinces || 0} / 院校 {result.imported.universities || 0} / 专业{" "}
            {result.imported.majors || 0} / 录取 {result.imported.admissions || 0} / 跳过 {result.imported.skipped || 0}
          </p>
        </div>
      ) : null}

      {validationResult ? (
        <div className="mt-4 rounded-3xl border bg-white/70 p-4 dark:bg-slate-900/50">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={validationResult.ok ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}>
                {validationResult.message}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                总行数 {validationResult.summary.totalRows} / 可导入 {validationResult.summary.validRows} / 错误{" "}
                {validationResult.summary.errorCount} / 警告 {validationResult.summary.warningCount}
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 font-medium">行号</th>
                      <th className="px-3 py-2 font-medium">级别</th>
                      <th className="px-3 py-2 font-medium">字段</th>
                      <th className="px-3 py-2 font-medium">问题</th>
                      <th className="px-3 py-2 font-medium">建议</th>
                    </tr>
                  </thead>
              <tbody>
                {validationResult.issues.length ? (
                  validationResult.issues.slice(0, 20).map((issue, index) => (
                    <tr key={`${issue.rowIndex}-${issue.field}-${index}`} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{issue.rowIndex}</td>
                      <td className="px-3 py-2">
                        <span className={issue.level === "error" ? "text-rose-600 dark:text-rose-300" : "text-amber-600 dark:text-amber-300"}>
                          {issue.level}
                        </span>
                      </td>
                      <td className="px-3 py-2">{issue.field}</td>
                      <td className="px-3 py-2 text-[var(--muted)]">{issue.message}</td>
                      <td className="px-3 py-2 text-brand-700 dark:text-brand-200">{issue.suggestion || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-3 text-[var(--muted)]" colSpan={5}>
                      没有发现问题，可以直接导入。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </article>
  );
}
