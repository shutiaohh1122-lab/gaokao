import { AdminImportConsole } from "@/components/admin-import-console";
import { SiteHeader } from "@/components/site-header";

export default function ImportAdminPage() {
  return (
    <div className="pb-12">
      <SiteHeader />

      <main className="shell mt-6 space-y-6">
        <section className="panel-strong p-6 sm:p-8">
          <p className="label">数据导入台</p>
          <h1 className="mt-2 text-4xl font-semibold">真实数据导入与校验</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            这里支持上传 CSV / Excel，自动预览首个工作表，并完成字段映射后调用导入 API 写入数据库。适合先验证字段，再接全国批量数据。
          </p>
        </section>

        <AdminImportConsole />
      </main>
    </div>
  );
}
