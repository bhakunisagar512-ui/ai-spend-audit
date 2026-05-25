import { createClient } from "@supabase/supabase-js";

import { type AuditResult, type Tool } from "@/lib/auditEngine";

export type PublicAudit = {
  share_id: string;
  total_current_spend: number;
  total_optimized_spend: number;
  total_savings: number;
  tool_count: number;
  tools: Tool[];
  recommendations: AuditResult["recommendations"];
  created_at: string;
};

export function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

export function toPublicAuditPayload(tools: Tool[], result: AuditResult) {
  return {
    total_current_spend: result.totalCurrentSpend,
    total_optimized_spend: result.totalOptimizedSpend,
    total_savings: result.totalSavings,
    tool_count: tools.length,
    tools,
    recommendations: result.recommendations,
  };
}
