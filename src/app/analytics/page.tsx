'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MetricCard,
  ProcessHealthCard,
  SLAComplianceCard,
  ExecutionTimeChart,
  CompletionRateChart,
  BottleneckChart,
  TrendChart,
  AutomationChart,
  BottleneckAlert,
} from '@/components/analytics';
import {
  analyticsSummary,
  stepData,
  getCompletionRateData,
  getAutomationData,
  getExecutionTimeData,
  getTrendData,
  getBottleneckData,
} from '@/data/analytics-mock';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const completionRateData = getCompletionRateData();
  const automationData = getAutomationData();
  const executionTimeData = getExecutionTimeData();
  const trendData = getTrendData();
  const bottleneckData = getBottleneckData();

  // Calculate health score
  const healthScore = Math.round(
    (analyticsSummary.completedExecutions / analyticsSummary.totalExecutions) * 40 +
    (analyticsSummary.overallSlaCompliance / 100) * 40 +
    ((100 - analyticsSummary.topBottlenecks[0]?.score || 0) / 100) * 20
  );

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Header */}
      <header className="relative px-8 pt-8 pb-6">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/5 via-transparent to-[var(--accent-cyan)]/5 pointer-events-none" />
        
        <div className={`relative ${mounted ? 'animate-reveal-up' : 'opacity-0'}`}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--text-primary)]">Analytics</span>
          </div>
          
          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-[var(--text-secondary)]">
                Real-time insights into process performance and execution metrics
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${timeRange === range
                      ? 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 pb-8 space-y-8">
        
        {/* Key Metrics Row */}
        <section className={`${mounted ? 'animate-reveal-up stagger-1' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Executions */}
            <div className="card p-5 group hover:border-[var(--accent-cyan)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--accent-cyan-subtle)] flex items-center justify-center group-hover:shadow-[var(--glow-cyan)] transition-shadow">
                  <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[var(--status-success)] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +12%
                </span>
              </div>
              <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
                {analyticsSummary.totalExecutions}
              </div>
              <div className="text-sm text-[var(--text-tertiary)]">Total Executions</div>
            </div>
            
            {/* Completion Rate */}
            <div className="card p-5 group hover:border-[var(--accent-lime)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--accent-lime-subtle)] flex items-center justify-center group-hover:shadow-[var(--glow-lime)] transition-shadow">
                  <svg className="w-5 h-5 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
                {Math.round((analyticsSummary.completedExecutions / analyticsSummary.totalExecutions) * 100)}%
              </div>
              <div className="text-sm text-[var(--text-tertiary)]">Completion Rate</div>
            </div>
            
            {/* SLA Compliance */}
            <div className="card p-5 group hover:border-[var(--accent-purple)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[rgba(168,85,247,0.1)] flex items-center justify-center group-hover:shadow-[var(--glow-purple)] transition-shadow">
                  <svg className="w-5 h-5 text-[var(--accent-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
                {analyticsSummary.overallSlaCompliance}%
              </div>
              <div className="text-sm text-[var(--text-tertiary)]">SLA Compliance</div>
            </div>
            
            {/* Health Score */}
            <div className="card p-5 group hover:border-[var(--status-success)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[rgba(0,255,136,0.1)] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-shadow">
                  <svg className="w-5 h-5 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
                {healthScore}
              </div>
              <div className="text-sm text-[var(--text-tertiary)]">Health Score</div>
            </div>
          </div>
        </section>

        {/* Charts Row 1 */}
        <section className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${mounted ? 'animate-reveal-up stagger-2' : 'opacity-0'}`}>
          {/* Trend Chart - Larger */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-[var(--text-primary)]">Execution Trend</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">Process executions over time</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent-cyan)]" />
                  <span className="text-[var(--text-tertiary)]">Executions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent-lime)]" />
                  <span className="text-[var(--text-tertiary)]">Completed</span>
                </div>
              </div>
            </div>
            <div className="h-[280px]">
              <TrendChart data={trendData} />
            </div>
          </div>
          
          {/* Completion Rate Donut */}
          <div className="card p-6">
            <div className="mb-6">
              <h3 className="font-display font-semibold text-[var(--text-primary)]">Completion Rate</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">By status breakdown</p>
            </div>
            <div className="h-[280px]">
              <CompletionRateChart data={completionRateData} />
            </div>
          </div>
        </section>

        {/* Charts Row 2 */}
        <section className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${mounted ? 'animate-reveal-up stagger-3' : 'opacity-0'}`}>
          {/* Execution Time */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-[var(--text-primary)]">Execution Time</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">Estimated vs Actual per step</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ExecutionTimeChart data={executionTimeData} />
            </div>
          </div>
          
          {/* Bottlenecks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-[var(--text-primary)]">Bottleneck Analysis</h3>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">Steps with highest delay scores</p>
              </div>
            </div>
            <div className="h-[300px]">
              <BottleneckChart data={bottleneckData} />
            </div>
          </div>
        </section>

        {/* Automation & Bottleneck Alerts */}
        <section className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${mounted ? 'animate-reveal-up stagger-4' : 'opacity-0'}`}>
          {/* Automation Levels */}
          <div className="card p-6">
            <div className="mb-6">
              <h3 className="font-display font-semibold text-[var(--text-primary)]">Automation Levels</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Step automation distribution</p>
            </div>
            <div className="h-[220px]">
              <AutomationChart data={automationData} />
            </div>
          </div>
          
          {/* Bottleneck Alerts */}
          <div className="lg:col-span-2">
            <BottleneckAlert bottlenecks={analyticsSummary.topBottlenecks} />
          </div>
        </section>

        {/* Step Performance Table */}
        <section className={`card overflow-hidden ${mounted ? 'animate-reveal-up stagger-5' : 'opacity-0'}`}>
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h3 className="font-display font-semibold text-[var(--text-primary)]">Step Performance</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">Detailed metrics for each process step</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-tertiary)]/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Step</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Executions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Avg Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Est. Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">SLA</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Automation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {stepData.map((step, index) => (
                  <tr key={step.stepId} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan-subtle)] flex items-center justify-center text-xs font-bold text-[var(--accent-cyan)]">
                          {index + 1}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{step.stepName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-sm">
                      {step.completions}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-sm">
                      {step.avgActualMin}m
                    </td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] font-mono text-sm">
                      {step.estimatedMin}m
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden max-w-[80px]">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${step.slaCompliance}%`,
                              background: step.slaCompliance >= 80 
                                ? 'var(--status-success)' 
                                : step.slaCompliance >= 60 
                                  ? 'var(--status-warning)' 
                                  : 'var(--status-error)',
                            }}
                          />
                        </div>
                        <span className="text-sm font-mono text-[var(--text-secondary)]">
                          {step.slaCompliance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold
                        ${step.automationLevel === 'full' 
                          ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                          : step.automationLevel === 'partial'
                            ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                            : 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                        }
                      `}>
                        {step.automationLevel === 'full' ? 'Automated' : step.automationLevel === 'partial' ? 'Partial' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
