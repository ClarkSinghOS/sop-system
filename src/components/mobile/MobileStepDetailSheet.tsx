'use client';

import { useState } from 'react';
import { ProcessStep } from '@/types/process';
import SwipeableDrawer from './SwipeableDrawer';
import MobileChecklist from './MobileChecklist';

interface MobileStepDetailSheetProps {
  step: ProcessStep | null;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'overview' | 'media' | 'checklist' | 'automation';

const autoConfig: Record<string, { label: string; color: string; bg: string }> = {
  full: { label: 'Fully Automated', color: 'var(--auto-full)', bg: 'rgba(16, 185, 129, 0.1)' },
  partial: { label: 'Partially Automated', color: 'var(--auto-partial)', bg: 'rgba(245, 158, 11, 0.1)' },
  none: { label: 'Manual Process', color: 'var(--auto-none)', bg: 'rgba(239, 68, 68, 0.1)' },
};

export default function MobileStepDetailSheet({ step, isOpen, onClose }: MobileStepDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  if (!step) return null;

  const auto = autoConfig[step.automationLevel] || autoConfig.none;

  const toggleChecklistItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'media', label: 'Media', count: (step.videos?.length || 0) + (step.screenshots?.length || 0) },
    { id: 'checklist', label: 'Tasks', count: step.checklist?.items.length },
    { id: 'automation', label: 'Auto' },
  ];

  return (
    <SwipeableDrawer isOpen={isOpen} onClose={onClose} snapPoints={[50, 90]}>
      {/* Header */}
      <div className="px-4 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: auto.bg, color: auto.color }}
          >
            {auto.label}
          </span>
        </div>
        <h2 className="text-lg font-display font-bold text-[var(--text-primary)] line-clamp-2">
          {step.name}
        </h2>
        
        {/* Quick Info Row */}
        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
          {step.timing?.estimatedDuration && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {step.timing.estimatedDuration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {step.ownership.owner.name}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent-cyan)] text-black'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                activeTab === tab.id ? 'bg-black/20' : 'bg-[var(--bg-tertiary)]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* Short Description */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                Summary
              </h4>
              <p className="text-[var(--text-primary)] text-[15px] leading-relaxed">
                {step.shortDescription}
              </p>
            </div>

            {/* Long Description */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                Details
              </h4>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {step.longDescription}
                </p>
              </div>
            </div>

            {/* Why It Matters */}
            {step.whyItMatters && (
              <div className="p-4 rounded-xl border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5">
                <h4 className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why This Matters
                </h4>
                <p className="text-sm text-[var(--text-secondary)]">{step.whyItMatters}</p>
              </div>
            )}

            {/* Tools Used */}
            {step.toolsUsed && step.toolsUsed.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  {step.toolsUsed.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] min-h-[44px]"
                    >
                      <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {tool.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {step.commonMistakes && step.commonMistakes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  ⚠️ Common Mistakes
                </h4>
                <div className="space-y-2">
                  {step.commonMistakes.map((mistake) => (
                    <details key={mistake.id} className="group">
                      <summary className="flex items-center gap-2 p-3 rounded-xl bg-[var(--auto-none)]/10 border border-[var(--auto-none)]/30 cursor-pointer list-none min-h-[48px]">
                        <svg className="w-4 h-4 text-[var(--auto-none)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{mistake.title}</span>
                        <svg className="w-4 h-4 text-[var(--text-tertiary)] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-2 p-3 rounded-xl bg-[var(--bg-tertiary)] space-y-2">
                        <p className="text-sm text-[var(--text-secondary)]">{mistake.description}</p>
                        <div className="pt-2 border-t border-[var(--border-subtle)]">
                          <p className="text-xs font-semibold text-[var(--accent-lime)] uppercase">How to Fix:</p>
                          <p className="text-sm text-[var(--text-secondary)]">{mistake.howToFix}</p>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-4 animate-fade-in">
            {step.videos && step.videos.length > 0 ? (
              step.videos.map((video) => (
                <div key={video.id} className="rounded-xl overflow-hidden border border-[var(--border-default)]">
                  <div className="video-container bg-black">
                    <iframe
                      src={video.embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-3 bg-[var(--bg-tertiary)]">
                    <h4 className="font-medium text-[var(--text-primary)] text-sm">{video.title}</h4>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-[var(--text-tertiary)]">No media for this step</p>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div className="animate-fade-in">
            {step.checklist ? (
              <MobileChecklist
                title={step.checklist.title}
                items={step.checklist.items}
                completedItems={completedItems}
                onToggleItem={toggleChecklistItem}
                completionCriteria={step.checklist.completionCriteria}
              />
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-[var(--text-tertiary)]">No checklist for this step</p>
              </div>
            )}
          </div>
        )}

        {/* AUTOMATION TAB */}
        {activeTab === 'automation' && (
          <div className="space-y-4 animate-fade-in">
            {/* Current State */}
            <div className="p-4 rounded-xl border border-[var(--border-default)]" style={{ background: auto.bg }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${auto.color}30` }}>
                  {step.automationLevel === 'full' && (
                    <svg className="w-6 h-6" style={{ color: auto.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {step.automationLevel === 'partial' && (
                    <svg className="w-6 h-6" style={{ color: auto.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {step.automationLevel === 'none' && (
                    <svg className="w-6 h-6" style={{ color: auto.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase">Current State</p>
                  <p className="font-semibold text-[var(--text-primary)]">{auto.label}</p>
                </div>
              </div>
            </div>

            {/* Analysis */}
            {step.automationAnalysis && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Effort</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                      {step.automationAnalysis.effortToAutomate}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Target</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                      {step.automationAnalysis.targetState.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {step.automationAnalysis.estimatedSavingsPerMonth && (
                  <div className="p-4 rounded-xl bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/30">
                    <p className="text-xs font-semibold text-[var(--accent-lime)] uppercase mb-1">
                      💰 Estimated Savings
                    </p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {step.automationAnalysis.estimatedSavingsPerMonth}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">per month if automated</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </SwipeableDrawer>
  );
}
