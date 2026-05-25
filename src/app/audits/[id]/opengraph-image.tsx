import { ImageResponse } from "next/og";

import { createPublicSupabaseClient, type PublicAudit } from "@/lib/publicAudit";

export const alt = "AI Spend Audit savings summary";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ id: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { id } = await params;
  const audit = await getPublicAudit(id);
  const savings = formatCurrency(audit?.total_savings || 0);
  const spend = formatCurrency(audit?.total_current_spend || 0);
  const tools = audit?.tool_count || 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafafa",
          color: "#111111",
          padding: "72px",
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 32, color: "#525252" }}>AI Spend Audit</div>
        <div>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1 }}>{savings}</div>
          <div style={{ marginTop: 20, fontSize: 42 }}>estimated monthly savings</div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 28, color: "#404040" }}>
          <div>{spend}/mo current spend</div>
          <div>{tools} tools audited</div>
        </div>
      </div>
    ),
    size
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
