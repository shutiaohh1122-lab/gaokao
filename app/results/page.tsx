import { SiteHeader } from "@/components/site-header";
import { ResultsClient } from "@/components/results-client";
import { getAdmissionsResult } from "@/lib/admission-service";

type ResultsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const provinceId = typeof searchParams.provinceId === "string" ? searchParams.provinceId : "guangdong";
  const year = typeof searchParams.year === "string" ? Number(searchParams.year) : 2025;
  const subjectType = typeof searchParams.subjectType === "string" ? searchParams.subjectType : "物理";
  const universityKeyword =
    typeof searchParams.universityKeyword === "string" ? searchParams.universityKeyword : undefined;
  const majorKeyword = typeof searchParams.majorKeyword === "string" ? searchParams.majorKeyword : undefined;
  const tierTag = typeof searchParams.tierTag === "string" ? searchParams.tierTag : undefined;
  const city = typeof searchParams.city === "string" ? searchParams.city : undefined;
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "minScore";
  const order = typeof searchParams.order === "string" ? searchParams.order : "desc";
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const query = new URLSearchParams({
    provinceId,
    year: String(year),
    subjectType,
    universityKeyword: universityKeyword || "",
    majorKeyword: majorKeyword || "",
    tierTag: tierTag || "",
    city: city || "",
    sortBy,
    order,
    page: String(page),
    pageSize: "12"
  });
  const initialData = await getAdmissionsResult({
    provinceId,
    year,
    subjectType: subjectType as never,
    universityKeyword,
    majorKeyword,
    tierTag,
    city,
    sortBy,
    order: order as "asc" | "desc",
    page,
    pageSize: 12
  });

  return (
    <div className="pb-12">
      <SiteHeader />

      <main className="shell mt-6 space-y-6">
        <ResultsClient initialData={initialData} initialQuery={query.toString()} />
      </main>
    </div>
  );
}
