'use client';

import { useState } from 'react';
import { ProcessStep } from '@/types/process';

interface StepDetailPanelProps {
  step: ProcessStep;
  processId: string;
  onClose: () => void;
}

const autoConfig: Record<string, { label: string; color: string }> = {
  full: { label: 'Automated', color: 'var(--status-success)' },
  partial: { label: 'Semi-Auto', color: 'var(--status-warning)' },
  none: { label: 'Manual', color: 'var(--status-error)' },
};

export default function StepDetailPanel({ step, processId, onClose }: StepDetailPanelProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const auto = autoConfig[step.automationLevel] || autoConfig.none;

  const toggleItem = (id: string) => {
    const next = new Set(completedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setCompletedItems(next);
  };

  const checklistProgress = step.checklist?.items.length 
    ? Math.round((completedItems.size / step.checklist.items.length) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: auto.color }}
                title={auto.label}
              />
            </div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)] leading-tight">
              {step.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {step.ownership?.owner?.name || 'Unassigned'}
          </span>
          {step.timing?.estimatedDuration && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {step.timing.estimatedDuration}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Description */}
        <section>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {step.longDescription || step.shortDescription}
          </p>
        </section>

        {/* Why It Matters */}
        {step.whyItMatters && (
          <section className="p-4 rounded-xl bg-[var(--accent-cyan-subtle)] border border-[var(--accent-cyan)]/20">
            <h3 className="text-sm font-semibold text-[var(--accent-cyan)] mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Why This Matters
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">{step.whyItMatters}</p>
          </section>
        )}

        {/* Checklist */}
        {step.checklist && step.checklist.items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Checklist
              </h3>
              <span className="text-xs text-[var(--text-tertiary)]">
                {completedItems.size}/{step.checklist.items.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-[var(--bg-tertiary)] rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full bg-[var(--accent-lime)] transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
            
            <div className="space-y-2">
              {step.checklist.items.map((item) => (
                <label
                  key={item.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg cursor-pointer
                    transition-colors
                    ${completedItems.has(item.id) 
                      ? 'bg-[var(--accent-lime)]/5 border border-[var(--accent-lime)]/20' 
                      : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)]'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={completedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border-strong)] text-[var(--accent-lime)] focus:ring-[var(--accent-lime)] focus:ring-offset-0 bg-transparent"
                  />
                  <span className={`
                    text-sm flex-1
                    ${completedItems.has(item.id) 
                      ? 'text-[var(--text-tertiary)] line-through' 
                      : 'text-[var(--text-primary)]'
                    }
                  `}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Tools Used */}
        {step.toolsUsed && step.toolsUsed.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {step.toolsUsed.map((tool) => (
                <span
                  key={tool.id}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-secondary)]"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Common Mistakes */}
        {step.commonMistakes && step.commonMistakes.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--status-error)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Common Mistakes
            </h3>
            <div className="space-y-2">
              {step.commonMistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  className="p-3 rounded-lg bg-[var(--status-error)]/5 border border-[var(--status-error)]/10"
                >
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{mistake.title}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{mistake.description}</p>
                  {mistake.howToFix && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">
                      Fix: {mistake.howToFix}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {step.videos && step.videos.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Video Guide
            </h3>
            {step.videos.map((video) => (
              <div key={video.id} className="rounded-xl overflow-hidden bg-[var(--bg-tertiary)]">
                {video.embedUrl ? (
                  <div className="aspect-video">
                    <iframe
                      src={video.embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : video.url ? (
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{video.title}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{video.duration}</p>
                    </div>
                  </a>
                ) : null}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
