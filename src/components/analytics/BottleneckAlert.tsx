'use client';

interface BottleneckAlertProps {
  bottlenecks: {
    stepId: string;
    name: string;
    score: number;
  }[];
}

export default function BottleneckAlert({ bottlenecks }: BottleneckAlertProps) {
  if (bottlenecks.length === 0) return null;

  const criticalBottlenecks = bottlenecks.filter(b => b.score >= 50);
  const highBottlenecks = bottlenecks.filter(b => b.score >= 30 && b.score < 50);

  const getSuggestion = (bottleneck: typeof bottlenecks[0]) => {
    if (bottleneck.score >= 50) {
      return [
        'Consider breaking this step into smaller sub-tasks',
        'Add automation to reduce manual overhead',
        'Review if this step has unnecessary dependencies',
        'Assign dedicated resources during peak times',
      ];
    }
    return [
      'Monitor this step for further degradation',
      'Consider adding parallel processing',
      'Review resource allocation',
    ];
  };

  if (criticalBottlenecks.length === 0 && highBottlenecks.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 font-display">
              No Critical Bottlenecks
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              All steps are performing within acceptable thresholds
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-red-500/20 flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-400 font-display">
            Bottleneck Alert
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {criticalBottlenecks.length} critical and {highBottlenecks.length} high-risk steps detected
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {criticalBottlenecks.map((bottleneck, index) => {
          const suggestions = getSuggestion(bottleneck);
          return (
            <div 
              key={bottleneck.stepId}
              className="p-3 rounded-lg bg-[var(--bg-primary)] border border-red-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-red-400">{bottleneck.stepId}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{bottleneck.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                  Score: {bottleneck.score}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5">Recommendations:</p>
                <ul className="space-y-1">
                  {suggestions.slice(0, 2).map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <svg className="w-3 h-3 mt-0.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        {highBottlenecks.length > 0 && (
          <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                High Risk
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {highBottlenecks.length} step{highBottlenecks.length !== 1 ? 's' : ''} approaching critical threshold
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {highBottlenecks.map((b) => (
                <span 
                  key={b.stepId}
                  className="px-2 py-1 rounded text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                >
                  {b.name} ({b.score})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
