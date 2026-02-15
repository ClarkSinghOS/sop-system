'use client';

import { Process, ProcessStep } from '@/types/process';

interface BreadcrumbsProps {
  process: Process;
  currentStep?: ProcessStep | null;
  onNavigateHome: () => void;
  onNavigateProcess: () => void;
  onNavigateStep?: (stepId: string) => void;
}

export default function Breadcrumbs({
  process,
  currentStep,
  onNavigateHome,
  onNavigateProcess,
  onNavigateStep,
}: BreadcrumbsProps) {
  // Find step index
  const stepIndex = currentStep
    ? process.steps.findIndex(s => s.stepId === currentStep.stepId)
    : -1;

  return (
    <nav className="flex items-center gap-1 text-sm">
      {/* Home */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="hidden sm:inline">Home</span>
      </button>

      <Separator />

      {/* Department */}
      <button
        onClick={onNavigateProcess}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span className="w-2 h-2 rounded-full" style={{ background: getDepartmentColor(process.department) }} />
        <span className="hidden sm:inline">{process.department}</span>
      </button>

      <Separator />

      {/* Process */}
      <button
        onClick={onNavigateProcess}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          !currentStep
            ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
            : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <span className="font-mono text-xs">{process.processId}</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline truncate max-w-[150px]">{process.name}</span>
      </button>

      {/* Current Step */}
      {currentStep && (
        <>
          <Separator />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
            <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold bg-[var(--accent-cyan)] text-black">
              {stepIndex + 1}
            </span>
            <span className="font-mono text-xs">{currentStep.stepId}</span>
            <span className="hidden lg:inline truncate max-w-[200px]">{currentStep.name}</span>
          </div>
        </>
      )}

      {/* Step Navigation */}
      {currentStep && onNavigateStep && (
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => {
              if (stepIndex > 0) {
                onNavigateStep(process.steps[stepIndex - 1].stepId);
              }
            }}
            disabled={stepIndex <= 0}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
            {stepIndex + 1} / {process.steps.length}
          </span>
          <button
            onClick={() => {
              if (stepIndex < process.steps.length - 1) {
                onNavigateStep(process.steps[stepIndex + 1].stepId);
              }
            }}
            disabled={stepIndex >= process.steps.length - 1}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next step"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
}

function Separator() {
  return (
    <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    Marketing: '#06b6d4',
    Sales: '#10b981',
    Operations: '#f59e0b',
    HR: '#a855f7',
    Executive: '#ef4444',
    Finance: '#3b82f6',
  };
  return colors[department] || '#71717a';
}
