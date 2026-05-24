## Day 1 - 2026-05-23

**Hours:** 8

### What I did
- Initialized Next.js project with TypeScript and Tailwind
- Added shadcn/ui component system
- Configured GitHub repository and CI workflow
- Set up Supabase project and environment variables
- Added Supabase schema for leads, audit tools, and audit recommendations
- Built core audit engine
- Wrote and passed 5 unit tests using Vitest
- Researched pricing for Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, and v0
- Wrote PRICING_DATA.md with official URLs and a verification date

### Learned
- Structuring projects with src/ improves scalability
- CI pipelines help catch issues automatically
- Rule-based audit systems are easy to extend incrementally
- Pricing pages change quickly, so pricing assumptions need verification dates
- Supabase row level security needs explicit insert policies before public lead capture can work

### Blockers
- Turbopack cache issue after moving folders into src/
- User interviews still need real human responses; they should not be fabricated

### Plan
- Build tool input form
- Display audit recommendations in UI
- Store audits in Supabase
- Add real interview notes once 3 users have been interviewed

## Day 2 - 2026-05-24

**Hours:** 8

### What I did
- Replaced the starter page with the AI Spend Audit landing experience
- Built a 4-step audit form for company info, tool selection, spending details, and results
- Added dynamic tier, monthly cost, and seat inputs per selected tool
- Connected the form to the pure TypeScript audit engine
- Expanded the audit engine to cover ChatGPT, Claude, GitHub Copilot, Cursor, Gemini, Windsurf, and v0
- Added `localStorage` persistence so form progress survives reloads
- Built the results view with total spend, optimized spend, savings, recommendations, and a $500/month Credex CTA
- Added an Anthropic summary API route with a fallback template
- Added lead capture API route with Supabase inserts, Resend confirmation email support, honeypot spam trap, and basic rate limiting
- Wrote PROMPTS.md and TESTS.md

### Learned
- Keeping audit math separate from React state makes the UI easier to change
- Route Handlers are the right place for API keys and external service calls
- Fallback behavior matters because missing API keys should not break the product demo
- Local persistence makes multi-step forms feel much safer for users

### Blockers
- Real Anthropic and Resend behavior requires production API keys
- Supabase inserts require the schema in `supabase/schema.sql` to be applied in the Supabase project

### Plan
- Deploy to Vercel
- Add shareable audit URLs
- Add Open Graph metadata for public audit pages
- Run Lighthouse and write the business docs
