'use client';

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
  const completionRateData = getCompletionRateData();
  const automationData = getAutomationData();
  const executionTimeData = getExecutionTimeData();
  const trendData = getTrendData();
  const bottleneckData = getBottleneckData();

  // Calculate health score based on completion rate, SLA compliance, and bottlenecks
  const healthScore = Math.round(
    (analyticsSummary.completedExecutions / analyticsSummary.totalExecutions) * 40 +
    (analyticsSummary.overallSlaCompliance / 100) * 40 +
    ((100 - analyticsSummary.topBottlenecks[0]?.score || 0) / 100) * 20
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/95 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to Process</span>
              </Link>
              <div className="h-6 w-px bg-[var(--border-default)]" />
              <div>
                <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Marketing Campaign Workflow Performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-[var(--text-secondary)]">Live Data</span>
              </div>
              <select className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-cyan)]">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
                <option>All Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Overview Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Processes"
            value={analyticsSummary.totalProcesses}
            subtitle="Active workflows"
            accentColor="cyan"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <MetricCard
            title="Total Steps"
            value={analyticsSummary.totalSteps}
            subtitle="Across all processes"
            accentColor="lime"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <MetricCard
            title="Avg Completion Time"
            value={`${Math.floor(analyticsSummary.avgCompletionTimeMin / 60)}h ${analyticsSummary.avgCompletionTimeMin % 60}m`}
            subtitle="Per full execution"
            trend={{ value: 8, isPositive: true }}
            accentColor="purple"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            title="Total Executions"
            value={analyticsSummary.totalExecutions}
            subtitle="Last 30 days"
            trend={{ value: 15, isPositive: true }}
            accentColor="orange"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </section>

        {/* Bottleneck Alert */}
        <section>
          <BottleneckAlert bottlenecks={analyticsSummary.topBottlenecks} />
        </section>

        {/* Health & SLA Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ProcessHealthCard
            processName="Marketing Campaign Workflow"
            healthScore={healthScore}
            completionRate={Math.round((analyticsSummary.completedExecutions / analyticsSummary.totalExecutions) * 100)}
            avgDuration={`${Math.floor(analyticsSummary.avgCompletionTimeMin / 60)}h ${analyticsSummary.avgCompletionTimeMin % 60}m`}
            bottleneckCount={analyticsSummary.topBottlenecks.filter(b => b.score >= 30).length}
          />
          <SLAComplianceCard
            overallCompliance={analyticsSummary.overallSlaCompliance}
            stepCompliance={stepData.map(s => ({
              stepName: s.stepName,
              compliance: s.slaCompliance,
            }))}
          />
          <AutomationChart data={automationData} />
        </section>

        {/* Charts Row 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExecutionTimeChart data={executionTimeData} />
          <CompletionRateChart data={completionRateData} />
        </section>

        {/* Charts Row 2 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart data={trendData} />
          <BottleneckChart data={bottleneckData} />
        </section>

        {/* Recent Executions Table */}
        <section className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-display">
                Step Performance Summary
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Detailed metrics for each process step
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-xs font-medium hover:bg-[var(--accent-cyan)]/30 transition-colors">
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Step</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Est. Time</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Avg. Actual</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Variance</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Completions</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Failures</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">SLA</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Automation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {stepData.map((step) => {
                  const variance = Math.round(((step.avgActualMin - step.estimatedMin) / step.estimatedMin) * 100);
                  return (
                    <tr key={step.stepId} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
                          <p className="text-[var(--text-primary)]">{step.stepName}</p>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-[var(--text-secondary)]">{step.estimatedMin}m</td>
                      <td className="text-center py-3 px-4 text-[var(--text-secondary)]">{step.avgActualMin}m</td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          variance > 0 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {variance > 0 ? '+' : ''}{variance}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-emerald-400">{step.completions}</td>
                      <td className="text-center py-3 px-4 text-red-400">{step.failures}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`text-xs font-medium ${
                          step.slaCompliance >= 90 ? 'text-emerald-400' :
                          step.slaCompliance >= 75 ? 'text-lime-400' :
                          step.slaCompliance >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {step.slaCompliance}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          step.automationLevel === 'full' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : step.automationLevel === 'partial'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {step.automationLevel === 'full' ? 'Full' : step.automationLevel === 'partial' ? 'Partial' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
