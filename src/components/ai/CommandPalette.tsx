'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAI } from '@/contexts/AIContext';
import { Process, ProcessStep } from '@/types/process';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStep?: (stepId: string) => void;
  process?: Process | null;
}

interface SearchResult {
  type: 'step' | 'process' | 'action' | 'ai';
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectStep, process }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, openChat } = useAI();
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);
  
  // Check for AI mode trigger
  useEffect(() => {
    if (query.startsWith('/')) {
      setIsAIMode(true);
    } else if (isAIMode && !query.startsWith('/')) {
      setIsAIMode(false);
    }
  }, [query, isAIMode]);
  
  // Generate search results
  useEffect(() => {
    const searchResults: SearchResult[] = [];
    const searchQuery = isAIMode ? query.slice(1).toLowerCase() : query.toLowerCase();
    
    if (!searchQuery) {
      // Show default actions
      searchResults.push({
        type: 'action',
        id: 'ai-help',
        title: 'Ask AI Assistant',
        subtitle: 'Type / to switch to AI mode',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        action: () => {
          openChat();
          onClose();
        },
      });
      
      if (process) {
        searchResults.push({
          type: 'action',
          id: 'start-process',
          title: 'Start Process',
          subtitle: `Begin ${process.name}`,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        });
      }
    }
    
    // Search steps
    if (process && searchQuery) {
      const matchingSteps = process.steps.filter(step => 
        step.name.toLowerCase().includes(searchQuery) ||
        step.stepId.toLowerCase().includes(searchQuery) ||
        step.shortDescription.toLowerCase().includes(searchQuery)
      );
      
      matchingSteps.slice(0, 5).forEach(step => {
        searchResults.push({
          type: 'step',
          id: step.stepId,
          title: step.name,
          subtitle: step.stepId,
          icon: getStepIcon(step),
          action: () => {
            onSelectStep?.(step.stepId);
            onClose();
          },
        });
      });
    }
    
    // AI mode results
    if (isAIMode && searchQuery) {
      searchResults.unshift({
        type: 'ai',
        id: 'ai-query',
        title: `Ask: "${searchQuery}"`,
        subtitle: 'Send to AI Assistant',
        icon: (
          <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        action: async () => {
          openChat();
          await sendMessage(searchQuery);
          onClose();
        },
      });
    }
    
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, isAIMode, process, onSelectStep, onClose, openChat, sendMessage]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected?.action) {
          selected.action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [results, selectedIndex, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 animate-slide-up">
        <div className="mx-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border-subtle)]">
            {isAIMode ? (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            ) : (
              <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAIMode ? 'Ask AI anything...' : 'Search steps, or type / for AI...'}
              className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none text-base"
            />
            {isAIMode && (
              <span className="px-2 py-1 rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-xs font-medium">
                AI Mode
              </span>
            )}
          </div>
          
          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={result.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-[var(--bg-tertiary)]'
                      : 'hover:bg-[var(--bg-tertiary)]/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    result.type === 'ai' 
                      ? 'bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 text-[var(--accent-cyan)]'
                      : result.type === 'step'
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  }`}>
                    {result.icon || (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-[var(--text-tertiary)] truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <span className="text-xs text-[var(--text-tertiary)] font-mono">↵</span>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">/</kbd>
                AI mode
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function getStepIcon(step: ProcessStep) {
  const iconClass = "w-5 h-5";
  switch (step.type) {
    case 'task':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'decision':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'automated':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
  }
}

export default CommandPalette;
