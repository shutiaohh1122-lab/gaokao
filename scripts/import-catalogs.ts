import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "./prisma-client.ts";

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

async function readJsonFile<T>(filename: string) {
  const absolutePath = resolve(process.cwd(), "data/import", filename);
  const content = await readFile(absolutePath, "utf8");
  return JSON.parse(content) as T;
}

async function main() {
  const provinces = await readJsonFile<ProvinceSeed[]>("provinces.sample.json");
  const universities = await readJsonFile<UniversitySeed[]>("universities.sample.json");
  const majors = await readJsonFile<MajorSeed[]>("majors.sample.json");

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

  console.log(`Imported ${provinces.length} provinces, ${universities.length} universities, ${majors.length} majors.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
