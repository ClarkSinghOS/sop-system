'use client';

import { useState } from 'react';
import { ChecklistItem } from '@/types/process';

interface MobileChecklistProps {
  title: string;
  items: ChecklistItem[];
  completedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
  completionCriteria?: string;
}

export default function MobileChecklist({
  title,
  items,
  completedItems,
  onToggleItem,
  completionCriteria,
}: MobileChecklistProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const progress = (completedItems.size / items.length) * 100;

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--bg-secondary)] z-10 pb-3 -mx-4 px-4 pt-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-[var(--text-primary)]">{title}</h3>
          <span className="text-sm font-medium text-[var(--accent-cyan)]">
            {completedItems.size}/{items.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item) => {
          const isCompleted = completedItems.has(item.id);
          const isExpanded = expandedItems.has(item.id);
          const hasHelp = !!item.helpText;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/30'
                  : 'bg-[var(--bg-tertiary)] border-transparent'
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Checkbox */}
                <button
                  onClick={() => onToggleItem(item.id)}
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                    isCompleted
                      ? 'bg-[var(--accent-lime)] text-black'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                  aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  aria-pressed={isCompleted}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-[var(--border-strong)]" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-2">
                  <p
                    className={`text-[15px] leading-snug ${
                      isCompleted
                        ? 'text-[var(--text-tertiary)] line-through'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {item.text}
                    {item.required && (
                      <span className="text-[var(--auto-none)] ml-1">*</span>
                    )}
                  </p>

                  {/* Help Text (expandable on mobile) */}
                  {hasHelp && isExpanded && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2 p-2 rounded-lg bg-[var(--bg-primary)] animate-fade-in">
                      {item.helpText}
                    </p>
                  )}

                  {/* Link */}
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[var(--accent-cyan)] mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open link
                    </a>
                  )}
                </div>

                {/* Help Toggle */}
                {hasHelp && (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={`flex-shrink-0 p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
                      isExpanded
                        ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                        : 'hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                    }`}
                    aria-label={isExpanded ? 'Hide help' : 'Show help'}
                    aria-expanded={isExpanded}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Criteria */}
      {completionCriteria && (
        <div className="p-4 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30">
          <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase mb-1">
            ✓ Completion Criteria
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{completionCriteria}</p>
        </div>
      )}

      {/* Completion Celebration */}
      {completedItems.size === items.length && items.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-lime)]/20 to-[var(--accent-cyan)]/20 border border-[var(--accent-lime)]/30 text-center animate-slide-up">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-display font-bold text-[var(--text-primary)]">All tasks complete!</p>
          <p className="text-sm text-[var(--text-secondary)]">Great job finishing this checklist</p>
        </div>
      )}
    </div>
  );
}
