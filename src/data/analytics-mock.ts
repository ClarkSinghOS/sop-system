// Analytics Mock Data for ProcessCore SOP System
// Realistic execution data for the marketing flow

export interface ExecutionRecord {
  id: string;
  stepId: string;
  stepName: string;
  startedAt: string;
  completedAt: string | null;
  estimatedDurationMin: number;
  actualDurationMin: number | null;
  status: 'completed' | 'in-progress' | 'failed' | 'skipped';
  assignee: string;
  automationLevel: 'full' | 'partial' | 'manual';
  executionId: string;
  notes?: string;
}

export interface ProcessExecution {
  id: string;
  processId: string;
  processName: string;
  startedAt: string;
  completedAt: string | null;
  status: 'completed' | 'in-progress' | 'failed';
  totalSteps: number;
  completedSteps: number;
  assignee: string;
}

export interface DailyMetric {
  date: string;
  executions: number;
  completions: number;
  failures: number;
  avgDurationMin: number;
}

export interface StepPerformance {
  stepId: string;
  stepName: string;
  estimatedMin: number;
  avgActualMin: number;
  completions: number;
  failures: number;
  automationLevel: 'full' | 'partial' | 'manual';
  bottleneckScore: number; // 0-100, higher = worse bottleneck
  slaCompliance: number; // percentage
}

// Generate dates for the last N days
const generatePastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const generateDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Assignees
const assignees = [
  'Sarah Chen',
  'Mike Rodriguez',
  'Emily Taylor',
  'James Wilson',
  'Lisa Park',
  'Alex Kumar',
];

// Step data based on marketing flow
export const stepData: StepPerformance[] = [
  {
    stepId: 'STEP-001',
    stepName: 'Define Campaign Objectives',
    estimatedMin: 30,
    avgActualMin: 28,
    completions: 47,
    failures: 2,
    automationLevel: 'manual',
    bottleneckScore: 12,
    slaCompliance: 96,
  },
  {
    stepId: 'STEP-002',
    stepName: 'Research Target Audience',
    estimatedMin: 60,
    avgActualMin: 72,
    completions: 45,
    failures: 3,
    automationLevel: 'partial',
    bottleneckScore: 38,
    slaCompliance: 78,
  },
  {
    stepId: 'STEP-003',
    stepName: 'Create Content Calendar',
    estimatedMin: 45,
    avgActualMin: 52,
    completions: 44,
    failures: 4,
    automationLevel: 'manual',
    bottleneckScore: 28,
    slaCompliance: 82,
  },
  {
    stepId: 'STEP-004',
    stepName: 'Design Visual Assets',
    estimatedMin: 120,
    avgActualMin: 145,
    completions: 42,
    failures: 5,
    automationLevel: 'partial',
    bottleneckScore: 45,
    slaCompliance: 71,
  },
  {
    stepId: 'STEP-005',
    stepName: 'Write Copy & Messaging',
    estimatedMin: 90,
    avgActualMin: 85,
    completions: 43,
    failures: 3,
    automationLevel: 'partial',
    bottleneckScore: 15,
    slaCompliance: 91,
  },
  {
    stepId: 'STEP-006',
    stepName: 'Set Up Campaign in Platform',
    estimatedMin: 30,
    avgActualMin: 25,
    completions: 46,
    failures: 1,
    automationLevel: 'full',
    bottleneckScore: 8,
    slaCompliance: 98,
  },
  {
    stepId: 'STEP-007',
    stepName: 'Configure Targeting Parameters',
    estimatedMin: 20,
    avgActualMin: 18,
    completions: 47,
    failures: 1,
    automationLevel: 'full',
    bottleneckScore: 5,
    slaCompliance: 99,
  },
  {
    stepId: 'STEP-008',
    stepName: 'Review & Quality Check',
    estimatedMin: 45,
    avgActualMin: 65,
    completions: 41,
    failures: 6,
    automationLevel: 'manual',
    bottleneckScore: 62,
    slaCompliance: 68,
  },
  {
    stepId: 'STEP-009',
    stepName: 'Schedule & Launch',
    estimatedMin: 15,
    avgActualMin: 12,
    completions: 48,
    failures: 0,
    automationLevel: 'full',
    bottleneckScore: 3,
    slaCompliance: 100,
  },
  {
    stepId: 'STEP-010',
    stepName: 'Monitor Performance',
    estimatedMin: 30,
    avgActualMin: 35,
    completions: 45,
    failures: 2,
    automationLevel: 'partial',
    bottleneckScore: 22,
    slaCompliance: 85,
  },
];

// Generate execution records
export const executionRecords: ExecutionRecord[] = (() => {
  const records: ExecutionRecord[] = [];
  let recordId = 1;

  // Generate 50 process executions over the last 30 days
  for (let exec = 0; exec < 50; exec++) {
    const executionId = `EXEC-${String(exec + 1).padStart(4, '0')}`;
    const daysAgo = Math.floor(Math.random() * 30);
    const assignee = assignees[Math.floor(Math.random() * assignees.length)];
    
    stepData.forEach((step, stepIndex) => {
      const startOffset = stepIndex * 2; // hours offset
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      startDate.setHours(9 + startOffset, Math.floor(Math.random() * 60), 0);
      
      // Randomize status with realistic distribution
      const rand = Math.random();
      let status: ExecutionRecord['status'];
      let actualDuration: number | null;
      let completedAt: string | null;
      
      if (rand < 0.85) {
        status = 'completed';
        // Add some variance to actual duration
        const variance = (Math.random() - 0.3) * step.estimatedMin * 0.5;
        actualDuration = Math.max(5, Math.round(step.estimatedMin + variance));
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + actualDuration);
        completedAt = endDate.toISOString();
      } else if (rand < 0.92) {
        status = 'in-progress';
        actualDuration = null;
        completedAt = null;
      } else if (rand < 0.98) {
        status = 'failed';
        actualDuration = Math.round(step.estimatedMin * 0.4);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + actualDuration);
        completedAt = endDate.toISOString();
      } else {
        status = 'skipped';
        actualDuration = 0;
        completedAt = startDate.toISOString();
      }
      
      records.push({
        id: `REC-${String(recordId++).padStart(5, '0')}`,
        stepId: step.stepId,
        stepName: step.stepName,
        startedAt: startDate.toISOString(),
        completedAt,
        estimatedDurationMin: step.estimatedMin,
        actualDurationMin: actualDuration,
        status,
        assignee,
        automationLevel: step.automationLevel,
        executionId,
      });
    });
  }
  
  return records;
})();

// Process executions summary
export const processExecutions: ProcessExecution[] = (() => {
  const executions: ProcessExecution[] = [];
  const executionIds = Array.from(new Set(executionRecords.map(r => r.executionId)));
  
  executionIds.forEach(executionId => {
    const records = executionRecords.filter(r => r.executionId === executionId);
    const completedSteps = records.filter(r => r.status === 'completed').length;
    const failedSteps = records.filter(r => r.status === 'failed').length;
    const inProgressSteps = records.filter(r => r.status === 'in-progress').length;
    
    let status: ProcessExecution['status'];
    if (failedSteps > 0) {
      status = 'failed';
    } else if (inProgressSteps > 0 || completedSteps < records.length) {
      status = 'in-progress';
    } else {
      status = 'completed';
    }
    
    const firstRecord = records[0];
    const lastCompleted = records
      .filter(r => r.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
    
    executions.push({
      id: executionId,
      processId: 'MKT-FLOW-001',
      processName: 'Marketing Campaign Workflow',
      startedAt: firstRecord.startedAt,
      completedAt: status === 'completed' ? lastCompleted?.completedAt || null : null,
      status,
      totalSteps: records.length,
      completedSteps,
      assignee: firstRecord.assignee,
    });
  });
  
  return executions;
})();

// Daily metrics for trend chart
export const dailyMetrics: DailyMetric[] = (() => {
  const metrics: DailyMetric[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = generateDateString(i);
    const dayRecords = executionRecords.filter(r => 
      r.startedAt.startsWith(date) && r.status === 'completed'
    );
    
    const dayExecutions = Array.from(new Set(dayRecords.map(r => r.executionId)));
    const completions = processExecutions.filter(e => 
      e.completedAt?.startsWith(date)
    ).length;
    const failures = processExecutions.filter(e => 
      e.status === 'failed' && e.startedAt.startsWith(date)
    ).length;
    
    const durations = dayRecords
      .filter(r => r.actualDurationMin)
      .map(r => r.actualDurationMin!);
    const avgDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;
    
    metrics.push({
      date,
      executions: Math.max(1, dayExecutions.length + Math.floor(Math.random() * 3)),
      completions: Math.max(0, completions + Math.floor(Math.random() * 2)),
      failures: Math.max(0, failures),
      avgDurationMin: Math.round(avgDuration || 35 + Math.random() * 20),
    });
  }
  
  return metrics;
})();

// Summary statistics
export const analyticsSummary = {
  totalProcesses: 1,
  totalSteps: stepData.length,
  totalExecutions: processExecutions.length,
  completedExecutions: processExecutions.filter(e => e.status === 'completed').length,
  inProgressExecutions: processExecutions.filter(e => e.status === 'in-progress').length,
  failedExecutions: processExecutions.filter(e => e.status === 'failed').length,
  avgCompletionTimeMin: Math.round(
    stepData.reduce((sum, s) => sum + s.avgActualMin, 0)
  ),
  overallSlaCompliance: Math.round(
    stepData.reduce((sum, s) => sum + s.slaCompliance, 0) / stepData.length
  ),
  automationBreakdown: {
    full: stepData.filter(s => s.automationLevel === 'full').length,
    partial: stepData.filter(s => s.automationLevel === 'partial').length,
    manual: stepData.filter(s => s.automationLevel === 'manual').length,
  },
  topBottlenecks: stepData
    .sort((a, b) => b.bottleneckScore - a.bottleneckScore)
    .slice(0, 3)
    .map(s => ({ stepId: s.stepId, name: s.stepName, score: s.bottleneckScore })),
};

// Helper to get completion rate data for pie chart
export const getCompletionRateData = () => [
  { name: 'Completed', value: analyticsSummary.completedExecutions, color: '#10b981' },
  { name: 'In Progress', value: analyticsSummary.inProgressExecutions, color: '#f59e0b' },
  { name: 'Failed', value: analyticsSummary.failedExecutions, color: '#ef4444' },
];

// Helper to get automation breakdown for pie chart
export const getAutomationData = () => [
  { name: 'Fully Automated', value: analyticsSummary.automationBreakdown.full, color: '#10b981' },
  { name: 'Partially Automated', value: analyticsSummary.automationBreakdown.partial, color: '#f59e0b' },
  { name: 'Manual', value: analyticsSummary.automationBreakdown.manual, color: '#ef4444' },
];

// Helper to get execution time comparison data
export const getExecutionTimeData = () =>
  stepData.map(step => ({
    name: step.stepName.length > 15 ? step.stepName.substring(0, 15) + '...' : step.stepName,
    fullName: step.stepName,
    stepId: step.stepId,
    estimated: step.estimatedMin,
    actual: step.avgActualMin,
    variance: Math.round(((step.avgActualMin - step.estimatedMin) / step.estimatedMin) * 100),
  }));

// Helper to get trend data for line chart
export const getTrendData = () =>
  dailyMetrics.map(m => ({
    date: m.date.substring(5), // MM-DD format
    fullDate: m.date,
    executions: m.executions,
    completions: m.completions,
    failures: m.failures,
    avgDuration: m.avgDurationMin,
  }));

// Helper to get bottleneck data
export const getBottleneckData = () =>
  stepData
    .map(step => ({
      name: step.stepName.length > 20 ? step.stepName.substring(0, 20) + '...' : step.stepName,
      fullName: step.stepName,
      stepId: step.stepId,
      score: step.bottleneckScore,
      avgOverrun: Math.round(step.avgActualMin - step.estimatedMin),
      automationLevel: step.automationLevel,
    }))
    .sort((a, b) => b.score - a.score);
