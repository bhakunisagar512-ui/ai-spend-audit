# Tests

## How to Run

```bash
npm test
npm run lint
npm run build
```

## Current Automated Tests

Test file: `src/lib/auditEngine.test.ts`

Coverage:
- Returns zero savings for an already optimized stack
- Detects overpaying on GitHub Copilot Business with one seat
- Calculates total current spend across tools
- Returns recommendations when savings exist
- Handles an empty tool list
- Detects Cursor Teams overpay for two seats
- Detects v0 Business overpay for small teams

## Manual Checks

- Fill company name and team size
- Select one or more tools
- Enter monthly cost, seats, and tier
- Confirm Step 4 shows total spend, optimized spend, savings, recommendations, and summary
- Refresh the page and confirm form data survives through `localStorage`
- Submit email with the honeypot empty
- Confirm missing Anthropic/Resend keys use fallback behavior instead of breaking the UI
