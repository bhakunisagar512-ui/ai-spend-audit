# Tests

## How to Run

```bash
npm test
npm run lint
npm run build
```

## Automated Tests

File: `src/lib/auditEngine.test.ts`

Coverage:
- Optimized stack returns zero savings
- Copilot Business with one seat recommends savings
- Total current spend is summed correctly
- Recommendations are returned when savings exist
- Empty tool list returns zero savings and no recommendations
- Cursor Business with two seats detects overpay
- v0 Business with a small coding team benchmarks a cheaper coding alternative
- Spend above public tier pricing is detected
- Annual savings equals monthly savings times 12
- High retail OpenAI API spend triggers Credex credit logic

## Manual Checks

- Complete the audit without logging in
- Confirm form state survives reloads
- Confirm results show monthly and annual savings
- Confirm high-savings audits surface Credex consultation
- Confirm low-savings audits show honest "you're spending well" messaging
- Submit email and verify Supabase + Resend
- Create a public share link and verify company name/email are absent
- Verify deployed Lighthouse scores stay above 85/90/90
