import { prisma } from "@/lib/prisma";
import type { ImportApiResponse } from "@/lib/api-types";
import { buildLookupTables, resolveSuggestedIdByName } from "@/lib/import-match";

type ProvinceSeed = {
  id: string;
  name: string;
  region: string;
  subjects: string[];
};

type UniversitySeed = {
  id: string;
  name: string;
  city: string;
  province: string;
  type: string;
  tierTags: string[];
  slogan?: string;
  description?: string;
  foundedYear?: number;
  affiliation?: string;
  dominantMajors?: string[];
  graduateRate?: number;
  employmentRate?: number;
  source?: string;
};

type MajorSeed = {
  id: string;
  name: string;
  category: string;
  degree?: string;
  duration?: string;
  tuition?: number;
  subjectRequirements?: string;
  overview?: string;
  careers?: string[];
  courses?: string[];
  heat?: number;
  level?: string;
  source?: string;
};

type AdmissionSeed = {
  id: string;
  provinceId: string;
  year: number;
  subjectType: string;
  universityId: string;
  majorId: string;
  batch?: string;
  planCount?: number;
  admittedCount?: number;
  minScore: number;
  avgScore?: number;
  maxScore?: number;
  minRank: number;
  avgRank?: number;
  provinceControlLine?: number;
  scoreGap?: number;
  dataSource?: string;
};

export async function importCatalogPayload(payload: {
  provinces?: ProvinceSeed[];
  universities?: UniversitySeed[];
  majors?: MajorSeed[];
}): Promise<ImportApiResponse> {
  const provinces = payload.provinces || [];
  const universities = payload.universities || [];
  const majors = payload.majors || [];

  for (const province of provinces) {
    await prisma.province.upsert({
      where: { id: province.id },
      create: {
        id: province.id,
        name: province.name,
        region: province.region,
        subjectJson: JSON.stringify(province.subjects)
      },
      update: {
        name: province.name,
        region: province.region,
        subjectJson: JSON.stringify(province.subjects)
      }
    });
  }

  for (const university of universities) {
    await prisma.university.upsert({
      where: { id: university.id },
      create: {
        id: university.id,
        name: university.name,
        city: university.city,
        province: university.province,
        type: university.type,
        tierTagsJson: JSON.stringify(university.tierTags),
        slogan: university.slogan,
        description: university.description,
        foundedYear: university.foundedYear,
        affiliation: university.affiliation,
        dominantMajors: JSON.stringify(university.dominantMajors || []),
        graduateRate: university.graduateRate,
        employmentRate: university.employmentRate,
        source: university.source || "imported"
      },
      update: {
        name: university.name,
        city: university.city,
        province: university.province,
        type: university.type,
        tierTagsJson: JSON.stringify(university.tierTags),
        slogan: university.slogan,
        description: university.description,
        foundedYear: university.foundedYear,
        affiliation: university.affiliation,
        dominantMajors: JSON.stringify(university.dominantMajors || []),
        graduateRate: university.graduateRate,
        employmentRate: university.employmentRate,
        source: university.source || "imported"
      }
    });
  }

  for (const major of majors) {
    await prisma.major.upsert({
      where: { id: major.id },
      create: {
        id: major.id,
        name: major.name,
        category: major.category,
        degree: major.degree,
        duration: major.duration,
        tuition: major.tuition,
        subjectRequirements: major.subjectRequirements,
        overview: major.overview,
        careersJson: JSON.stringify(major.careers || []),
        coursesJson: JSON.stringify(major.courses || []),
        heat: major.heat,
        level: major.level || "本科",
        source: major.source || "imported"
      },
      update: {
        name: major.name,
        category: major.category,
        degree: major.degree,
        duration: major.duration,
        tuition: major.tuition,
        subjectRequirements: major.subjectRequirements,
        overview: major.overview,
        careersJson: JSON.stringify(major.careers || []),
        coursesJson: JSON.stringify(major.courses || []),
        heat: major.heat,
        level: major.level || "本科",
        source: major.source || "imported"
      }
    });
  }

  return {
    ok: true,
    message: "目录数据导入成功",
    imported: {
      provinces: provinces.length,
      universities: universities.length,
      majors: majors.length,
      skipped: 0
    }
  };
}

export async function importAdmissionsPayload(payload: { admissions?: AdmissionSeed[] }): Promise<ImportApiResponse> {
  const admissions = payload.admissions || [];
  const lookups = await buildLookupTables();
  const normalizedAdmissions = admissions.map((row) => {
    const provinceResolution = resolveSuggestedIdByName(row as unknown as Record<string, unknown>, {
      idField: "provinceId",
      nameFieldCandidates: ["provinceName", "province", "省份", "生源地"],
      idSet: lookups.provinceIdSet,
      nameToId: lookups.provinceNameToId
    });
    const universityResolution = resolveSuggestedIdByName(row as unknown as Record<string, unknown>, {
      idField: "universityId",
      nameFieldCandidates: ["universityName", "university", "schoolName", "学校名称", "院校名称"],
      idSet: lookups.universityIdSet,
      nameToId: lookups.universityNameToId
    });
    const majorResolution = resolveSuggestedIdByName(row as unknown as Record<string, unknown>, {
      idField: "majorId",
      nameFieldCandidates: ["majorName", "major", "专业名称"],
      idSet: lookups.majorIdSet,
      nameToId: lookups.majorNameToId
    });

    return {
      ...row,
      provinceId: row.provinceId || provinceResolution.resolvedId,
      universityId: row.universityId || universityResolution.resolvedId,
      majorId: row.majorId || majorResolution.resolvedId
    };
  });

  for (const row of normalizedAdmissions) {
    await prisma.admissionScore.upsert({
      where: { id: row.id },
      create: {
        ...row,
        dataSource: row.dataSource || "imported"
      },
      update: {
        ...row,
        dataSource: row.dataSource || "imported"
      }
    });
  }

  return {
    ok: true,
    message: "录取数据导入成功",
    imported: {
      admissions: admissions.length,
      skipped: 0
    }
  };
}
