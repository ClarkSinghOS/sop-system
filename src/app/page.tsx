'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ViewMode, ProcessStep } from '@/types/process';
import { marketingFlowProcess } from '@/data/marketing-flow';
import ViewToggle from '@/components/ui/ViewToggle';
import StepDetailPanel from '@/components/panels/StepDetailPanel';
import { RecordingFlow } from '@/components/recording';

// Dynamic import for React Flow (client-side only)
const ProcessFlow = dynamic(() => import('@/components/flow/ProcessFlow'), { ssr: false });

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showRecordingFlow, setShowRecordingFlow] = useState(false);

  const process = marketingFlowProcess;
  
  const selectedStep = useMemo(() => {
    return process.steps.find(s => s.stepId === selectedStepId) || null;
  }, [selectedStepId, process.steps]);

  const handleSelectStep = (stepId: string) => {
    setSelectedStepId(stepId === selectedStepId ? null : stepId);
  };

  const progress = (completedSteps.size / process.steps.length) * 100;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Process Info */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--accent-cyan)]">{process.processId}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-lime)]/20 text-[var(--accent-lime)]">
                    v{process.version}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
                    {process.status}
                  </span>
                </div>
                <h1 className="text-xl font-display font-bold text-[var(--text-primary)] mt-1">
                  {process.name}
                </h1>
              </div>
            </div>

            {/* Center: View Toggle */}
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />

            {/* Right: Quick Stats + Record Button */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-[var(--text-tertiary)] text-xs">Steps</p>
                <p className="font-semibold text-[var(--text-primary)]">{process.steps.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[var(--text-tertiary)] text-xs">Duration</p>
                <p className="font-semibold text-[var(--text-primary)]">{process.estimatedDuration}</p>
              </div>
              <div className="text-center">
                <p className="text-[var(--text-tertiary)] text-xs">Owner</p>
                <p className="font-semibold text-[var(--text-primary)]">{process.owner.name}</p>
              </div>
              <button
                onClick={() => setShowRecordingFlow(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Record
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="px-4 py-2 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-tertiary)] text-xs uppercase font-semibold">Summary:</span>
            {process.shortVersion.map((step, i) => (
              <span key={i} className="flex items-center gap-2 text-[var(--text-secondary)]">
                {step}
                {i < process.shortVersion.length - 1 && (
                  <svg className="w-4 h-4 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Flow View */}
        {viewMode === 'flow' && (
          <div className={`h-full transition-all duration-300 ${selectedStepId ? 'mr-[640px]' : ''}`}>
            <ProcessFlow
              steps={process.steps}
              selectedStepId={selectedStepId}
              onSelectStep={handleSelectStep}
            />
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--border-default)]" />
                
                {process.steps.map((step, index) => (
                  <div key={step.stepId} className="relative flex gap-6 pb-8">
                    {/* Timeline Node */}
                    <div
                      className={`relative z-10 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:scale-110 ${
                        selectedStepId === step.stepId ? 'ring-2 ring-[var(--accent-cyan)]' : ''
                      }`}
                      style={{
                        background: step.automationLevel === 'full' ? 'var(--auto-full)' : 
                                   step.automationLevel === 'partial' ? 'var(--auto-partial)' : 'var(--auto-none)',
                      }}
                      onClick={() => handleSelectStep(step.stepId)}
                    >
                      <span className="text-xl font-bold text-black">{index + 1}</span>
                    </div>
                    
                    {/* Content */}
                    <div
                      className={`flex-1 p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedStepId === step.stepId
                          ? 'bg-[var(--bg-elevated)] border-[var(--accent-cyan)]'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                      }`}
                      onClick={() => handleSelectStep(step.stepId)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
                        {step.timing?.estimatedDuration && (
                          <span className="text-xs text-[var(--text-tertiary)]">• {step.timing.estimatedDuration}</span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-[var(--text-primary)]">{step.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{step.shortDescription}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-tertiary)]">
                        <span>{step.ownership.owner.name}</span>
                        {step.videos && step.videos.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">
                            {step.videos.length} video{step.videos.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {step.checklist && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--accent-lime)]/20 text-[var(--accent-lime)]">
                            {step.checklist.items.length} tasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {process.steps.map((step) => (
                <div
                  key={step.stepId}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedStepId === step.stepId
                      ? 'bg-[var(--bg-elevated)] border-[var(--accent-cyan)] shadow-lg shadow-[var(--accent-cyan)]/20'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  }`}
                  onClick={() => handleSelectStep(step.stepId)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: step.automationLevel === 'full' ? 'rgba(16,185,129,0.2)' :
                                   step.automationLevel === 'partial' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: step.automationLevel === 'full' ? 'var(--auto-full)' :
                               step.automationLevel === 'partial' ? 'var(--auto-partial)' : 'var(--auto-none)',
                      }}
                    >
                      {step.automationLevel === 'full' ? 'Automated' : step.automationLevel === 'partial' ? 'Partial' : 'Manual'}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-[var(--text-primary)] mb-2">{step.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{step.shortDescription}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)]">
                    <span>{step.ownership.owner.name}</span>
                    <span>{step.timing?.estimatedDuration || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist View */}
        {viewMode === 'checklist' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              {/* Progress */}
              <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Overall Progress</span>
                  <span className="text-sm text-[var(--accent-cyan)]">{completedSteps.size}/{process.steps.length} steps</span>
                </div>
                <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Steps as Checklist */}
              <div className="space-y-3">
                {process.steps.map((step, index) => (
                  <div
                    key={step.stepId}
                    className={`p-4 rounded-xl border transition-all ${
                      completedSteps.has(step.stepId)
                        ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/30'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-default)]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => {
                          const newCompleted = new Set(completedSteps);
                          if (newCompleted.has(step.stepId)) {
                            newCompleted.delete(step.stepId);
                          } else {
                            newCompleted.add(step.stepId);
                          }
                          setCompletedSteps(newCompleted);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          completedSteps.has(step.stepId)
                            ? 'bg-[var(--accent-lime)] text-black'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        {completedSteps.has(step.stepId) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="font-semibold">{index + 1}</span>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[var(--accent-cyan)]">{step.stepId}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">• {step.ownership.owner.name}</span>
                        </div>
                        <h3
                          className={`font-display font-semibold mt-1 cursor-pointer hover:text-[var(--accent-cyan)] transition-colors ${
                            completedSteps.has(step.stepId) ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
                          }`}
                          onClick={() => handleSelectStep(step.stepId)}
                        >
                          {step.name}
                        </h3>
                        {step.checklist && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            {step.checklist.items.length} sub-tasks
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectStep(step.stepId)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI View */}
        {viewMode === 'ai' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
              <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">AI Executable Format</h2>
                    <p className="text-sm text-[var(--text-tertiary)]">JSON schema for automation and AI agents</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(process, null, 2))}
                    className="px-4 py-2 rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30 transition-colors text-sm font-medium"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-sm font-mono text-[var(--text-secondary)] overflow-x-auto max-h-[calc(100vh-300px)]">
                  {JSON.stringify(process, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedStepId && (
          <StepDetailPanel
            step={selectedStep}
            onClose={() => setSelectedStepId(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <span>Last Updated: {process.updatedAt}</span>
          <span className="flex items-center gap-4">
            <span>Department: {process.department}</span>
            <span>Tags: {process.tags.slice(0, 3).join(', ')}</span>
          </span>
        </div>
      </footer>

      {/* Recording Flow Modal */}
      {showRecordingFlow && (
        <RecordingFlow
          onStepsGenerated={(steps) => {
            console.log('New steps from recording:', steps);
            // TODO: Add steps to process
            setShowRecordingFlow(false);
          }}
          onClose={() => setShowRecordingFlow(false)}
        />
      )}
    </div>
  );
}
