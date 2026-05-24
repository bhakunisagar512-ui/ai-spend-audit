"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { runAudit, type AuditResult, type Tool, type ToolName } from "@/lib/auditEngine";

type ToolOption = {
  id: ToolName;
  label: string;
  tiers: { label: string; value: string }[];
};

type ToolCost = {
  monthlyCost: string;
  seats: string;
  currentTier: string;
};

type FormState = {
  step: number;
  companyName: string;
  teamSize: string;
  selectedTools: ToolName[];
  toolCosts: Record<string, ToolCost>;
  email: string;
};

const STORAGE_KEY = "ai-spend-audit-form";
const CONSULTATION_THRESHOLD = 500;

const TOOL_OPTIONS: ToolOption[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    tiers: [
      { label: "Plus", value: "plus" },
      { label: "Business", value: "business" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    tiers: [
      { label: "Pro", value: "pro" },
      { label: "Team", value: "team" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    tiers: [
      { label: "Pro", value: "pro" },
      { label: "Business", value: "business" },
      { label: "Pro+", value: "proPlus" },
    ],
  },
  {
    id: "cursor",
    label: "Cursor",
    tiers: [
      { label: "Pro", value: "pro" },
      { label: "Teams", value: "teams" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    tiers: [
      { label: "Pro", value: "pro" },
      { label: "Ultra", value: "ultra" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    tiers: [
      { label: "Pro", value: "pro" },
      { label: "Teams", value: "teams" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
  {
    id: "v0",
    label: "v0",
    tiers: [
      { label: "Team", value: "team" },
      { label: "Business", value: "business" },
      { label: "Enterprise", value: "enterprise" },
    ],
  },
];

const DEFAULT_STATE: FormState = {
  step: 1,
  companyName: "",
  teamSize: "",
  selectedTools: [],
  toolCosts: {},
  email: "",
};

export default function AuditForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryStatus, setSummaryStatus] = useState<"idle" | "loading" | "done">("idle");
  const [leadStatus, setLeadStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [leadMessage, setLeadMessage] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const nextForm = { ...DEFAULT_STATE, ...JSON.parse(saved) };
        queueMicrotask(() => setForm(nextForm));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    queueMicrotask(() => setHasLoaded(true));
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, hasLoaded]);

  const auditTools = useMemo<Tool[]>(
    () =>
      form.selectedTools.map((tool) => ({
        name: tool,
        currentTier: form.toolCosts[tool]?.currentTier || getDefaultTier(tool),
        seats: toNumber(form.toolCosts[tool]?.seats),
        monthlyTotal: toNumber(form.toolCosts[tool]?.monthlyCost),
      })),
    [form.selectedTools, form.toolCosts]
  );

  const auditResult = useMemo(() => runAudit(auditTools), [auditTools]);
  const needsConsultation = auditResult.totalSavings >= CONSULTATION_THRESHOLD;

  useEffect(() => {
    if (form.step !== 4 || summaryStatus !== "idle") {
      return;
    }

    async function loadSummary() {
      setSummaryStatus("loading");

      const response = await fetch("/api/audit-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          teamSize: form.teamSize,
          tools: auditTools,
          result: auditResult,
        }),
      });

      const data = (await response.json()) as { summary: string };

      setSummary(data.summary);
      setSummaryStatus("done");
    }

    loadSummary().catch(() => {
      setSummary(getFallbackSummary(form.companyName, auditResult));
      setSummaryStatus("done");
    });
  }, [auditResult, auditTools, form.companyName, form.step, form.teamSize, summaryStatus]);

  function updateForm(update: Partial<FormState>) {
    setForm((current) => ({ ...current, ...update }));
  }

  function toggleTool(tool: ToolName, checked: boolean) {
    setForm((current) => {
      const selectedTools = checked
        ? [...current.selectedTools, tool]
        : current.selectedTools.filter((selected) => selected !== tool);

      return {
        ...current,
        selectedTools,
        toolCosts: {
          ...current.toolCosts,
          [tool]: current.toolCosts[tool] ?? {
            monthlyCost: "",
            seats: "1",
            currentTier: getDefaultTier(tool),
          },
        },
      };
    });
  }

  function updateToolCost(tool: ToolName, update: Partial<ToolCost>) {
    setForm((current) => ({
      ...current,
      toolCosts: {
        ...current.toolCosts,
        [tool]: getUpdatedToolCost(tool, current.toolCosts[tool], update),
      },
    }));
  }

  async function saveLead() {
    setLeadStatus("loading");
    setLeadMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        email: form.email,
        teamSize: toNumber(form.teamSize),
        tools: auditTools,
        result: auditResult,
        consultationRequested: needsConsultation,
        website,
      }),
    });

    const data = (await response.json()) as { message?: string };

    if (response.ok) {
      setLeadStatus("saved");
      setLeadMessage(data.message || "Audit saved. Check your inbox for the confirmation.");
    } else {
      setLeadStatus("error");
      setLeadMessage(data.message || "Could not save your audit. Try again in a minute.");
    }
  }

  return (
    <div className="border rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">Step {form.step} of 4</p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setForm(DEFAULT_STATE);
            setSummary("");
            setSummaryStatus("idle");
          }}
          className="text-sm text-gray-500 underline-offset-4 hover:underline"
        >
          Reset
        </button>
      </div>

      {form.step === 1 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Company Information</h2>

          <input
            type="text"
            placeholder="Company Name"
            value={form.companyName}
            onChange={(event) => updateForm({ companyName: event.target.value })}
            className="mb-4 w-full rounded-lg border p-3"
          />

          <input
            type="number"
            min="1"
            placeholder="Team Size"
            value={form.teamSize}
            onChange={(event) => updateForm({ teamSize: event.target.value })}
            className="mb-4 w-full rounded-lg border p-3"
          />

          <Button
            type="button"
            size="lg"
            onClick={() => updateForm({ step: 2 })}
            disabled={!form.companyName || !form.teamSize}
          >
            Continue
          </Button>
        </section>
      )}

      {form.step === 2 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">Select AI Tools</h2>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {TOOL_OPTIONS.map((tool) => (
              <label
                key={tool.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4"
              >
                <input
                  type="checkbox"
                  checked={form.selectedTools.includes(tool.id)}
                  onChange={(event) => toggleTool(tool.id, event.target.checked)}
                />
                <span>{tool.label}</span>
              </label>
            ))}
          </div>

          <NavButtons
            back={() => updateForm({ step: 1 })}
            next={() => updateForm({ step: 3 })}
            nextDisabled={form.selectedTools.length === 0}
          />
        </section>
      )}

      {form.step === 3 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold">Tool Spending Details</h2>

          <div className="mb-6 space-y-5">
            {form.selectedTools.map((toolId) => {
              const tool = TOOL_OPTIONS.find((option) => option.id === toolId);

              if (!tool) {
                return null;
              }

              return (
                <div key={tool.id} className="rounded-lg border p-4">
                  <h3 className="mb-4 font-semibold">{tool.label}</h3>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      value={form.toolCosts[tool.id]?.currentTier || getDefaultTier(tool.id)}
                      onChange={(event) =>
                        updateToolCost(tool.id, { currentTier: event.target.value })
                      }
                      className="w-full rounded-lg border bg-white p-3"
                    >
                      {tool.tiers.map((tier) => (
                        <option key={tier.value} value={tier.value}>
                          {tier.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      placeholder="Monthly Cost ($)"
                      value={form.toolCosts[tool.id]?.monthlyCost || ""}
                      onChange={(event) =>
                        updateToolCost(tool.id, { monthlyCost: event.target.value })
                      }
                      className="w-full rounded-lg border p-3"
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="Seats"
                      value={form.toolCosts[tool.id]?.seats || ""}
                      onChange={(event) => updateToolCost(tool.id, { seats: event.target.value })}
                      className="w-full rounded-lg border p-3"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <NavButtons
            back={() => updateForm({ step: 2 })}
            next={() => {
              setSummary("");
              setSummaryStatus("idle");
              updateForm({ step: 4 });
            }}
            nextDisabled={auditTools.some((tool) => tool.monthlyTotal <= 0 || tool.seats <= 0)}
          />
        </section>
      )}

      {form.step === 4 && (
        <ResultsView
          form={form}
          auditResult={auditResult}
          auditTools={auditTools}
          summary={summary}
          summaryStatus={summaryStatus}
          needsConsultation={needsConsultation}
          email={form.email}
          website={website}
          leadStatus={leadStatus}
          leadMessage={leadMessage}
          setEmail={(email) => updateForm({ email })}
          setWebsite={setWebsite}
          saveLead={saveLead}
          back={() => updateForm({ step: 3 })}
        />
      )}
    </div>
  );
}

function ResultsView({
  form,
  auditResult,
  auditTools,
  summary,
  summaryStatus,
  needsConsultation,
  email,
  website,
  leadStatus,
  leadMessage,
  setEmail,
  setWebsite,
  saveLead,
  back,
}: {
  form: FormState;
  auditResult: AuditResult;
  auditTools: Tool[];
  summary: string;
  summaryStatus: "idle" | "loading" | "done";
  needsConsultation: boolean;
  email: string;
  website: string;
  leadStatus: "idle" | "loading" | "saved" | "error";
  leadMessage: string;
  setEmail: (email: string) => void;
  setWebsite: (website: string) => void;
  saveLead: () => void;
  back: () => void;
}) {
  return (
    <section>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Audit Results</h2>
          <p className="text-sm text-gray-500">{form.companyName} spend snapshot</p>
        </div>
        <Button type="button" variant="outline" onClick={back}>
          <ArrowLeft />
          Back
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Current Spend" value={formatCurrency(auditResult.totalCurrentSpend)} />
        <Metric label="Optimized Spend" value={formatCurrency(auditResult.totalOptimizedSpend)} />
        <Metric label="Monthly Savings" value={formatCurrency(auditResult.totalSavings)} strong />
      </div>

      {needsConsultation && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 size-5 text-emerald-700" />
            <div>
              <h3 className="font-semibold text-emerald-950">Credex consultation recommended</h3>
              <p className="text-sm text-emerald-800">
                Your estimated savings are above $500/month. This is large enough to justify a
                deeper vendor and seat audit.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 space-y-3">
        {auditTools.map((tool) => (
          <div key={tool.name} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold">{getToolLabel(tool.name)}</h3>
              <span className="text-sm text-gray-500">{tool.seats} seats</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {tool.currentTier} tier, {formatCurrency(tool.monthlyTotal)}/month
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Recommendations</h3>
        {auditResult.recommendations.length > 0 ? (
          <div className="space-y-3">
            {auditResult.recommendations.map((recommendation) => (
              <div key={`${recommendation.tool}-${recommendation.suggestion}`} className="text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{getToolLabel(recommendation.tool)}</p>
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(recommendation.monthlySavings)}/mo
                  </p>
                </div>
                <p className="text-gray-600">{recommendation.suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No obvious savings found from the current rules. Keep checking usage before renewals.
          </p>
        )}
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">AI Summary</h3>
        <p className="text-sm leading-6 text-gray-700">
          {summaryStatus === "loading" ? "Generating summary..." : summary}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Email This Audit</h3>
        <div className="hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border p-3"
          />
          <Button
            type="button"
            size="lg"
            onClick={saveLead}
            disabled={!email || leadStatus === "loading" || leadStatus === "saved"}
          >
            {leadStatus === "saved" ? <Check /> : <Mail />}
            {leadStatus === "loading" ? "Saving..." : "Send"}
          </Button>
        </div>
        {leadMessage && (
          <p className={`mt-3 text-sm ${leadStatus === "error" ? "text-red-600" : "text-gray-600"}`}>
            {leadMessage}
          </p>
        )}
      </div>
    </section>
  );
}

function NavButtons({
  back,
  next,
  nextDisabled,
}: {
  back: () => void;
  next: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="outline" size="lg" onClick={back}>
        Back
      </Button>
      <Button type="button" size="lg" onClick={next} disabled={nextDisabled}>
        Continue
      </Button>
    </div>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${strong ? "text-emerald-700" : ""}`}>{value}</p>
    </div>
  );
}

function getDefaultTier(tool: ToolName): string {
  return TOOL_OPTIONS.find((option) => option.id === tool)?.tiers[0]?.value || "pro";
}

function getUpdatedToolCost(
  tool: ToolName,
  current: ToolCost | undefined,
  update: Partial<ToolCost>
): ToolCost {
  return {
    monthlyCost: current?.monthlyCost || "",
    seats: current?.seats || "1",
    currentTier: current?.currentTier || getDefaultTier(tool),
    ...update,
  };
}

function getToolLabel(tool: ToolName): string {
  return TOOL_OPTIONS.find((option) => option.id === tool)?.label || tool;
}

function toNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getFallbackSummary(companyName: string, result: AuditResult): string {
  const name = companyName || "Your team";
  const savings = formatCurrency(result.totalSavings);

  if (result.totalSavings > 0) {
    return `${name} is spending ${formatCurrency(
      result.totalCurrentSpend
    )}/month on AI tools. The current rules found ${savings}/month in likely savings, mostly from matching small teams to individual or lighter team plans. Review each recommendation before renewal and remove unused seats first.`;
  }

  return `${name} is spending ${formatCurrency(
    result.totalCurrentSpend
  )}/month on AI tools. The current rules did not find obvious savings, so the next step is checking actual usage, inactive seats, and duplicated tools before renewal.`;
}
