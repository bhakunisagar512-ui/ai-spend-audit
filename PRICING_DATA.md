# AI Tool Pricing Research

Last verified: 2026-05-24

Prices change often. Use this file as the audit engine's research baseline, not as a guarantee of live vendor pricing.

---

## Cursor

Official URL: https://cursor.com/pricing

| Tier | Monthly Price |
|------|---------------|
| Hobby | Free |
| Individual Pro | $20 |
| Teams | $40/user |
| Enterprise | Custom |

Notes:
- Cursor lists Individual at $20/month and Teams at $40/user/month.
- Enterprise is custom pricing.

---

## GitHub Copilot

Official URL: https://github.com/features/copilot/plans

| Tier | Monthly Price |
|------|---------------|
| Free | $0 |
| Pro | $10/user |
| Pro+ | $39/user |
| Business | Organization pricing, verify before using |
| Enterprise | Organization pricing, verify before using |

Notes:
- GitHub currently lists Pro at $10/user/month and Pro+ at $39/user/month.
- Older Copilot Business and Enterprise pricing has commonly been $19/user/month and $39/user/month, but current org billing should be verified before using in production recommendations.

---

## ChatGPT

Official URL: https://chatgpt.com/pricing/

| Tier | Monthly Price |
|------|---------------|
| Free | $0 |
| Plus | Verify on live page |
| Pro | Verify on live page |
| Business Codex | Usage pricing |
| Business ChatGPT & Codex | Per user/month, verify on live page |
| Enterprise | Custom |

Notes:
- The current page distinguishes individual, business, and enterprise plans.
- Business Codex is usage-based with no fixed seat fee.
- Enterprise uses custom pricing.

---

## Claude

Official URLs:
- https://claude.com/pricing
- https://support.claude.com/en/articles/9267289-how-is-my-team-plan-bill-calculated

| Tier | Monthly Price |
|------|---------------|
| Pro | Verify on live page |
| Team Standard | $25/member annual or $30/member monthly |
| Team Premium | $150/member |
| Enterprise | Custom |

Notes:
- Claude's Help Center states prices can vary by region and tax handling.
- Team plans have a 5-member minimum.

---

## Gemini

Official URL: https://gemini.google/us/subscriptions/

| Tier | Monthly Price |
|------|---------------|
| Free | $0 |
| Google AI Pro | Verify on live page |
| Google AI Ultra 5x | $99.99 |
| Google AI Ultra 20x | $199.99 |
| Gemini Enterprise | Verify on Google Cloud/Workspace quote |

Notes:
- Google AI Ultra is listed at $99.99/month for 5x higher limits and $199.99/month for 20x higher limits.
- Business Workspace/Gemini Enterprise pricing changes frequently and should be rechecked before adding automated savings logic.

---

## Windsurf

Official URLs:
- https://docs.windsurf.com/windsurf/accounts/usage
- https://windsurf.com/pricing

| Tier | Monthly Price |
|------|---------------|
| Free | $0 |
| Pro | $15 |
| Teams | $30/user |
| Enterprise | $60/user |

Notes:
- Windsurf docs list Pro at $15/month, Teams at $30/user/month, and Enterprise at $60/user/month.
- Add-on prompt credits are separate from base subscription pricing.

---

## v0

Official URL: https://v0.app/pricing

| Tier | Monthly Price |
|------|---------------|
| Free | $0 |
| Team | $30/user |
| Business | $100/user |
| Enterprise | Custom |

Model usage pricing:

| Model | Input | Cache Write | Cache Read | Output |
|-------|-------|-------------|------------|--------|
| v0 Mini | $1/1M tokens | $1.25/1M tokens | $0.10/1M tokens | $5/1M tokens |
| v0 Pro | $3/1M tokens | $3.75/1M tokens | $0.30/1M tokens | $15/1M tokens |
| v0 Max | $5/1M tokens | $6.25/1M tokens | $0.50/1M tokens | $25/1M tokens |
| v0 Max Fast | $30/1M tokens | $37.50/1M tokens | $3/1M tokens | $150/1M tokens |

Notes:
- v0 includes monthly credits by plan and charges additional usage by model/token class.
