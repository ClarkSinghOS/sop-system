'use client';

import { useEffect, useRef } from 'react';
import { Process, ViewMode } from '@/types/process';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  process: Process;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  completedSteps: number;
  totalSteps: number;
}

const allViews: Array<{ id: ViewMode; label: string; description: string; icon: React.ReactNode }> = [
  {
    id: 'flow',
    label: 'Flow View',
    description: 'Interactive flowchart with connections',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Sequential step-by-step view',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'cards',
    label: 'Cards',
    description: 'Grid of step cards',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'checklist',
    label: 'Checklist',
    description: 'Track completion progress',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI Format',
    description: 'JSON schema for automation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function MobileMenu({
  isOpen,
  onClose,
  process,
  currentView,
  onViewChange,
  completedSteps,
  totalSteps,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const progress = (completedSteps / totalSteps) * 100;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] md:hidden"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-[var(--bg-secondary)] border-r border-[var(--border-default)] shadow-2xl animate-slide-in-left flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono text-[var(--accent-cyan)]">{process.processId}</span>
              <h2 className="text-lg font-display font-bold text-[var(--text-primary)] mt-0.5 line-clamp-1">
                {process.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-tertiary)]">Progress</span>
              <span className="text-sm font-semibold text-[var(--accent-cyan)]">
                {completedSteps}/{totalSteps}
              </span>
            </div>
            <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* View Selection */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
            View Mode
          </p>
          <div className="space-y-2">
            {allViews.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all min-h-[56px] ${
                  currentView === view.id
                    ? 'bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]'
                    : 'bg-[var(--bg-tertiary)] border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                }`}
              >
                <div className={`p-2 rounded-lg ${currentView === view.id ? 'bg-[var(--accent-cyan)]/20' : 'bg-[var(--bg-elevated)]'}`}>
                  {view.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{view.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{view.description}</p>
                </div>
                {currentView === view.id && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Process Info */}
        <div className="flex-shrink-0 p-4 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">{process.steps.length}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Steps</p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
              <p className="text-lg font-bold text-[var(--text-primary)]">{process.estimatedDuration}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Duration</p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{process.owner.name}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
