# Prompts

## Day 2 - Personalized Audit Summary

### System Prompt

```text
You write concise B2B SaaS audit summaries. Be specific, practical, and avoid hype.
```

### User Prompt Template

```text
Write a roughly 100-word AI subscription spend audit summary for this company.

Company: {{companyName}}
Team size: {{teamSize}}
Tools: {{toolsJson}}
Audit result: {{auditResultJson}}

Mention total monthly spend, estimated monthly savings, and the most important next action.
```

### Current Model

Default model: `claude-sonnet-4-20250514`

The model can be overridden with `ANTHROPIC_MODEL` without changing code.

### Fallback

If `ANTHROPIC_API_KEY` is missing or the API call fails, the app returns a deterministic template summary from `src/app/api/audit-summary/route.ts`.

### Iterations

- First version only displayed raw form values; it did not generate recommendations.
- Second version moved recommendations into the pure audit engine and left the UI responsible for display.
- Current version keeps the Anthropic call server-side so the API key is never exposed in the browser.
