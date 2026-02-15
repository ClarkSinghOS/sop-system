'use client';

import React, { useState } from 'react';
import { ProcessStep } from '@/types/process';

interface AutomationSuggestionProps {
  step: ProcessStep;
  onDismiss?: () => void;
  onLearnMore?: () => void;
}

export function AutomationSuggestion({ step, onDismiss, onLearnMore }: AutomationSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show for manual or partial automation steps
  if (step.automationLevel === 'full' || !isVisible) {
    return null;
  }
  
  const analysis = step.automationAnalysis;
  
  const getAutomationDetails = () => {
    if (analysis) {
      return {
        currentState: analysis.currentState,
        targetState: analysis.targetState,
        effort: analysis.effortToAutomate,
        savings: analysis.estimatedSavingsPerMonth,
        tools: analysis.toolsRequired || [],
        blockers: analysis.blockers || [],
      };
    }
    
    // Generate suggestions based on step type
    const suggestions = {
      task: {
        suggestion: 'This task could be automated with a workflow tool',
        tools: ['Zapier', 'Make.com', 'n8n'],
        effort: 'low' as const,
        savings: '2-4 hours/week',
      },
      human_task: {
        suggestion: 'Consider adding automation triggers and notifications',
        tools: ['Slack Workflow', 'Email Automation'],
        effort: 'medium' as const,
        savings: '1-2 hours/week',
      },
      decision: {
        suggestion: 'This decision could be partially automated with rules',
        tools: ['Business Rules Engine', 'AI Classification'],
        effort: 'high' as const,
        savings: '3-5 hours/week',
      },
    };
    
    return suggestions[step.type as keyof typeof suggestions] || null;
  };
  
  const details = getAutomationDetails();
  if (!details) return null;
  
  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };
  
  const effortColors = {
    trivial: 'bg-[var(--accent-lime)]/20 text-[var(--accent-lime)]',
    low: 'bg-[var(--accent-lime)]/20 text-[var(--accent-lime)]',
    medium: 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]',
    high: 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]',
    extreme: 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]',
  };
  
  const effortLabel = 'effort' in details ? details.effort : analysis?.effortToAutomate || 'medium';
  
  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)]/5 to-[var(--accent-purple)]/5 border border-[var(--accent-cyan)]/20 animate-fade-in">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Header */}
      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-[var(--accent-cyan)]">
              Automation Opportunity
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${effortColors[effortLabel]}`}>
              {effortLabel} effort
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            This step could be automated
          </p>
        </div>
      </div>
      
      {/* Expandable details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-3 flex items-center justify-between text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-3 animate-fade-in">
          {/* Potential Savings */}
          {'savings' in details && details.savings && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-[var(--text-secondary)]">
                Potential savings: <strong className="text-[var(--accent-lime)]">{details.savings}</strong>
              </span>
            </div>
          )}
          
          {/* Suggested Tools */}
          {'tools' in details && details.tools && details.tools.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">Suggested tools:</p>
              <div className="flex flex-wrap gap-2">
                {details.tools.map((tool, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Blockers */}
          {'blockers' in details && details.blockers && details.blockers.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">Potential blockers:</p>
              <ul className="space-y-1">
                {details.blockers.map((blocker, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <svg className="w-3 h-3 text-[var(--accent-orange)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {blocker}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action */}
          <button
            onClick={onLearnMore}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30 transition-colors text-sm font-medium"
          >
            Learn how to automate this
          </button>
        </div>
      )}
    </div>
  );
}

export default AutomationSuggestion;
