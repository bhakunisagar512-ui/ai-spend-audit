export type Tool = {
  name: string
  currentTier: string
  seats: number
  monthlyTotal: number
}

export type Recommendation = {
  tool: string
  issue: string
  suggestion: string
  monthlySavings: number
}

export type AuditResult = {
  totalCurrentSpend: number
  totalOptimizedSpend: number
  totalSavings: number
  recommendations: Recommendation[]
}

const PRICING = {
  cursor: { pro: 20, business: 40 },
  copilot: { individual: 10, business: 19, enterprise: 39 },
  chatgpt: { plus: 20, team: 25, enterprise: 60 },
  claude: { pro: 20, team: 25 },
  gemini: { business: 20, enterprise: 30 },
}

export function runAudit(tools: Tool[]): AuditResult {
  const recommendations: Recommendation[] = []
  let totalOptimizedSpend = 0

  for (const tool of tools) {
    const optimizedMonthly = getOptimizedCost(tool)
    const savings = tool.monthlyTotal - optimizedMonthly

    totalOptimizedSpend += optimizedMonthly

    if (savings > 0) {
      recommendations.push({
        tool: tool.name,
        issue: `Paying $${tool.monthlyTotal}/mo`,
        suggestion: getSuggestion(tool),
        monthlySavings: savings,
      })
    }
  }

  const totalCurrentSpend = tools.reduce(
    (sum, t) => sum + t.monthlyTotal,
    0
  )

  return {
    totalCurrentSpend,
    totalOptimizedSpend,
    totalSavings: totalCurrentSpend - totalOptimizedSpend,
    recommendations,
  }
}

function getOptimizedCost(tool: Tool): number {
  if (
    tool.name === 'copilot' &&
    tool.seats <= 2 &&
    tool.currentTier === 'business'
  ) {
    return PRICING.copilot.individual * tool.seats
  }

  return tool.monthlyTotal
}

function getSuggestion(tool: Tool): string {
  if (tool.name === 'copilot' && tool.seats <= 2) {
    return 'Switch to Individual plan — Business tier is only worth it at 3+ seats'
  }

  return 'Consider downgrading tier based on actual usage'
}