'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ViewMode, ProcessStep } from '@/types/process';
import { marketingFlowProcess } from '@/data/marketing-flow';
import StepDetailPanel from '@/components/panels/StepDetailPanel';
import { RecordingFlow } from '@/components/recording';
import { AIProvider } from '@/contexts/AIContext';

// Dynamic import for React Flow (client-side only)
const ProcessFlow = dynamic(() => import('@/components/flow/ProcessFlow'), { ssr: false });

export default function Home() {
  return (
    <AIProvider initialProcess={marketingFlowProcess}>
      <ProcessViewer />
    </AIProvider>
  );
}

function ProcessViewer() {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showRecording, setShowRecording] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const process = marketingFlowProcess;

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedStep = useMemo(() => {
    return process.steps.find(s => s.stepId === selectedStepId) || null;
  }, [selectedStepId, process.steps]);

  const handleSelectStep = (stepId: string) => {
    setSelectedStepId(stepId === selectedStepId ? null : stepId);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-void)]">
      {/* Simple Header */}
      <header className={`
        flex-shrink-0 px-6 py-4 
        border-b border-[var(--border-subtle)]
        bg-[var(--bg-secondary)]
        ${mounted ? 'animate-reveal-up' : 'opacity-0'}
      `}>
        <div className="flex items-center justify-between">
          {/* Left: Process Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-lime)] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
                {process.name}
              </h1>
              <p className="text-sm text-[var(--text-tertiary)]">
                {process.steps.length} steps · {process.estimatedDuration}
              </p>
            </div>
          </div>

          {/* Right: Simple Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRecording(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Record</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Flow + Detail Panel */}
      <main className="flex-1 flex overflow-hidden">
        {/* Flow Chart */}
        <div className={`
          flex-1 relative
          ${mounted ? 'animate-reveal-up stagger-1' : 'opacity-0'}
        `}>
          {/* Instruction Overlay (only when nothing selected) */}
          {!selectedStepId && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-[var(--bg-elevated)]/90 backdrop-blur border border-[var(--border-default)] text-sm text-[var(--text-secondary)]">
                Click any step to see details
              </div>
            </div>
          )}
          
          <ProcessFlow
            steps={process.steps}
            selectedStepId={selectedStepId}
            onSelectStep={handleSelectStep}
          />
        </div>

        {/* Detail Panel (slides in when step selected) */}
        {selectedStep && (
          <div className={`
            w-[500px] flex-shrink-0 border-l border-[var(--border-subtle)]
            bg-[var(--bg-secondary)] overflow-y-auto
            animate-slide-in-right
          `}>
            <StepDetailPanel
              step={selectedStep}
              processId={process.id}
              onClose={() => setSelectedStepId(null)}
            />
          </div>
        )}
      </main>

      {/* Recording Modal */}
      {showRecording && (
        <RecordingFlow
          onClose={() => setShowRecording(false)}
          onStepsGenerated={(steps) => {
            console.log('Generated steps:', steps);
            setShowRecording(false);
          }}
        />
      )}
    </div>
  );
}
