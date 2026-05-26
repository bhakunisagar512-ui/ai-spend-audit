import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { type ToolName } from "@/lib/auditEngine";
import { createPublicSupabaseClient, type PublicAudit } from "@/lib/publicAudit";

export const dynamic = "force-dynamic";

type AuditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getPublicAudit(id);

  if (!audit) {
    return {
      title: "Audit Not Found | AI Spend Audit",
    };
  }

  const title = `${formatCurrency(audit.total_savings)} Monthly AI Savings`;
  const description = `A public AI Spend Audit found ${formatCurrency(
    audit.total_savings
  )}/month in estimated savings across ${audit.tool_count} tools.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/audits/${id}`,
      images: [`/audits/${id}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/audits/${id}/opengraph-image`],
    },
  };
}

export default async function PublicAuditPage({ params }: AuditPageProps) {
  const { id } = await params;
  const audit = await getPublicAudit(id);

  if (!audit) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">Public AI Spend Audit</p>
            <h1 className="text-4xl font-bold tracking-normal">
              {formatCurrency(audit.total_savings)} estimated monthly savings
            </h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              This shared report hides company name and email while preserving the savings
              breakdown.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white"
          >
            Run your audit
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Current Spend" value={formatCurrency(audit.total_current_spend)} />
          <Metric label="Optimized Spend" value={formatCurrency(audit.total_optimized_spend)} />
          <Metric label="Monthly Savings" value={formatCurrency(audit.total_savings)} strong />
          <Metric label="Annual Savings" value={formatCurrency(audit.total_savings * 12)} strong />
        </div>

        <section className="mb-6 rounded-lg border bg-white p-5">
          <h2 className="mb-4 text-xl font-semibold">Tool Snapshot</h2>
          <div className="space-y-3">
            {audit.tools.map((tool) => (
              <div key={`${tool.name}-${tool.currentTier}`} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{getToolLabel(tool.name)}</p>
                  <p className="text-sm text-gray-500">{tool.seats} seats</p>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {tool.currentTier} tier, {formatCurrency(tool.monthlyTotal)}/month
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="mb-4 text-xl font-semibold">Recommendations</h2>
          {audit.recommendations.length > 0 ? (
            <div className="space-y-4">
              {audit.recommendations.map((recommendation) => (
                <div key={`${recommendation.tool}-${recommendation.suggestion}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{getToolLabel(recommendation.tool)}</p>
                    <p className="font-semibold text-emerald-700">
                      {formatCurrency(recommendation.monthlySavings)}/mo
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation.suggestion}</p>
                  <p className="mt-1 text-sm text-gray-600">{recommendation.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No obvious savings were found by the current rules.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

async function getPublicAudit(id: string): Promise<PublicAudit | null> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("public_audits")
    .select("*")
    .eq("share_id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PublicAudit;
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${strong ? "text-emerald-700" : ""}`}>{value}</p>
    </div>
  );
}

function getToolLabel(tool: ToolName): string {
  const labels: Record<ToolName, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    copilot: "GitHub Copilot",
    cursor: "Cursor",
    gemini: "Gemini",
    windsurf: "Windsurf",
    v0: "v0",
    anthropicApi: "Anthropic API direct",
    openaiApi: "OpenAI API direct",
  };

  return labels[tool];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
