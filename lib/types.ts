export type SubjectType =
  | "物理"
  | "历史"
  | "理科"
  | "文科"
  | "综合";

export interface Province {
  id: string;
  name: string;
  region: string;
  subjects: SubjectType[];
}

export interface YearOption {
  value: number;
  label: string;
}

export interface University {
  id: string;
  name: string;
  city: string;
  province: string;
  type: string;
  tierTags: string[];
  slogan: string;
  description: string;
  foundedYear: number;
  affiliation: string;
  dominantMajors: string[];
  graduateRate: number;
  employmentRate: number;
}

export interface Major {
  id: string;
  name: string;
  category: string;
  degree: string;
  duration: string;
  tuition: number;
  subjectRequirements: string;
  overview: string;
  careers: string[];
  courses: string[];
  heat: number;
}

export interface UniversityCatalogEntry {
  id: string;
  name: string;
  aliases?: string[];
  city: string;
  province: string;
  type: string;
  tierTags: string[];
  affiliation?: string;
  source: "mock" | "imported";
}

export interface MajorCatalogEntry {
  id: string;
  name: string;
  category: string;
  level: string;
  subjectRequirements?: string;
  source: "mock" | "imported";
}

export interface DataCatalogManifest {
  provinceCount: number;
  mockUniversityCount: number;
  mockMajorCount: number;
  importedUniversityCount: number;
  importedMajorCount: number;
  supportsNationwideImport: boolean;
  lastUpdated: string;
  notes: string[];
}

export interface AdmissionScore {
  id: string;
  provinceId: string;
  year: number;
  subjectType: SubjectType;
  universityId: string;
  majorId: string;
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

export interface SearchFilters {
  provinceId?: string;
  year?: number;
  subjectType?: SubjectType;
  universityKeyword?: string;
  majorKeyword?: string;
  tierTag?: string;
  city?: string;
}

export interface RecommendationResult {
  type: "冲刺院校" | "稳妥院校" | "保底院校";
  universityId: string;
  universityName: string;
  majorName: string;
  expectedScore: number;
  expectedRank: number;
  reason: string;
}
