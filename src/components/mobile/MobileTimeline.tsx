'use client';

import { useRef, useEffect } from 'react';
import { ProcessStep } from '@/types/process';

interface MobileTimelineProps {
  steps: ProcessStep[];
  selectedStepId: string | null;
  completedSteps: Set<string>;
  onSelectStep: (stepId: string) => void;
}

export default function MobileTimeline({
  steps,
  selectedStepId,
  completedSteps,
  onSelectStep,
}: MobileTimelineProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll to selected step
  useEffect(() => {
    if (selectedStepId && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedStepId]);

  return (
    <div className="relative px-4 py-2">
      {/* Timeline Line */}
      <div className="absolute left-[30px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[var(--accent-cyan)] via-[var(--border-default)] to-[var(--border-default)]" />

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isSelected = selectedStepId === step.stepId;
          const isCompleted = completedSteps.has(step.stepId);
          const isNextUp = !isCompleted && (index === 0 || completedSteps.has(steps[index - 1]?.stepId));

          return (
            <div
              key={step.stepId}
              ref={isSelected ? selectedRef : null}
              className="relative flex gap-4"
            >
              {/* Timeline Node */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-[18px] h-[18px] rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-[var(--accent-lime)] border-[var(--accent-lime)]'
                      : isNextUp
                      ? 'bg-[var(--accent-cyan)] border-[var(--accent-cyan)] animate-pulse-slow'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-strong)]'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-full h-full text-black p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <button
                onClick={() => onSelectStep(step.stepId)}
                className={`flex-1 text-left p-4 rounded-xl border transition-all min-h-[88px] active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[var(--bg-elevated)] border-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/10'
                    : isCompleted
                    ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/30'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono text-[var(--accent-cyan)]">
                    {step.stepId}
                  </span>
                  {step.timing?.estimatedDuration && (
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      • {step.timing.estimatedDuration}
                    </span>
                  )}
                  {isNextUp && !isCompleted && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-semibold">
                      UP NEXT
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`font-display font-semibold text-base leading-snug ${
                    isCompleted
                      ? 'text-[var(--text-tertiary)] line-through'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {step.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                  {step.shortDescription}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* Automation Badge */}
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background:
                        step.automationLevel === 'full'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : step.automationLevel === 'partial'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        step.automationLevel === 'full'
                          ? 'var(--auto-full)'
                          : step.automationLevel === 'partial'
                          ? 'var(--auto-partial)'
                          : 'var(--auto-none)',
                    }}
                  >
                    {step.automationLevel === 'full'
                      ? '⚡ Auto'
                      : step.automationLevel === 'partial'
                      ? '🔄 Partial'
                      : '👤 Manual'}
                  </span>

                  {/* Media Badge */}
                  {step.videos && step.videos.length > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">
                      📹 Video
                    </span>
                  )}

                  {/* Checklist Badge */}
                  {step.checklist && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
                      ✓ {step.checklist.items.length} tasks
                    </span>
                  )}

                  {/* Decision Badge */}
                  {step.decision && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]">
                      🔀 Decision
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* End marker */}
      <div className="relative flex gap-4 mt-3">
        <div className="relative z-10 flex-shrink-0">
          <div className="w-[18px] h-[18px] rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-strong)] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--border-strong)]" />
          </div>
        </div>
        <div className="flex-1 py-2 text-sm text-[var(--text-tertiary)]">
          Process Complete
        </div>
      </div>
    </div>
  );
}
