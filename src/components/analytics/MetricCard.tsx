'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  accentColor?: 'cyan' | 'lime' | 'purple' | 'orange';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'cyan',
}: MetricCardProps) {
  const accentStyles = {
    cyan: {
      gradient: 'from-cyan-500/20 to-cyan-600/5',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
    lime: {
      gradient: 'from-lime-500/20 to-lime-600/5',
      border: 'border-lime-500/30',
      text: 'text-lime-400',
      glow: 'shadow-lime-500/10',
    },
    purple: {
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/10',
    },
    orange: {
      gradient: 'from-orange-500/20 to-orange-600/5',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/10',
    },
  };

  const styles = accentStyles[accentColor];

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border ${styles.border}
        bg-gradient-to-br ${styles.gradient}
        p-5 transition-all duration-300 hover:scale-[1.02]
        hover:shadow-lg ${styles.glow}
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-current" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              {title}
            </p>
            <p className={`mt-2 text-3xl font-bold font-display ${styles.text}`}>
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`p-2 rounded-lg bg-[var(--bg-tertiary)] ${styles.text}`}>
              {icon}
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
