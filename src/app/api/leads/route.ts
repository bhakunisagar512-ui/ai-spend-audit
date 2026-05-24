import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import { type AuditResult, type Tool } from "@/lib/auditEngine";

type LeadPayload = {
  companyName?: string;
  email?: string;
  teamSize?: number;
  tools?: Tool[];
  result?: AuditResult;
  consultationRequested?: boolean;
  website?: string;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const requests = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const clientId = getClientId(request);

  if (isRateLimited(clientId)) {
    return Response.json(
      { message: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  const payload = (await request.json()) as LeadPayload;

  if (payload.website) {
    return Response.json({ message: "Thanks. Your audit was received." });
  }

  if (!payload.companyName || !payload.email || !payload.result) {
    return Response.json({ message: "Missing required audit fields." }, { status: 400 });
  }

  if (!isValidEmail(payload.email)) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const leadId = await saveLead(payload);
    const emailSent = await sendConfirmation(payload);

    return Response.json({
      id: leadId,
      message: emailSent
        ? "Audit saved. Check your inbox for the confirmation."
        : "Audit saved. Email confirmation was skipped or could not be sent.",
    });
  } catch {
    return Response.json(
      { message: "Could not save your audit. Check environment variables and Supabase setup." },
      { status: 500 }
    );
  }
}

async function saveLead(payload: LeadPayload): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const leadId = crypto.randomUUID();

  const { error: leadError } = await supabase
    .from("leads")
    .insert({
      id: leadId,
      company_name: payload.companyName,
      email: payload.email,
      team_size: payload.teamSize || null,
      total_current_spend: payload.result?.totalCurrentSpend || 0,
      total_optimized_spend: payload.result?.totalOptimizedSpend || 0,
      total_savings: payload.result?.totalSavings || 0,
      consultation_requested: payload.consultationRequested || false,
    });

  if (leadError) {
    throw leadError;
  }

  if (payload.tools?.length) {
    const { error } = await supabase.from("audit_tools").insert(
      payload.tools.map((tool) => ({
        lead_id: leadId,
        tool_name: tool.name,
        current_tier: tool.currentTier,
        seats: tool.seats,
        monthly_total: tool.monthlyTotal,
      }))
    );

    if (error) {
      throw error;
    }
  }

  if (payload.result?.recommendations.length) {
    const { error } = await supabase.from("audit_recommendations").insert(
      payload.result.recommendations.map((recommendation) => ({
        lead_id: leadId,
        tool_name: recommendation.tool,
        issue: recommendation.issue,
        suggestion: recommendation.suggestion,
        monthly_savings: recommendation.monthlySavings,
      }))
    );

    if (error) {
      throw error;
    }
  }

  return leadId;
}

async function sendConfirmation(payload: LeadPayload): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !payload.email) {
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const savings = payload.result?.totalSavings || 0;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: payload.email,
      subject: "Your AI Spend Audit",
      text: `Thanks for running an AI Spend Audit for ${
        payload.companyName
      }. Estimated monthly savings: $${savings}. ${
        payload.consultationRequested
          ? "Your savings are above $500/month, so a Credex consultation is recommended."
          : "Keep reviewing inactive seats before each renewal."
      }`,
    });

    return true;
  } catch {
    return false;
  }
}

function getClientId(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const current = requests.get(clientId);

  if (!current || current.resetAt < now) {
    requests.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  requests.set(clientId, current);

  return current.count > MAX_REQUESTS;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
