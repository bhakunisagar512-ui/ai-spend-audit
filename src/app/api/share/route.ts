import { type AuditResult, type Tool } from "@/lib/auditEngine";
import { createPublicSupabaseClient, toPublicAuditPayload } from "@/lib/publicAudit";

type SharePayload = {
  tools?: Tool[];
  result?: AuditResult;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as SharePayload;

  if (!payload.tools || !payload.result) {
    return Response.json({ message: "Missing audit data." }, { status: 400 });
  }

  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return Response.json({ message: "Supabase is not configured." }, { status: 500 });
  }

  const shareId = crypto.randomUUID();
  const { error } = await supabase.from("public_audits").insert({
    share_id: shareId,
    ...toPublicAuditPayload(payload.tools, payload.result),
  });

  if (error) {
    return Response.json({ message: "Could not create share link." }, { status: 500 });
  }

  const url = new URL(`/audits/${shareId}`, request.url);

  return Response.json({
    id: shareId,
    url: url.toString(),
  });
}
