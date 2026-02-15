'use client';

interface ProcessHealthCardProps {
  processName: string;
  healthScore: number; // 0-100
  completionRate: number;
  avgDuration: string;
  bottleneckCount: number;
}

export default function ProcessHealthCard({
  processName,
  healthScore,
  completionRate,
  avgDuration,
  bottleneckCount,
}: ProcessHealthCardProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-lime-500', text: 'text-lime-400', label: 'Good' };
    if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Fair' };
    return { bg: 'bg-red-500', text: 'text-red-400', label: 'Needs Attention' };
  };

  const health = getHealthColor(healthScore);

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Process Health
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{processName}</p>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${health.bg}/20 ${health.text}`}>
          {health.label}
        </div>
      </div>

      {/* Health Score Circle */}
      <div className="flex items-center justify-center my-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="12"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(healthScore / 100) * 352} 352`}
              className={health.text}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-display ${health.text}`}>
              {healthScore}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">/ 100</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--accent-cyan)]">{completionRate}%</p>
          <p className="text-xs text-[var(--text-tertiary)]">Completion</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--accent-lime)]">{avgDuration}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Avg Time</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--accent-orange)]">{bottleneckCount}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Bottlenecks</p>
        </div>
      </div>
    </div>
  );
}
