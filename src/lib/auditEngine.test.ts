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
        useCase: 'coding',
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
        useCase: 'coding',
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
        useCase: 'coding',
      },
      {
        name: 'chatgpt',
        currentTier: 'plus',
        seats: 1,
        monthlyTotal: 20,
        useCase: 'writing',
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
        useCase: 'coding',
      },
    ])

    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  test('handles empty tool list', () => {
    const result = runAudit([])

    expect(result.totalSavings).toBe(0)
    expect(result.recommendations).toHaveLength(0)
  })

  test('detects Cursor Business overpay for two seats', () => {
    const result = runAudit([
      {
        name: 'cursor',
        currentTier: 'business',
        seats: 2,
        monthlyTotal: 80,
        useCase: 'coding',
      },
    ])

    expect(result.totalSavings).toBe(50)
  })

  test('detects v0 Business overpay for small teams', () => {
    const result = runAudit([
      {
        name: 'v0',
        currentTier: 'business',
        seats: 3,
        monthlyTotal: 300,
        useCase: 'coding',
      },
    ])

    expect(result.totalOptimizedSpend).toBe(45)
  })

  test('detects spend above public tier pricing', () => {
    const result = runAudit([
      {
        name: 'cursor',
        currentTier: 'pro',
        seats: 5,
        monthlyTotal: 1500,
        useCase: 'coding',
      },
    ])

    expect(result.totalOptimizedSpend).toBe(75)
    expect(result.totalSavings).toBe(1425)
  })

  test('calculates annual savings', () => {
    const result = runAudit([
      {
        name: 'cursor',
        currentTier: 'business',
        seats: 1,
        monthlyTotal: 40,
        useCase: 'coding',
      },
    ])

    expect(result.totalAnnualSavings).toBe(result.totalSavings * 12)
  })

  test('applies Credex credit logic for high retail API spend', () => {
    const result = runAudit([
      {
        name: 'openaiApi',
        currentTier: 'api',
        seats: 1,
        monthlyTotal: 1000,
        useCase: 'mixed',
      },
    ])

    expect(result.totalSavings).toBe(350)
  })
})
