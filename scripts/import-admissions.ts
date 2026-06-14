import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "./prisma-client.ts";

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

async function main() {
  const absolutePath = resolve(process.cwd(), "data/import/admissions.sample.json");
  const content = await readFile(absolutePath, "utf8");
  const rows = JSON.parse(content) as AdmissionSeed[];

  for (const row of rows) {
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

  console.log(`Imported ${rows.length} admission rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
