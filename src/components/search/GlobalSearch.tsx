'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Process } from '@/types/process';
import {
  SearchableItem,
  SearchResult,
  buildSearchIndex,
  fuzzySearch,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from './SearchIndex';
import SearchResults from './SearchResults';

interface GlobalSearchProps {
  processes: Process[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProcess: (processId: string) => void;
  onSelectStep: (processId: string, stepId: string) => void;
}

export default function GlobalSearch({
  processes,
  isOpen,
  onClose,
  onSelectProcess,
  onSelectStep,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build search index
  const searchIndex = useMemo(() => buildSearchIndex(processes), [processes]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuzzySearch(query, searchIndex, 15);
  }, [query, searchIndex]);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalResults = results.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [results, selectedIndex, onClose]);

  // Handle result selection
  const handleSelect = useCallback((result: SearchResult) => {
    if (query.trim()) {
      saveRecentSearch(query);
    }

    if (result.type === 'process' && result.processId) {
      onSelectProcess(result.processId);
    } else if (result.type === 'step' && result.processId && result.stepId) {
      onSelectStep(result.processId, result.stepId);
    } else if (result.type === 'tool' && result.processId && result.stepId) {
      onSelectStep(result.processId, result.stepId);
    } else if (result.processId) {
      onSelectProcess(result.processId);
    }

    onClose();
  }, [query, onSelectProcess, onSelectStep, onClose]);

  // Handle recent search click
  const handleRecentClick = (search: string) => {
    setQuery(search);
    setSelectedIndex(0);
  };

  // Handle clear recent
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border-subtle)]">
          <svg
            className="w-5 h-5 text-[var(--accent-cyan)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search processes, steps, tools..."
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-lg"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded border border-[var(--border-default)] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results or Recent Searches */}
        {query.trim() ? (
          <SearchResults
            results={results}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            query={query}
          />
        ) : (
          <div className="py-4">
            {/* Quick Actions */}
            <div className="px-4 pb-3 border-b border-[var(--border-subtle)]">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuery('marketing')}
                  className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/20 transition-colors"
                >
                  Marketing
                </button>
                <button
                  onClick={() => setQuery('automated')}
                  className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] hover:bg-[var(--accent-lime)]/20 transition-colors"
                >
                  Automated
                </button>
                <button
                  onClick={() => setQuery('decision')}
                  className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/20 transition-colors"
                >
                  Decisions
                </button>
                <button
                  onClick={() => setQuery('checklist')}
                  className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/20 transition-colors"
                >
                  Checklists
                </button>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Recent Searches
                  </p>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentClick(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--text-tertiary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-[var(--text-secondary)]">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Help */}
            <div className="px-4 pt-4 mt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-default)] font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-default)] font-mono">↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-default)] font-mono">↵</kbd>
                    <span className="ml-1">Select</span>
                  </span>
                </div>
                <span>Type to search</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
