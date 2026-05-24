export type ToolName =
  | "chatgpt"
  | "claude"
  | "copilot"
  | "cursor"
  | "gemini"
  | "windsurf"
  | "v0"

export type Tool = {
  name: ToolName
  currentTier: string
  seats: number
  monthlyTotal: number
}

export type Recommendation = {
  tool: ToolName
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

export const PRICING: Record<ToolName, Record<string, number>> = {
  chatgpt: { plus: 20, business: 25 },
  claude: { pro: 20, team: 30 },
  copilot: { pro: 10, business: 19, proPlus: 39 },
  cursor: { pro: 20, teams: 40 },
  gemini: { pro: 20, ultra: 100 },
  windsurf: { pro: 15, teams: 30, enterprise: 60 },
  v0: { team: 30, business: 100 },
}

export function runAudit(tools: Tool[]): AuditResult {
  const recommendations: Recommendation[] = []
  let totalOptimizedSpend = 0

  for (const tool of tools) {
    const optimizedMonthly = getOptimizedCost(tool)
    const savings = Math.max(tool.monthlyTotal - optimizedMonthly, 0)

    totalOptimizedSpend += optimizedMonthly

    if (savings > 0) {
      recommendations.push({
        tool: tool.name,
        issue: `Paying $${tool.monthlyTotal}/mo for ${tool.seats} seat${
          tool.seats === 1 ? "" : "s"
        }`,
        suggestion: getSuggestion(tool),
        monthlySavings: savings,
      })
    }
  }

  const totalCurrentSpend = tools.reduce(
    (sum, tool) => sum + tool.monthlyTotal,
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
  const normalizedTier = normalizeTier(tool.currentTier)

  if (tool.name === "copilot" && normalizedTier === "business" && tool.seats <= 2) {
    return PRICING.copilot.pro * tool.seats
  }

  if (tool.name === "cursor" && normalizedTier === "teams" && tool.seats <= 2) {
    return PRICING.cursor.pro * tool.seats
  }

  if (tool.name === "claude" && normalizedTier === "team" && tool.seats < 5) {
    return PRICING.claude.pro * tool.seats
  }

  if (tool.name === "chatgpt" && normalizedTier === "business" && tool.seats < 2) {
    return PRICING.chatgpt.plus * tool.seats
  }

  if (tool.name === "v0" && normalizedTier === "business" && tool.seats <= 3) {
    return PRICING.v0.team * tool.seats
  }

  return tool.monthlyTotal
}

function getSuggestion(tool: Tool): string {
  const normalizedTier = normalizeTier(tool.currentTier)

  if (tool.name === "copilot" && normalizedTier === "business" && tool.seats <= 2) {
    return "Switch small teams to Copilot Pro until organization controls are needed."
  }

  if (tool.name === "cursor" && normalizedTier === "teams" && tool.seats <= 2) {
    return "Use Cursor Pro for one or two users unless shared team controls are required."
  }

  if (tool.name === "claude" && normalizedTier === "team" && tool.seats < 5) {
    return "Claude Team has a 5-member minimum, so individual Pro seats are likely cheaper."
  }

  if (tool.name === "chatgpt" && normalizedTier === "business" && tool.seats < 2) {
    return "ChatGPT Business starts at 2 users, so a solo user should stay on Plus."
  }

  if (tool.name === "v0" && normalizedTier === "business" && tool.seats <= 3) {
    return "Use v0 Team until the business security package is worth the premium."
  }

  return "Review usage and downgrade seats or tiers that are not actively used."
}

function normalizeTier(tier: string): string {
  return tier.trim().toLowerCase()
}
