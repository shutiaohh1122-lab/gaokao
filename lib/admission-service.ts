import type { AdmissionsApiResponse } from "@/lib/api-types";
import { findMajorById, findProvinceById, findUniversityById, queryAdmissions } from "@/lib/data-source";
import type { SearchFilters } from "@/lib/types";

type QueryOptions = SearchFilters & {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: "asc" | "desc";
};

export async function getAdmissionsResult(options: QueryOptions): Promise<AdmissionsApiResponse> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(50, options.pageSize || 12));
  const sortBy = options.sortBy || "minScore";
  const order = options.order || "desc";

  const rows = await queryAdmissions(options);
  const province = options.provinceId ? await findProvinceById(options.provinceId) : undefined;

  const sortedRows = [...rows].sort((a, b) => {
    const left = a[sortBy as keyof typeof a];
    const right = b[sortBy as keyof typeof b];
    if (typeof left === "number" && typeof right === "number") {
      return order === "asc" ? left - right : right - left;
    }
    return 0;
  });

  const total = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const items = await Promise.all(
    visibleRows.map(async (row) => {
      const [university, major, rowProvince] = await Promise.all([
        findUniversityById(row.universityId),
        findMajorById(row.majorId),
        findProvinceById(row.provinceId)
      ]);

      return {
        id: row.id,
        year: row.year,
        provinceId: row.provinceId,
        provinceName: rowProvince?.name || row.provinceId,
        subjectType: row.subjectType,
        universityId: row.universityId,
        universityName: university?.name || row.universityId,
        universityTags: university?.tierTags || [],
        majorId: row.majorId,
        majorName: major?.name || row.majorId,
        batch: row.batch,
        planCount: row.planCount,
        admittedCount: row.admittedCount,
        minScore: row.minScore,
        avgScore: row.avgScore,
        maxScore: row.maxScore,
        minRank: row.minRank,
        avgRank: row.avgRank,
        provinceControlLine: row.provinceControlLine,
        scoreGap: row.scoreGap
      };
    })
  );

  return {
    items,
    pagination: {
      page: currentPage,
      pageSize,
      total,
      totalPages
    },
    filters: {
      provinceId: options.provinceId || "",
      provinceName: province?.name || "",
      year: options.year || 0,
      subjectType: options.subjectType || "",
      universityKeyword: options.universityKeyword || "",
      majorKeyword: options.majorKeyword || "",
      tierTag: options.tierTag || "",
      city: options.city || "",
      sortBy,
      order
    }
  };
}
