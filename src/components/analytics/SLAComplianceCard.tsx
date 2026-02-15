'use client';

interface SLAData {
  stepName: string;
  compliance: number;
}

interface SLAComplianceCardProps {
  overallCompliance: number;
  stepCompliance: SLAData[];
}

export default function SLAComplianceCard({
  overallCompliance,
  stepCompliance,
}: SLAComplianceCardProps) {
  const getComplianceColor = (value: number) => {
    if (value >= 90) return 'bg-emerald-500';
    if (value >= 75) return 'bg-lime-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplianceTextColor = (value: number) => {
    if (value >= 90) return 'text-emerald-400';
    if (value >= 75) return 'text-lime-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Sort by compliance (lowest first to highlight problem areas)
  const sortedSteps = [...stepCompliance].sort((a, b) => a.compliance - b.compliance);
  const worstSteps = sortedSteps.slice(0, 5);

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            SLA Compliance
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Steps within estimated time</p>
        </div>
        <div className={`text-3xl font-bold font-display ${getComplianceTextColor(overallCompliance)}`}>
          {overallCompliance}%
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className={`h-full ${getComplianceColor(overallCompliance)} transition-all duration-500`}
            style={{ width: `${overallCompliance}%` }}
          />
        </div>
      </div>

      {/* Steps needing attention */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
          Steps Needing Attention
        </p>
        {worstSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-secondary)] truncate">{step.stepName}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getComplianceColor(step.compliance)}`}
                  style={{ width: `${step.compliance}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-10 text-right ${getComplianceTextColor(step.compliance)}`}>
                {step.compliance}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
