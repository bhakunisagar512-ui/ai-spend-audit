import { describe, expect, test } from 'vitest'
import { runAudit } from './auditEngine'

describe('runAudit', () => {
  test('returns zero savings for optimized stack', () => {
    const result = runAudit([
      {
        name: 'cursor',
        currentTier: 'pro',
        seats: 1,
        monthlyTotal: 20,
      },
    ])

    expect(result.totalSavings).toBe(0)
  })

  test('detects overpaying on Copilot business with 1 seat', () => {
    const result = runAudit([
      {
        name: 'copilot',
        currentTier: 'business',
        seats: 1,
        monthlyTotal: 19,
      },
    ])

    expect(result.totalSavings).toBeGreaterThan(0)
  })

  test('calculates total spend correctly', () => {
    const result = runAudit([
      {
        name: 'cursor',
        currentTier: 'pro',
        seats: 1,
        monthlyTotal: 20,
      },
      {
        name: 'chatgpt',
        currentTier: 'plus',
        seats: 1,
        monthlyTotal: 20,
      },
    ])

    expect(result.totalCurrentSpend).toBe(40)
  })

  test('returns recommendation when savings exist', () => {
    const result = runAudit([
      {
        name: 'copilot',
        currentTier: 'business',
        seats: 1,
        monthlyTotal: 19,
      },
    ])

    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  test('handles empty tool list', () => {
    const result = runAudit([])

    expect(result.totalSavings).toBe(0)
    expect(result.recommendations).toHaveLength(0)
  })

  test('detects Cursor Teams overpay for two seats', () => {
    const result = runAudit([
      {
        name: 'cursor',
        currentTier: 'teams',
        seats: 2,
        monthlyTotal: 80,
      },
    ])

    expect(result.totalSavings).toBe(40)
  })

  test('detects v0 Business overpay for small teams', () => {
    const result = runAudit([
      {
        name: 'v0',
        currentTier: 'business',
        seats: 3,
        monthlyTotal: 300,
      },
    ])

    expect(result.totalOptimizedSpend).toBe(90)
  })
})
