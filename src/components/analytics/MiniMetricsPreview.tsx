'use client';

import Link from 'next/link';

interface MiniMetricsPreviewProps {
  completionRate: number;
  avgTime: string;
  bottleneckCount: number;
  slaCompliance: number;
}

export default function MiniMetricsPreview({
  completionRate,
  avgTime,
  bottleneckCount,
  slaCompliance,
}: MiniMetricsPreviewProps) {
  return (
    <Link href="/analytics" className="block">
      <div className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-4 hover:border-[var(--accent-cyan)]/50 transition-all group cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-cyan)]/20">
              <svg className="w-4 h-4 text-[var(--accent-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Quick Metrics</span>
          </div>
          <span className="text-xs text-[var(--accent-cyan)] group-hover:underline flex items-center gap-1">
            View Analytics
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <p className="text-lg font-bold text-emerald-400">{completionRate}%</p>
            <p className="text-xs text-[var(--text-tertiary)]">Success</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <p className="text-lg font-bold text-[var(--accent-cyan)]">{avgTime}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Avg Time</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <p className="text-lg font-bold text-[var(--accent-lime)]">{slaCompliance}%</p>
            <p className="text-xs text-[var(--text-tertiary)]">SLA</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]">
            <p className={`text-lg font-bold ${bottleneckCount > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {bottleneckCount}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Bottlenecks</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
