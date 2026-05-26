# Architecture

## System Diagram

```mermaid
flowchart TD
  A[Visitor] --> B[Next.js App Router UI]
  B --> C[AuditForm Client Component]
  C --> D[TypeScript Audit Engine]
  D --> C
  C --> E[/api/audit-summary/]
  E --> F[Anthropic Messages API]
  E --> C
  C --> G[/api/leads/]
  G --> H[Supabase leads tables]
  G --> I[Resend email]
  C --> J[/api/share/]
  J --> K[Supabase public_audits]
  K --> L[/audits/[id] public page]
  L --> M[Open Graph Image Route]
```

## Data Flow

1. A visitor enters company name, team size, primary use case, AI tools, plan, monthly spend, and seats.
2. The form stores progress in `localStorage` so reloads do not wipe the audit.
3. `runAudit()` receives normalized tool records and returns current spend, optimized spend, monthly savings, annual savings, and per-tool recommendations.
4. The UI shows value immediately before email capture.
5. `/api/audit-summary` sends the audit result to Anthropic for a short summary. If the API fails, it returns a deterministic fallback.
6. `/api/leads` stores private lead data in Supabase and sends a Resend confirmation email.
7. `/api/share` stores an anonymized public snapshot in `public_audits`.
8. `/audits/[id]` renders the public result with company name and email removed.

## Stack Choice

- **Next.js App Router:** good fit for one product with UI, API routes, metadata, and deployment on Vercel.
- **TypeScript:** keeps the audit engine and payload contracts explicit.
- **Tailwind + shadcn-style primitives:** fast custom UI without a website builder or admin template.
- **Supabase:** real Postgres backend with simple RLS policies.
- **Resend:** simple transactional email API.
- **Anthropic:** required AI layer for personalized summaries.
- **Vitest:** fast unit tests around the audit engine.

## Scaling To 10k Audits/Day

At 10k audits/day, I would move rate limiting from in-memory maps to Upstash Redis or Supabase-backed counters, add server-side validation with a schema library, queue email sends, and cache public audit reads. I would also split private leads from public report records more strictly, add observability for API failures, and move pricing rules into versioned data so finance-reviewed pricing changes can ship without code edits.
