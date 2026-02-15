'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatShortcutKeys } from '@/hooks/useKeyboardShortcuts';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['cmd', 'K'], description: 'Open search' },
      { keys: ['cmd', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['Escape'], description: 'Close modal / Deselect' },
    ],
  },
  {
    title: 'Step Navigation',
    shortcuts: [
      { keys: ['ArrowUp'], description: 'Previous step' },
      { keys: ['ArrowDown'], description: 'Next step' },
      { keys: ['Enter'], description: 'Select / Expand step' },
      { keys: ['ArrowLeft'], description: 'Collapse step' },
      { keys: ['ArrowRight'], description: 'Expand step' },
    ],
  },
  {
    title: 'Views',
    shortcuts: [
      { keys: ['1'], description: 'Flow view' },
      { keys: ['2'], description: 'Timeline view' },
      { keys: ['3'], description: 'Cards view' },
      { keys: ['4'], description: 'Checklist view' },
      { keys: ['5'], description: 'AI JSON view' },
      { keys: ['6'], description: 'Map view' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['cmd', 'S'], description: 'Star / Favorite process' },
      { keys: ['cmd', 'C'], description: 'Copy step ID' },
      { keys: ['?'], description: 'Show help' },
    ],
  },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl mx-4 animate-slide-up"
        style={{
          background: 'rgba(18, 18, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                Navigate faster with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]/50"
                    >
                      <span className="text-sm text-[var(--text-secondary)]">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx}>
                            {keyIdx > 0 && (
                              <span className="text-[var(--text-tertiary)] mx-0.5">+</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-mono rounded bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)]">
                              {formatShortcutKeys([key])}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/30">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-default)] font-mono">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
