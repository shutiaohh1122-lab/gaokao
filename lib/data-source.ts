import type {
  AdmissionScore,
  Major,
  Province,
  SearchFilters,
  University
} from "@/lib/types";
import {
  admissionScores as mockAdmissionScores,
  getMajorById as getMockMajorById,
  getProvinceById as getMockProvinceById,
  getUniversityById as getMockUniversityById,
  majors as mockMajors,
  provinces as mockProvinces,
  searchAdmissions as searchMockAdmissions,
  universities as mockUniversities
} from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

function isDatabaseEnabled() {
  return process.env.DATA_SOURCE === "database";
}

function parseJsonArray(value?: string | null) {
  if (!value) return [];
  try {
    return JSON.parse(value) as string[];
  } catch {
    return [];
  }
}

function mapDbUniversity(record: {
  id: string;
  name: string;
  city: string;
  province: string;
  type: string;
  tierTagsJson: string;
  slogan: string | null;
  description: string | null;
  foundedYear: number | null;
  affiliation: string | null;
  dominantMajors: string | null;
  graduateRate: number | null;
  employmentRate: number | null;
}): University {
  return {
    id: record.id,
    name: record.name,
    city: record.city,
    province: record.province,
    type: record.type,
    tierTags: parseJsonArray(record.tierTagsJson),
    slogan: record.slogan || "",
    description: record.description || "",
    foundedYear: record.foundedYear || 0,
    affiliation: record.affiliation || "",
    dominantMajors: parseJsonArray(record.dominantMajors),
    graduateRate: Math.round(record.graduateRate || 0),
    employmentRate: Math.round(record.employmentRate || 0)
  };
}

function mapDbMajor(record: {
  id: string;
  name: string;
  category: string;
  degree: string | null;
  duration: string | null;
  tuition: number | null;
  subjectRequirements: string | null;
  overview: string | null;
  careersJson: string | null;
  coursesJson: string | null;
  heat: number | null;
}): Major {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    degree: record.degree || "学士",
    duration: record.duration || "4年",
    tuition: record.tuition || 0,
    subjectRequirements: record.subjectRequirements || "不限",
    overview: record.overview || "",
    careers: parseJsonArray(record.careersJson),
    courses: parseJsonArray(record.coursesJson),
    heat: record.heat || 0
  };
}

function mapDbProvince(record: {
  id: string;
  name: string;
  region: string;
  subjectJson: string;
}): Province {
  return {
    id: record.id,
    name: record.name,
    region: record.region,
    subjects: parseJsonArray(record.subjectJson) as Province["subjects"]
  };
}

function mapDbAdmission(record: {
  id: string;
  provinceId: string;
  year: number;
  subjectType: string;
  universityId: string;
  majorId: string;
  batch: string | null;
  planCount: number | null;
  admittedCount: number | null;
  minScore: number;
  avgScore: number | null;
  maxScore: number | null;
  minRank: number;
  avgRank: number | null;
  provinceControlLine: number | null;
  scoreGap: number | null;
}): AdmissionScore {
  return {
    id: record.id,
    provinceId: record.provinceId,
    year: record.year,
    subjectType: record.subjectType as AdmissionScore["subjectType"],
    universityId: record.universityId,
    majorId: record.majorId,
    batch: record.batch || "本科批",
    planCount: record.planCount || 0,
    admittedCount: record.admittedCount || 0,
    minScore: record.minScore,
    avgScore: record.avgScore || record.minScore,
    maxScore: record.maxScore || record.minScore,
    minRank: record.minRank,
    avgRank: record.avgRank || record.minRank,
    provinceControlLine: record.provinceControlLine || 0,
    scoreGap: record.scoreGap || 0
  };
}

export async function getProvincesData(): Promise<Province[]> {
  if (!isDatabaseEnabled()) return mockProvinces;
  const rows = await prisma.province.findMany({ orderBy: { name: "asc" } });
  return rows.length ? rows.map(mapDbProvince) : mockProvinces;
}

export async function getUniversitiesData(): Promise<University[]> {
  if (!isDatabaseEnabled()) return mockUniversities;
  const rows = await prisma.university.findMany({ orderBy: { name: "asc" } });
  return rows.length ? rows.map(mapDbUniversity) : mockUniversities;
}

export async function getMajorsData(): Promise<Major[]> {
  if (!isDatabaseEnabled()) return mockMajors;
  const rows = await prisma.major.findMany({ orderBy: { name: "asc" } });
  return rows.length ? rows.map(mapDbMajor) : mockMajors;
}

export async function findUniversityById(universityId: string): Promise<University | undefined> {
  if (!isDatabaseEnabled()) return getMockUniversityById(universityId);
  const row = await prisma.university.findUnique({ where: { id: universityId } });
  return row ? mapDbUniversity(row) : getMockUniversityById(universityId);
}

export async function findMajorById(majorId: string): Promise<Major | undefined> {
  if (!isDatabaseEnabled()) return getMockMajorById(majorId);
  const row = await prisma.major.findUnique({ where: { id: majorId } });
  return row ? mapDbMajor(row) : getMockMajorById(majorId);
}

export async function findProvinceById(provinceId: string): Promise<Province | undefined> {
  if (!isDatabaseEnabled()) return getMockProvinceById(provinceId);
  const row = await prisma.province.findUnique({ where: { id: provinceId } });
  return row ? mapDbProvince(row) : getMockProvinceById(provinceId);
}

export async function queryAdmissions(filters: SearchFilters): Promise<AdmissionScore[]> {
  if (!isDatabaseEnabled()) return searchMockAdmissions(filters);

  const universityWhere: Record<string, unknown> = {};
  const majorWhere: Record<string, unknown> = {};

  if (filters.universityKeyword) {
    universityWhere.name = {
      contains: filters.universityKeyword
    };
  }

  if (filters.city) {
    universityWhere.city = filters.city;
  }

  if (filters.tierTag) {
    universityWhere.tierTagsJson = {
      contains: filters.tierTag
    };
  }

  if (filters.majorKeyword) {
    majorWhere.name = {
      contains: filters.majorKeyword
    };
  }

  const rows = await prisma.admissionScore.findMany({
    where: {
      ...(filters.provinceId ? { provinceId: filters.provinceId } : {}),
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.subjectType ? { subjectType: filters.subjectType } : {}),
      ...(Object.keys(universityWhere).length ? { university: universityWhere } : {}),
      ...(Object.keys(majorWhere).length ? { major: majorWhere } : {})
    }
  });

  return rows.length ? rows.map(mapDbAdmission) : searchMockAdmissions(filters);
}

export async function getAllAdmissionsData(): Promise<AdmissionScore[]> {
  if (!isDatabaseEnabled()) return mockAdmissionScores;
  const rows = await prisma.admissionScore.findMany();
  return rows.length ? rows.map(mapDbAdmission) : mockAdmissionScores;
}
