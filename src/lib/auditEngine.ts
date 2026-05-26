export type ToolName =
  | "chatgpt"
  | "claude"
  | "copilot"
  | "cursor"
  | "gemini"
  | "windsurf"
  | "v0"
  | "anthropicApi"
  | "openaiApi"

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed"

export type Tool = {
  name: ToolName
  currentTier: string
  seats: number
  monthlyTotal: number
  useCase?: UseCase
}

export type Recommendation = {
  tool: ToolName
  issue: string
  suggestion: string
  monthlySavings: number
  annualSavings: number
  optimizedSpend: number
  reason: string
}

export type AuditResult = {
  totalCurrentSpend: number
  totalOptimizedSpend: number
  totalSavings: number
  totalAnnualSavings: number
  recommendations: Recommendation[]
}

type Price = number | null
type Option = {
  optimizedSpend: number
  suggestion: string
  reason: string
}

export const PRICING: Record<ToolName, Record<string, Price>> = {
  chatgpt: { plus: 20, team: 25, enterprise: null, api: null },
  claude: { free: 0, pro: 20, max: 100, team: 30, enterprise: null, api: null },
  copilot: { individual: 10, business: 19, enterprise: 39 },
  cursor: { hobby: 0, pro: 20, business: 40, enterprise: null },
  gemini: { pro: 20, ultra: 100, api: null },
  windsurf: { free: 0, pro: 15, teams: 30, enterprise: 60 },
  v0: { free: 0, team: 30, business: 100, enterprise: null },
  anthropicApi: { api: null },
  openaiApi: { api: null },
}

const CREDEX_DISCOUNT_RATE = 0.35
const CREDEX_MINIMUM_SPEND = 500

export function runAudit(tools: Tool[]): AuditResult {
  const recommendations: Recommendation[] = []
  let totalOptimizedSpend = 0

  for (const tool of tools) {
    const bestOption = getBestOption(tool)
    const savings = Math.max(tool.monthlyTotal - bestOption.optimizedSpend, 0)

    totalOptimizedSpend += bestOption.optimizedSpend

    if (savings > 0) {
      recommendations.push({
        tool: tool.name,
        issue: `Current spend is $${tool.monthlyTotal}/mo for ${tool.seats} seat${
          tool.seats === 1 ? "" : "s"
        }`,
        suggestion: bestOption.suggestion,
        monthlySavings: savings,
        annualSavings: savings * 12,
        optimizedSpend: bestOption.optimizedSpend,
        reason: bestOption.reason,
      })
    }
  }

  const totalCurrentSpend = tools.reduce(
    (sum, tool) => sum + tool.monthlyTotal,
    0
  )
  const totalSavings = totalCurrentSpend - totalOptimizedSpend

  return {
    totalCurrentSpend,
    totalOptimizedSpend,
    totalSavings,
    totalAnnualSavings: totalSavings * 12,
    recommendations,
  }
}

function getBestOption(tool: Tool): Option {
  const options: Option[] = [
    {
      optimizedSpend: tool.monthlyTotal,
      suggestion: "Keep current plan",
      reason: "The current rule set did not find a cheaper fit.",
    },
  ]

  const publicPlanCost = getPublicPlanCost(tool)

  if (publicPlanCost !== null && publicPlanCost < tool.monthlyTotal) {
    options.push({
      optimizedSpend: publicPlanCost,
      suggestion: `Reconcile billing to public ${tool.currentTier} pricing`,
      reason:
        "Entered spend is above the vendor's public seat price. Check inactive seats, add-ons, taxes, duplicate workspaces, or billing errors.",
    })
  }

  const sameVendor = getSameVendorDowngrade(tool)
  if (sameVendor) {
    options.push(sameVendor)
  }

  const alternative = getAlternativeToolOption(tool)
  if (alternative) {
    options.push(alternative)
  }

  const credex = getCredexCreditOption(tool)
  if (credex) {
    options.push(credex)
  }

  return options.reduce((best, option) =>
    option.optimizedSpend < best.optimizedSpend ? option : best
  )
}

function getSameVendorDowngrade(tool: Tool): Option | null {
  const tier = normalizeTier(tool.currentTier)

  if (tool.name === "copilot" && tier === "business" && tool.seats <= 2) {
    return {
      optimizedSpend: PRICING.copilot.individual! * tool.seats,
      suggestion: "Switch small teams from Copilot Business to Individual",
      reason: "For one or two users, individual seats are usually cheaper unless org controls are required.",
    }
  }

  if (tool.name === "cursor" && tier === "business" && tool.seats <= 2) {
    return {
      optimizedSpend: PRICING.cursor.pro! * tool.seats,
      suggestion: "Use Cursor Pro until team controls are needed",
      reason: "Cursor Business is mainly justified by shared admin, privacy, and team controls.",
    }
  }

  if (tool.name === "claude" && tier === "team" && tool.seats < 5) {
    return {
      optimizedSpend: PRICING.claude.pro! * tool.seats,
      suggestion: "Use Claude Pro seats instead of Team",
      reason: "Claude Team has a 5-member minimum, so very small teams should avoid paying for unused minimum seats.",
    }
  }

  if (tool.name === "chatgpt" && tier === "team" && tool.seats < 2) {
    return {
      optimizedSpend: PRICING.chatgpt.plus! * tool.seats,
      suggestion: "Use ChatGPT Plus until at least two users need a workspace",
      reason: "ChatGPT Team is useful for shared workspaces, but a solo user is cheaper on Plus.",
    }
  }

  if (tool.name === "v0" && tier === "business" && tool.seats <= 3) {
    return {
      optimizedSpend: PRICING.v0.team! * tool.seats,
      suggestion: "Use v0 Team before Business",
      reason: "Small teams should usually wait for security or governance needs before paying for Business.",
    }
  }

  return null
}

function getAlternativeToolOption(tool: Tool): Option | null {
  const useCase = tool.useCase || "mixed"

  const codingBenchmark = PRICING.windsurf.pro! * tool.seats
  if (useCase === "coding" && isSubstantialSavings(tool.monthlyTotal, codingBenchmark)) {
    return {
      optimizedSpend: codingBenchmark,
      suggestion: "Benchmark Windsurf Pro as a lower-cost coding assistant",
      reason: "For coding-heavy teams, Windsurf Pro is a cheaper comparable coding workflow to test before renewing higher retail spend.",
    }
  }

  if (
    ["writing", "research", "mixed"].includes(useCase) &&
    isSubstantialSavings(tool.monthlyTotal, PRICING.chatgpt.plus! * tool.seats) &&
    !["chatgpt", "openaiApi"].includes(tool.name)
  ) {
    return {
      optimizedSpend: PRICING.chatgpt.plus! * tool.seats,
      suggestion: "Benchmark ChatGPT Plus for general knowledge work",
      reason: "For writing, research, and mixed usage, a lower-cost ChatGPT seat may cover the same workflow before enterprise features are needed.",
    }
  }

  const dataBenchmark = PRICING.gemini.pro! * tool.seats
  if (useCase === "data" && isSubstantialSavings(tool.monthlyTotal, dataBenchmark)) {
    return {
      optimizedSpend: dataBenchmark,
      suggestion: "Benchmark Gemini Pro for data-heavy analysis",
      reason: "For data and analysis use cases, Gemini Pro is a low-cost benchmark before paying for higher tiers or API-heavy workflows.",
    }
  }

  return null
}

function isSubstantialSavings(currentSpend: number, candidateSpend: number): boolean {
  const savings = currentSpend - candidateSpend
  return savings >= 25 && savings / currentSpend >= 0.2
}

function getCredexCreditOption(tool: Tool): Option | null {
  if (!isCredexEligible(tool) || tool.monthlyTotal < CREDEX_MINIMUM_SPEND) {
    return null
  }

  const optimizedSpend = Math.round(tool.monthlyTotal * (1 - CREDEX_DISCOUNT_RATE))

  return {
    optimizedSpend,
    suggestion: "Talk to Credex about discounted AI credits",
    reason:
      "High retail AI spend may be eligible for discounted credits from overforecasted vendor commitments, preserving capability while reducing cash cost.",
  }
}

function isCredexEligible(tool: Tool): boolean {
  const tier = normalizeTier(tool.currentTier)

  return (
    ["cursor", "chatgpt", "claude", "anthropicApi", "openaiApi"].includes(tool.name) ||
    tier === "enterprise" ||
    tier === "api"
  )
}

function getPublicPlanCost(tool: Tool): number | null {
  const tierPrice = PRICING[tool.name][normalizeTier(tool.currentTier)]

  if (tierPrice === null || tierPrice === undefined || tool.seats <= 0) {
    return null
  }

  return tierPrice * tool.seats
}

function normalizeTier(tier: string): string {
  return tier.trim().toLowerCase()
}
