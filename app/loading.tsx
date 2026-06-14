import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="pb-12">
      <SiteHeader />
      <main className="shell mt-6 space-y-6">
        {[0, 1, 2].map((item) => (
          <div key={item} className="panel-strong h-40 animate-pulse" />
        ))}
      </main>
    </div>
  );
}
