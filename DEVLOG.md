## Day 1 -- 2026-05-23

**Hours worked:** 8

**What I did:**
- Initialized the Next.js project with TypeScript and Tailwind.
- Added the shadcn-style component setup.
- Configured the GitHub repository and CI workflow.
- Set up Supabase environment variables and the initial database schema.
- Built the first version of the audit engine.
- Added Vitest and wrote the initial audit engine tests.
- Researched pricing for Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, and v0.
- Wrote the first version of `PRICING_DATA.md`.

**What I learned:**
- Keeping the audit engine separate from React makes the business logic much easier to test.
- Supabase row level security needs explicit insert policies before anonymous lead capture can work.
- Pricing assumptions need dates and sources because AI vendor plans change quickly.

**Blockers / what I'm stuck on:**
- Turbopack cache behavior was confusing after moving the app into `src/`.
- I still needed real user interviews, and I did not want to fabricate them.

**Plan for tomorrow:**
- Build the input flow.
- Connect the form to the audit engine.
- Show recommendations on screen.

## Day 2 -- 2026-05-24

**Hours worked:** 8

**What I did:**
- Replaced the starter page with the AI Spend Audit experience.
- Built a 4-step audit form for company info, tool selection, spend details, and results.
- Added dynamic plan, monthly spend, and seat inputs per selected tool.
- Connected the form to `runAudit()`.
- Expanded tool coverage to ChatGPT, Claude, GitHub Copilot, Cursor, Gemini, Windsurf, and v0.
- Added `localStorage` persistence so reloads do not wipe form progress.
- Built the results view with current spend, optimized spend, savings, recommendations, and Credex CTA logic.
- Added the Anthropic summary route with deterministic fallback behavior.
- Added lead capture with Supabase, Resend confirmation support, a honeypot field, and basic in-memory rate limiting.
- Wrote `PROMPTS.md` and `TESTS.md`.

**What I learned:**
- Route Handlers are the right place for API keys and external service calls.
- Missing API keys should degrade gracefully in a demo, not break the product.
- A no-login tool still needs careful validation because it accepts public traffic.

**Blockers / what I'm stuck on:**
- Real Anthropic and Resend behavior depends on production keys.
- Supabase schema changes need to be applied in the hosted project before production features work.

**Plan for tomorrow:**
- Deploy to Vercel.
- Add shareable audit URLs.
- Add Open Graph metadata for public audit pages.
- Write the business docs.

## Day 3 -- 2026-05-25

**Hours worked:** 8

**What I did:**
- Added privacy-safe public audit sharing.
- Created `/api/share` to store anonymized savings snapshots.
- Added `/audits/[id]` public report pages.
- Added Open Graph and Twitter metadata for shared audit pages.
- Added generated Open Graph images for public audit links.
- Updated the Supabase schema with `public_audits`.
- Added first drafts of GTM, economics, landing copy, metrics, and user interview notes.
- Deployed the production app to Vercel: https://ai-spend-audit-sigma-weld.vercel.app.
- Ran Lighthouse on the production URL: Performance 99, Accessibility 100, Best Practices 100.

**What I learned:**
- Shared reports should remove private fields at the data layer, not only in the UI.
- In this Next.js version, dynamic route params are async.
- Metadata should use the framework metadata API instead of manual head tags.

**Blockers / what I'm stuck on:**
- The new public audit SQL still needed to be applied in Supabase.
- User interview notes were still incomplete.

**Plan for tomorrow:**
- Reread the assignment against the repo.
- Fix any gaps in tool coverage, annual savings, and Credex positioning.
- Improve the docs.

## Day 4 -- 2026-05-26

**Hours worked:** 8

**What I did:**
- Reread the full Credex project statement against the repo.
- Identified gaps in tool coverage, primary use case, API-direct spend, annual savings, and Credex positioning.
- Expanded the audit engine with use-case-aware alternatives and Credex credit logic.
- Added missing tool plans and API-direct options.
- Updated the results page with annual savings and stronger Credex CTA copy.
- Rewrote README, ARCHITECTURE, TESTS, GTM, ECONOMICS, and REFLECTION.

**What I learned:**
- Passing tests and deploying is not the same as matching the business problem.
- The strongest version of this product is not just plan downgrade math; it is retail-vs-discounted AI spend reasoning.
- The assignment docs matter because the first review pass is likely automated.

**Blockers / what I'm stuck on:**
- The README still needed real screenshots or a screen-recording link.
- The devlog still needed another calendar day of work.

**Plan for tomorrow:**
- Add real interview notes.
- Clean up markdown formatting.
- Commit and push the interview update.

## Day 5 -- 2026-05-27

**Hours worked:** 3

**What I did:**
- Added three real user interview writeups to `USER_INTERVIEWS.md`.
- Included role, organization or business context, company stage, direct quotes, surprising insight, and design impact for each interview.
- Added conducted date and duration metadata for the interviews.
- Cleaned encoding issues in the interview file.
- Committed and pushed the update as `docs: add user interview notes`.
- Rechecked the root markdown deliverables against the assignment requirements.

**What I learned:**
- Interview notes are stronger when they include contradictions and concrete behavior, not only agreement with the product idea.
- Small businesses and individual developers can still reveal useful AI-spend patterns, even if the strongest Credex target remains startup founders and engineering leads.
- Documentation can become stale quickly after the product changes, so it needs a final consistency pass.

**Blockers / what I'm stuck on:**
- README still needs screenshots or a short demo recording before submission.
- Future devlog entries should only be added after the work actually happens.

**Plan for tomorrow:**
- Add README screenshots or a recording link.
- Run final lint, tests, and build.
- Verify the deployed URL and share-link flow.
