import { type AuditResult, type Tool } from "@/lib/auditEngine";

type SummaryPayload = {
  companyName?: string;
  teamSize?: string;
  tools?: Tool[];
  result?: AuditResult;
};

type AnthropicResponse = {
  content?: { type: string; text?: string }[];
};

export async function POST(request: Request) {
  const payload = (await request.json()) as SummaryPayload;
  const result = payload.result;

  if (!result) {
    return Response.json({ message: "Missing audit result" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ summary: getFallbackSummary(payload) });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(8_000),
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        max_tokens: 180,
        system:
          "You write concise B2B SaaS audit summaries. Be specific, practical, and avoid hype.",
        messages: [
          {
            role: "user",
            content: `Write a roughly 100-word AI subscription spend audit summary for this company.

Company: ${payload.companyName || "Unknown"}
Team size: ${payload.teamSize || "Unknown"}
Tools: ${JSON.stringify(payload.tools || [])}
Audit result: ${JSON.stringify(result)}

Mention total monthly spend, estimated monthly savings, and the most important next action.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return Response.json({ summary: getFallbackSummary(payload) });
    }

    const data = (await response.json()) as AnthropicResponse;
    const text = data.content?.find((item) => item.type === "text")?.text;

    return Response.json({ summary: text || getFallbackSummary(payload) });
  } catch {
    return Response.json({ summary: getFallbackSummary(payload) });
  }
}

function getFallbackSummary(payload: SummaryPayload): string {
  const companyName = payload.companyName || "This team";
  const result = payload.result;

  if (!result) {
    return "The audit is ready, but there was not enough data to generate a personalized summary.";
  }

  if (result.totalSavings > 0) {
    return `${companyName} currently spends $${result.totalCurrentSpend}/month on AI tools. The audit found an estimated $${result.totalSavings}/month in savings by matching plan tiers and seat counts more closely to current usage. Start with the highest-savings recommendation, then remove inactive seats before the next billing cycle.`;
  }

  return `${companyName} currently spends $${result.totalCurrentSpend}/month on AI tools. The audit did not find obvious plan savings from the current rule set. The next step is to review usage by person, remove inactive seats, and check whether overlapping tools are serving the same workflow.`;
}
