import AuditForm from "@/components/audit/AuditForm";

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-zinc-50">
      <div className="max-w-3xl mx-auto pt-20">
        <h1 className="text-4xl font-bold mb-2">
          AI Spend Audit
        </h1>

        <p className="text-gray-500 mb-8">
          Discover wasted AI subscription spend.
        </p>

        <AuditForm />
      </div>
    </main>
  );
}