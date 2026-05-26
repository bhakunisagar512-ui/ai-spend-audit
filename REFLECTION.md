# Reflection

## 1. Hardest Bug

The hardest bug was the lead-save flow failing after the UI looked complete. The form submitted correctly, but the app returned "Could not save your audit." My first hypothesis was missing environment variables, so I checked that Supabase and Resend keys existed without printing secret values. The next hypothesis was that Resend was failing and masking a database success, so I changed the route to separate Supabase save from email send. The error still happened, which narrowed it to Supabase. The real issue was row level security: the API inserted a row and then asked Supabase to return the inserted id, but the table only allowed anonymous insert, not select. I fixed it by generating the UUID server-side before insert, so the endpoint no longer needed public read access to private leads. That was the right privacy-preserving fix.

## 2. Decision I Reversed

I reversed the decision to keep the audit engine as a tiny Copilot-only ruleset. Initially, I wanted a narrow engine because it was easy to test and explain. After rereading the project statement, that was too small: Credex needs a tool that can plausibly surface real AI overspend across seat tools, API spend, and discounted-credit opportunities. I expanded the model to include primary use case, same-vendor downgrades, alternative-tool benchmarks, annual savings, and Credex credit logic. The reversal made the engine less simple, but more aligned with the actual business. I still kept the math deterministic instead of asking an LLM to calculate savings.

## 3. Week 2

In week 2, I would add benchmark mode and better pricing data management. The biggest missing product capability is knowing whether a team is high or low spend relative to similar startups. I would add "AI spend per employee" and "AI spend per developer" benchmarks, then compare those to a small seed dataset from interviews and early users. I would also move pricing rules into a versioned data file or admin table so each price can carry a source URL, verification date, and confidence level. Finally, I would add a real booking flow for Credex consultations and track conversion from audit completion to booked call.

## 4. AI Usage

I used AI tools for code generation support, debugging hypotheses, documentation drafting, and checking the problem statement against the repo. I did not trust AI with pricing facts without source checks, secrets, or fabricated interviews. One specific AI-adjacent mistake I caught was treating Day 2 as "done" while the project statement actually required primary use case, API-direct products, annual savings, and stronger Credex-specific reasoning. The correction pass came from rereading the assignment, not trusting the initial implementation. For audit math, I intentionally used hardcoded rules because the prompt explicitly says knowing when not to use AI is part of the test.

## 5. Self-Rating

Discipline: 7/10. I kept pushing daily and ran tests/builds often, but the first pass under-read the full spec.

Code quality: 7/10. The core modules are typed and testable, though the form component could be split after submission.

Design sense: 6/10. The app is usable and clear, but the visual system is still more functional than Product Hunt-polished.

Problem-solving: 8/10. I debugged real Supabase, Resend, Next, and audit-logic issues systematically.

Entrepreneurial thinking: 7/10. The Credex lead-gen path is now clearer, but real interviews are still needed to sharpen the GTM.
