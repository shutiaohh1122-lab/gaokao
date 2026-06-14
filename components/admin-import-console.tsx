"use client";

import { FileImportMapper } from "@/components/file-import-mapper";
import { admissionFieldDefinitions, catalogFieldDefinitions } from "@/lib/import-mapping";

export function AdminImportConsole() {
  return (
    <section className="space-y-6">
      <FileImportMapper
        title="目录文件导入"
        description="上传省份 / 院校 / 专业目录表，逐列映射后导入"
        endpoint="/api/import/catalogs"
        payloadKey="catalogs"
        sections={[
          { key: "provinces", label: "省份目录", fields: [...catalogFieldDefinitions.provinces] },
          { key: "universities", label: "院校目录", fields: [...catalogFieldDefinitions.universities] },
          { key: "majors", label: "专业目录", fields: [...catalogFieldDefinitions.majors] }
        ]}
      />

      <FileImportMapper
        title="录取文件导入"
        description="上传逐省逐年录取数据表，逐列映射后导入"
        endpoint="/api/import/admissions"
        payloadKey="admissions"
        sections={[
          {
            key: "admissions",
            label: "录取明细",
            fields: [...admissionFieldDefinitions]
          }
        ]}
      />
    </section>
  );
}
