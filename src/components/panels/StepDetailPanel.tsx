'use client';

import { useState } from 'react';
import { ProcessStep } from '@/types/process';
import { AutomationSuggestion, ImprovementSuggestion } from '@/components/ai';

interface StepDetailPanelProps {
  step: ProcessStep | null;
  onClose: () => void;
}

type Tab = 'overview' | 'media' | 'checklist' | 'automation' | 'examples';

const autoConfig: Record<string, { label: string; color: string; bg: string }> = {
  full: { label: 'Fully Automated', color: 'var(--auto-full)', bg: 'rgba(16, 185, 129, 0.1)' },
  partial: { label: 'Partially Automated', color: 'var(--auto-partial)', bg: 'rgba(245, 158, 11, 0.1)' },
  none: { label: 'Manual Process', color: 'var(--auto-none)', bg: 'rgba(239, 68, 68, 0.1)' },
};

export default function StepDetailPanel({ step, onClose }: StepDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  if (!step) return null;

  const auto = autoConfig[step.automationLevel] || autoConfig.none;
  
  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'media', label: 'Media', count: (step.videos?.length || 0) + (step.screenshots?.length || 0) },
    { id: 'checklist', label: 'Checklist', count: step.checklist?.items.length },
    { id: 'automation', label: 'Automation' },
    { id: 'examples', label: 'Examples', count: step.examples?.length },
  ];

  const toggleChecklistItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[var(--bg-secondary)] border-l border-[var(--border-default)] shadow-2xl z-50 animate-slide-in overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: auto.bg, color: auto.color }}
              >
                {auto.label}
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">{step.name}</h2>
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
        
        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{step.ownership.owner.name}</span>
          </div>
          {step.timing?.estimatedDuration && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{step.timing.estimatedDuration}</span>
            </div>
          )}
          {step.toolsUsed && step.toolsUsed.length > 0 && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{step.toolsUsed.length} tools</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] flex-shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
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
      <div className="flex-1 overflow-y-auto p-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Short Description */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Summary</h3>
              <p className="text-[var(--text-primary)]">{step.shortDescription}</p>
            </div>

            {/* Long Description */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Details</h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-[var(--text-secondary)] text-sm leading-relaxed bg-[var(--bg-tertiary)] rounded-lg p-4">
                  {step.longDescription}
                </pre>
              </div>
            </div>

            {/* Why It Matters */}
            {step.whyItMatters && (
              <div className="p-4 rounded-lg border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5">
                <h3 className="text-sm font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Why This Matters
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">{step.whyItMatters}</p>
              </div>
            )}

            {/* Decision Branches */}
            {step.decision && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Decision Branches</h3>
                <div className="p-4 rounded-lg bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/30 mb-3">
                  <p className="text-[var(--text-primary)] font-medium">{step.decision.question}</p>
                </div>
                <div className="space-y-2">
                  {step.decision.branches.map((branch) => (
                    <div key={branch.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-purple)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-[var(--accent-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)]">{branch.conditionReadable}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">→ {branch.targetStepId}</p>
                        {branch.probability && (
                          <span className="text-xs text-[var(--accent-cyan)]">{branch.probability}% of cases</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Used */}
            {step.toolsUsed && step.toolsUsed.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Tools & Software</h3>
                <div className="grid grid-cols-2 gap-2">
                  {step.toolsUsed.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors truncate">
                          {tool.name}
                        </p>
                        {tool.notes && (
                          <p className="text-xs text-[var(--text-tertiary)] truncate">{tool.notes}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            <div className="space-y-4">
              <AutomationSuggestion 
                step={step} 
                onLearnMore={() => setActiveTab('automation')}
              />
              <ImprovementSuggestion step={step} />
            </div>

            {/* Common Mistakes */}
            {step.commonMistakes && step.commonMistakes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Common Mistakes</h3>
                <div className="space-y-3">
                  {step.commonMistakes.map((mistake) => (
                    <details key={mistake.id} className="group">
                      <summary className="flex items-center gap-3 p-3 rounded-lg bg-[var(--auto-none)]/10 border border-[var(--auto-none)]/30 cursor-pointer list-none">
                        <svg className="w-5 h-5 text-[var(--auto-none)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{mistake.title}</span>
                        <svg className="w-4 h-4 text-[var(--text-tertiary)] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-2 ml-8 p-3 rounded-lg bg-[var(--bg-tertiary)] space-y-2">
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
          <div className="space-y-6 animate-fade-in">
            {/* Videos */}
            {step.videos && step.videos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Video Guides</h3>
                <div className="space-y-4">
                  {step.videos.map((video) => (
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
                        <h4 className="font-medium text-[var(--text-primary)]">{video.title}</h4>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </p>
                        {video.chapters && video.chapters.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-2">Chapters</p>
                            <div className="space-y-1">
                              {video.chapters.map((chapter, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="text-[var(--accent-cyan)] font-mono text-xs">
                                    {Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-[var(--text-secondary)]">{chapter.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Templates */}
            {step.templates && step.templates.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Templates & Downloads</h3>
                <div className="space-y-2">
                  {step.templates.map((template) => (
                    <a
                      key={template.id}
                      href={template.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--accent-orange)]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--accent-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                          {template.name}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate">{template.description}</p>
                      </div>
                      <svg className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No Media */}
            {(!step.videos || step.videos.length === 0) && (!step.templates || step.templates.length === 0) && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-[var(--text-tertiary)]">No media attached to this step</p>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 animate-fade-in">
            {step.checklist ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{step.checklist.title}</h3>
                  <span className="text-sm text-[var(--accent-cyan)]">
                    {completedItems.size}/{step.checklist.items.length} complete
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-300"
                    style={{ width: `${(completedItems.size / step.checklist.items.length) * 100}%` }}
                  />
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {step.checklist.items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        completedItems.has(item.id)
                          ? 'bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/30'
                          : 'bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-default)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={completedItems.has(item.id)}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="mt-0.5 w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--accent-lime)] focus:ring-[var(--accent-cyan)] focus:ring-offset-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${completedItems.has(item.id) ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                          {item.text}
                          {item.required && <span className="text-[var(--auto-none)] ml-1">*</span>}
                        </p>
                        {item.helpText && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.helpText}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {step.checklist.completionCriteria && (
                  <div className="p-3 rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30">
                    <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase mb-1">Completion Criteria</p>
                    <p className="text-sm text-[var(--text-secondary)]">{step.checklist.completionCriteria}</p>
                  </div>
                )}
              </>
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
          <div className="space-y-6 animate-fade-in">
            {/* Current State */}
            <div className="p-4 rounded-xl border border-[var(--border-default)]" style={{ background: auto.bg }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${auto.color}30` }}>
                  {step.automationLevel === 'full' && (
                    <svg className="w-5 h-5" style={{ color: auto.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {step.automationLevel === 'partial' && (
                    <svg className="w-5 h-5" style={{ color: auto.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {step.automationLevel === 'none' && (
                    <svg className="w-5 h-5" style={{ color: auto.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Effort to Automate</p>
                    <p className="font-medium text-[var(--text-primary)] capitalize">{step.automationAnalysis.effortToAutomate}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                    <p className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Target State</p>
                    <p className="font-medium text-[var(--text-primary)] capitalize">{step.automationAnalysis.targetState.replace('_', ' ')}</p>
                  </div>
                </div>

                {step.automationAnalysis.blockers && step.automationAnalysis.blockers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">Blockers</h4>
                    <ul className="space-y-1">
                      {step.automationAnalysis.blockers.map((blocker, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <svg className="w-4 h-4 text-[var(--auto-none)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {step.automationAnalysis.toolsRequired && step.automationAnalysis.toolsRequired.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">Tools Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {step.automationAnalysis.toolsRequired.map((tool, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] text-sm">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step.automationAnalysis.estimatedSavingsPerMonth && (
                  <div className="p-4 rounded-lg bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/30">
                    <p className="text-xs font-semibold text-[var(--accent-lime)] uppercase mb-1">Estimated Savings</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{step.automationAnalysis.estimatedSavingsPerMonth}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">per month if automated</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Definition Preview */}
            {step.aiDefinition && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">AI Executable Definition</h4>
                <pre className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)] overflow-x-auto">
                  {JSON.stringify(step.aiDefinition, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <div className="space-y-4 animate-fade-in">
            {step.examples && step.examples.length > 0 ? (
              step.examples.map((example) => (
                <div
                  key={example.id}
                  className={`p-4 rounded-xl border ${
                    example.isPositive
                      ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/30'
                      : 'bg-[var(--auto-none)]/5 border-[var(--auto-none)]/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {example.isPositive ? (
                      <svg className="w-5 h-5 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[var(--auto-none)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <h4 className="font-medium text-[var(--text-primary)]">{example.title}</h4>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{example.scenario}</p>
                  <div className="pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">Outcome</p>
                    <p className="text-sm text-[var(--text-primary)]">{example.outcome}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-[var(--text-tertiary)]">No examples for this step yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
