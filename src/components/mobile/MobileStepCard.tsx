'use client';

import { ProcessStep } from '@/types/process';

interface MobileStepCardProps {
  step: ProcessStep;
  index: number;
  isSelected: boolean;
  isCompleted: boolean;
  onSelect: (stepId: string) => void;
  onToggleComplete: (stepId: string) => void;
}

const autoConfig: Record<string, { label: string; color: string; bg: string }> = {
  full: { label: 'Auto', color: 'var(--auto-full)', bg: 'rgba(16, 185, 129, 0.15)' },
  partial: { label: 'Partial', color: 'var(--auto-partial)', bg: 'rgba(245, 158, 11, 0.15)' },
  none: { label: 'Manual', color: 'var(--auto-none)', bg: 'rgba(239, 68, 68, 0.15)' },
};

export default function MobileStepCard({
  step,
  index,
  isSelected,
  isCompleted,
  onSelect,
  onToggleComplete,
}: MobileStepCardProps) {
  const auto = autoConfig[step.automationLevel] || autoConfig.none;

  return (
    <div
      className={`relative rounded-xl border transition-all ${
        isSelected
          ? 'bg-[var(--bg-elevated)] border-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/20'
          : isCompleted
          ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/30'
          : 'bg-[var(--bg-secondary)] border-[var(--border-default)]'
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Completion Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(step.stepId);
          }}
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            isCompleted
              ? 'bg-[var(--accent-lime)] text-black'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-lg font-bold">{index + 1}</span>
          )}
        </button>

        {/* Content */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onSelect(step.stepId)}
        >
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: auto.bg, color: auto.color }}
            >
              {auto.label}
            </span>
            {step.videos && step.videos.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">
                📹 {step.videos.length}
              </span>
            )}
          </div>

          <h3
            className={`font-display font-semibold text-[15px] leading-snug ${
              isCompleted ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
            }`}
          >
            {step.name}
          </h3>

          <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {step.shortDescription}
          </p>

          {/* Quick Info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
            {step.timing?.estimatedDuration && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {step.timing.estimatedDuration}
              </span>
            )}
            {step.checklist && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {step.checklist.items.length} tasks
              </span>
            )}
          </div>
        </div>

        {/* Expand Arrow */}
        <button
          onClick={() => onSelect(step.stepId)}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="View details"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
