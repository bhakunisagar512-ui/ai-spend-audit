# Reflection

## 1. Hardest Bug

The hardest bug was the lead-save flow failing after the UI looked complete. The form submitted correctly, but the app returned "Could not save your audit." My first hypothesis was missing environment variables, so I checked that the Supabase and Resend variables existed without printing secret values. The next hypothesis was that Resend was failing and masking a successful database insert, so I separated the Supabase save path from the email send path mentally and checked which branch could still throw. The error continued even when email was optional, which narrowed the problem to Supabase.

The real issue was row level security. The route inserted a lead and then expected Supabase to return the inserted id, but the table policy allowed anonymous inserts without allowing anonymous selects. My first instinct was to loosen the policy, but that would have been a bad privacy trade-off because private lead rows include email and company name. The better fix was to generate the UUID server-side before insert, then use that id for related audit tools and recommendations. That solved the flow while keeping private lead data unreadable to anonymous clients. The bug was useful because it forced me to think about backend behavior and privacy together instead of treating RLS as an obstacle.

## 2. Decision I Reversed

I reversed the decision to keep the audit engine as a tiny plan-downgrade calculator. The first version was intentionally narrow because a small rule set is easy to test: if one person is on Copilot Business, recommend Individual; if a small team is on Cursor Business, recommend Pro. That was clean code, but after rereading the project statement it was not enough for Credex. The assignment is not just asking whether a SaaS plan is too expensive; it is asking whether AI spend creates a lead-generation moment for discounted AI infrastructure credits.

That reread changed the model. I added primary use case, API-direct tools, same-vendor downgrades, alternative-tool benchmarks, annual savings, and Credex credit logic for high retail spend. I also kept the LLM away from the math. The reversed decision made the engine more complex, but it made the product more honest: the app can now say "downgrade," "benchmark an alternative," or "talk to Credex about credits," depending on the situation. The trade-off is that the rules need better pricing maintenance over time. Still, deterministic rules are the right foundation because savings estimates must be debuggable and defensible.

## 3. Week 2

In week 2, I would build benchmark mode and a more credible conversion path. The current tool can estimate savings from plan fit, seat count, and high retail spend, but it does not yet answer the sharper question a founder has: "Is my AI spend normal for a team like mine?" I would add AI spend per employee and AI spend per developer, then compare those numbers against a small benchmark dataset built from early audits and user interviews. Even a rough benchmark would make the result page feel less like a calculator and more like a second opinion.

I would also move pricing rules out of code into versioned data. Each rule should carry a vendor URL, verification date, confidence level, and notes about edge cases such as annual billing, minimum seats, taxes, or custom enterprise pricing. Finally, I would replace the mailto consultation CTA with a real booking flow and track the funnel from audit completed to email captured to consultation booked to credit purchase. That would make the project easier to operate as a Credex acquisition channel instead of only a polished demo.

## 4. AI Usage

I used AI tools as a development assistant, not as a replacement for reading the assignment or checking the product. I used Codex/ChatGPT-style assistance for implementation planning, debugging hypotheses, documentation cleanup, and checking the repo against the PDF requirements. I did not trust AI with secrets, final pricing facts, fabricated interview content, or the actual audit math. For the audit engine, I intentionally used hardcoded rules because the assignment explicitly says the math should be deterministic and finance-literate.

One specific time AI-assisted work was wrong was after the first implementation pass. The app had a form, results, tests, and deployment, so it looked "done," but rereading the PDF exposed missing requirements: primary use case mattered, API-direct products were required, annual savings needed to be visible, and Credex needed stronger high-savings positioning. I caught that by comparing the repo against the assignment line by line, not by trusting the generated structure. The useful pattern was to let AI speed up drafts and refactors, then use the PDF, tests, and manual reasoning as the source of truth.

## 5. Self-Rating

Discipline: 7/10. I shipped across five distinct calendar days and kept improving the submission, but I should have mapped the full assignment into a checklist before writing the first version.

Code quality: 7/10. The audit engine is typed, isolated, and covered by tests, but the form component is doing too much and would benefit from being split into smaller step components after submission.

Design sense: 6/10. The UI is clear and usable, and the results page shows the important numbers, but it is still more functional than truly launch-polished.

Problem-solving: 8/10. I debugged real issues around Supabase RLS, API fallbacks, Next.js dynamic routes, and audit-rule scope by narrowing hypotheses instead of guessing randomly.

Entrepreneurial thinking: 7/10. The GTM, economics, interviews, and Credex CTA now connect the tool to a real business outcome, though the strongest next improvement would be more interviews with seed-stage founders and CTOs who already feel budget pressure.
