'use client';

import { InstanceStep, StepStatus, STATUS_CONFIG } from '@/types/execution';
import { ProcessStep } from '@/types/process';

interface StepProgressProps {
  steps: InstanceStep[];
  processSteps: ProcessStep[];
  currentStepId: string | null;
  onStepClick?: (stepId: string) => void;
}

const StatusIcon = ({ status }: { status: StepStatus }) => {
  switch (status) {
    case 'completed':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'in_progress':
      return (
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      );
    case 'blocked':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'failed':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return <span className="w-2 h-2 rounded-full bg-current opacity-50" />;
  }
};

export default function StepProgress({ steps, processSteps, currentStepId, onStepClick }: StepProgressProps) {
  // Create a map for quick lookup
  const stepStatusMap: Record<string, InstanceStep> = {};
  steps.forEach(step => {
    stepStatusMap[step.step_id] = step;
  });

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Progress</span>
          <span className="text-[var(--accent-cyan)] font-mono">
            {completedCount}/{steps.length} steps
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-1">
        {processSteps.map((processStep, index) => {
          const instanceStep = stepStatusMap[processStep.stepId];
          const status: StepStatus = instanceStep?.status || 'pending';
          const config = STATUS_CONFIG[status];
          const isCurrent = processStep.stepId === currentStepId;

          return (
            <div
              key={processStep.stepId}
              onClick={() => onStepClick?.(processStep.stepId)}
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${isCurrent ? 'bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30' : 'hover:bg-[var(--bg-tertiary)]'}
              `}
            >
              {/* Step Number / Status */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                }}
              >
                {status === 'pending' ? (
                  <span className="text-sm font-semibold">{index + 1}</span>
                ) : (
                  <StatusIcon status={status} />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">
                    {processStep.stepId}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${status === 'completed' ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                  {processStep.name}
                </p>
              </div>

              {/* Duration (if completed) */}
              {instanceStep?.duration_seconds && (
                <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                  {formatDuration(instanceStep.duration_seconds)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
