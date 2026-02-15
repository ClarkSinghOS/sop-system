'use client';

import React, { useState } from 'react';
import { ProcessStep } from '@/types/process';

type SuggestionType = 'checklist' | 'video' | 'timing' | 'documentation' | 'warning';

interface Suggestion {
  type: SuggestionType;
  title: string;
  description: string;
  actionLabel: string;
  icon: React.ReactNode;
  color: string;
}

interface ImprovementSuggestionProps {
  step: ProcessStep;
  onDismiss?: () => void;
  onAction?: (type: SuggestionType) => void;
}

export function ImprovementSuggestion({ step, onDismiss, onAction }: ImprovementSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<SuggestionType>>(new Set());
  
  if (!isVisible) return null;
  
  // Analyze step and generate suggestions
  const suggestions: Suggestion[] = [];
  
  // Missing checklist
  if (!step.checklist && step.type === 'task') {
    suggestions.push({
      type: 'checklist',
      title: 'Add a checklist',
      description: 'Steps with checklists have 40% fewer errors',
      actionLabel: 'Create checklist',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'var(--accent-lime)',
    });
  }
  
  // Missing video for complex steps
  if (!step.videos?.length && step.longDescription && step.longDescription.length > 300) {
    suggestions.push({
      type: 'video',
      title: 'Add a training video',
      description: 'Complex steps benefit from video walkthroughs',
      actionLabel: 'Record video',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'var(--accent-purple)',
    });
  }
  
  // Missing timing information
  if (!step.timing?.estimatedMinutes && !step.timing?.estimatedDuration) {
    suggestions.push({
      type: 'timing',
      title: 'Add time estimate',
      description: 'Help users plan their work better',
      actionLabel: 'Set timing',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--accent-cyan)',
    });
  }
  
  // Missing "why it matters"
  if (!step.whyItMatters) {
    suggestions.push({
      type: 'documentation',
      title: 'Explain why this matters',
      description: 'Context helps people understand the importance',
      actionLabel: 'Add context',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'var(--accent-orange)',
    });
  }
  
  // Has common mistakes without prevention tips
  if (step.commonMistakes?.some(m => !m.preventionTips?.length)) {
    suggestions.push({
      type: 'warning',
      title: 'Add prevention tips',
      description: 'Help users avoid common mistakes',
      actionLabel: 'Add tips',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'var(--accent-red)',
    });
  }
  
  // Filter out dismissed suggestions
  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.type));
  
  if (activeSuggestions.length === 0) {
    return null;
  }
  
  const handleDismissSuggestion = (type: SuggestionType) => {
    setDismissedSuggestions(prev => new Set([...prev, type]));
  };
  
  const handleDismissAll = () => {
    setIsVisible(false);
    onDismiss?.();
  };
  
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--accent-lime)]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-[var(--text-primary)]">
            Suggestions
          </h4>
          <span className="text-xs text-[var(--text-tertiary)]">
            ({activeSuggestions.length})
          </span>
        </div>
        <button
          onClick={handleDismissAll}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
        >
          Dismiss all
        </button>
      </div>
      
      {/* Suggestion Cards */}
      <div className="space-y-2">
        {activeSuggestions.map((suggestion) => (
          <div 
            key={suggestion.type}
            className="relative p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors group"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${suggestion.color}20`, color: suggestion.color }}
              >
                {suggestion.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-[var(--text-primary)]">
                  {suggestion.title}
                </h5>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {suggestion.description}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAction?.(suggestion.type)}
                  className="px-2 py-1 text-xs rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                  style={{ color: suggestion.color }}
                >
                  {suggestion.actionLabel}
                </button>
                <button
                  onClick={() => handleDismissSuggestion(suggestion.type)}
                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImprovementSuggestion;
