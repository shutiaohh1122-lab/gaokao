export interface AdmissionResultItem {
  id: string;
  year: number;
  provinceId: string;
  provinceName: string;
  subjectType: string;
  universityId: string;
  universityName: string;
  universityTags: string[];
  majorId: string;
  majorName: string;
  batch: string;
  planCount: number;
  admittedCount: number;
  minScore: number;
  avgScore: number;
  maxScore: number;
  minRank: number;
  avgRank: number;
  provinceControlLine: number;
  scoreGap: number;
}

export interface AdmissionsApiResponse {
  items: AdmissionResultItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    provinceId: string;
    provinceName: string;
    year: number;
    subjectType: string;
    universityKeyword: string;
    majorKeyword: string;
    tierTag: string;
    city: string;
    sortBy: string;
    order: string;
  };
}

export interface CatalogSearchItem {
  id: string;
  name: string;
  subtitle: string;
  tags: string[];
  source: string;
}

export interface CatalogApiResponse {
  items: CatalogSearchItem[];
  total: number;
  keyword: string;
}

export interface ImportApiResponse {
  ok: boolean;
  message: string;
  imported: {
    provinces?: number;
    universities?: number;
    majors?: number;
    admissions?: number;
    skipped?: number;
  };
}

export interface ValidationIssue {
  rowIndex: number;
  level: "error" | "warning";
  field: string;
  code: string;
  message: string;
  suggestion?: string;
  suggestionValue?: string;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  errorCount: number;
  warningCount: number;
}

export interface ValidationApiResponse {
  ok: boolean;
  message: string;
  summary: ValidationSummary;
  issues: ValidationIssue[];
}
