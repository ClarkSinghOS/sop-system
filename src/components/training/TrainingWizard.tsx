'use client';

import { useState, useEffect, useCallback } from 'react';
import { Process, ProcessStep } from '@/types/process';
import { TrainingProgress } from '@/types/training';
import { fireConfetti } from '@/lib/confetti';

interface TrainingWizardProps {
  process: Process;
  onComplete: (progress: TrainingProgress) => void;
  onExit: () => void;
  isPracticeMode?: boolean;
}

export default function TrainingWizard({ 
  process, 
  onComplete, 
  onExit,
  isPracticeMode = false 
}: TrainingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [checklistProgress, setChecklistProgress] = useState<Record<string, Set<string>>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [startTime] = useState(Date.now());
  const [videoPlaying, setVideoPlaying] = useState(false);

  const currentStep = process.steps[currentStepIndex];
  const totalSteps = process.steps.length;
  const progress = (currentStepIndex / totalSteps) * 100;

  // Check if current step's required checklist items are complete
  const isStepComplete = useCallback(() => {
    if (!currentStep.checklist) return true;
    
    const stepProgress = checklistProgress[currentStep.stepId] || new Set();
    const requiredItems = currentStep.checklist.items.filter(item => item.required);
    
    return requiredItems.every(item => stepProgress.has(item.id));
  }, [currentStep, checklistProgress]);

  // Handle checklist item toggle
  const toggleChecklistItem = (itemId: string) => {
    setChecklistProgress(prev => {
      const stepProgress = new Set(prev[currentStep.stepId] || []);
      if (stepProgress.has(itemId)) {
        stepProgress.delete(itemId);
      } else {
        stepProgress.add(itemId);
      }
      return { ...prev, [currentStep.stepId]: stepProgress };
    });
  };

  // Go to next step
  const handleNext = () => {
    if (!isStepComplete()) return;

    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep.stepId]));

    if (currentStepIndex < totalSteps - 1) {
      // Mini celebration
      fireConfetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#22d3ee', '#a3e635'],
      });
      
      setCurrentStepIndex(prev => prev + 1);
      setVideoPlaying(false);
    } else {
      // Training complete - big celebration!
      setShowCelebration(true);
      fireConfetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10b981', '#22d3ee', '#a3e635', '#fbbf24'],
      });
    }
  };

  // Go to previous step
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setVideoPlaying(false);
    }
  };

  // Complete training
  const handleComplete = () => {
    const trainingProgress: TrainingProgress = {
      processId: process.id,
      userId: 'current-user', // Would come from auth
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      currentStepIndex: totalSteps,
      completedSteps: Array.from(completedSteps),
      checklistProgress: Object.fromEntries(
        Object.entries(checklistProgress).map(([k, v]) => [k, Array.from(v)])
      ),
      quizAttempts: [],
      certified: false,
    };
    onComplete(trainingProgress);
  };

  // Auto-play video when step changes
  useEffect(() => {
    if (currentStep.videos && currentStep.videos.length > 0) {
      setVideoPlaying(true);
    }
  }, [currentStep]);

  const stepProgress = checklistProgress[currentStep.stepId] || new Set();
  const requiredCount = currentStep.checklist?.items.filter(i => i.required).length || 0;
  const completedRequiredCount = currentStep.checklist?.items.filter(
    i => i.required && stepProgress.has(i.id)
  ).length || 0;

  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-lime)] to-[var(--accent-cyan)] flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4">
            🎉 Training Complete!
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-2">
            You&apos;ve completed all {totalSteps} steps of
          </p>
          <p className="text-xl font-semibold text-[var(--accent-cyan)] mb-8">
            {process.name}
          </p>
          <p className="text-[var(--text-tertiary)] mb-8">
            Time spent: {Math.round((Date.now() - startTime) / 60000)} minutes
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleComplete}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] text-black font-semibold hover:opacity-90 transition-opacity"
            >
              Take the Quiz →
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Exit Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col">
      {/* Practice Mode Banner */}
      {isPracticeMode && (
        <div className="bg-[var(--accent-purple)]/20 border-b border-[var(--accent-purple)]/30 px-4 py-2 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-[var(--accent-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium text-[var(--accent-purple)]">
            Practice Mode - Actions won&apos;t affect real data
          </span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-[var(--accent-cyan)]">{process.processId}</span>
            <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
              Training: {process.name}
            </h1>
          </div>
          <button
            onClick={onExit}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {process.steps.map((step, index) => (
            <div
              key={step.stepId}
              className={`flex-shrink-0 w-8 h-1 rounded-full transition-all ${
                index < currentStepIndex
                  ? 'bg-[var(--accent-lime)]'
                  : index === currentStepIndex
                  ? 'bg-[var(--accent-cyan)]'
                  : 'bg-[var(--bg-tertiary)]'
              }`}
              title={step.name}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Step Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center text-black font-bold">
                {currentStepIndex + 1}
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--accent-cyan)]">{currentStep.stepId}</span>
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                  {currentStep.name}
                </h2>
              </div>
            </div>
            {currentStep.timing?.estimatedDuration && (
              <p className="text-sm text-[var(--text-tertiary)] ml-13 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estimated: {currentStep.timing.estimatedDuration}
              </p>
            )}
          </div>

          {/* Video Section */}
          {currentStep.videos && currentStep.videos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--accent-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch First
              </h3>
              <div className="rounded-xl overflow-hidden border border-[var(--border-default)]">
                <div className="video-container bg-black aspect-video">
                  <iframe
                    src={`${currentStep.videos[0].embedUrl}${videoPlaying ? '?autoplay=1' : ''}`}
                    title={currentStep.videos[0].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-3 bg-[var(--bg-tertiary)]">
                  <h4 className="font-medium text-[var(--text-primary)]">{currentStep.videos[0].title}</h4>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {Math.floor(currentStep.videos[0].duration / 60)}:{(currentStep.videos[0].duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              What You&apos;ll Do
            </h3>
            <p className="text-[var(--text-primary)] mb-4">{currentStep.shortDescription}</p>
            <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--text-secondary)] leading-relaxed">
              {currentStep.longDescription}
            </pre>
          </div>

          {/* Why It Matters */}
          {currentStep.whyItMatters && (
            <div className="mb-6 p-4 rounded-xl border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5">
              <h3 className="text-sm font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why This Matters
              </h3>
              <p className="text-[var(--text-secondary)]">{currentStep.whyItMatters}</p>
            </div>
          )}

          {/* Checklist */}
          {currentStep.checklist && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Complete These Tasks
                </h3>
                <span className={`text-sm font-medium ${
                  completedRequiredCount === requiredCount 
                    ? 'text-[var(--accent-lime)]' 
                    : 'text-[var(--text-tertiary)]'
                }`}>
                  {completedRequiredCount}/{requiredCount} required
                </span>
              </div>

              {/* Checklist Progress */}
              <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[var(--accent-lime)] transition-all duration-300"
                  style={{ width: `${requiredCount > 0 ? (completedRequiredCount / requiredCount) * 100 : 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {currentStep.checklist.items.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      stepProgress.has(item.id)
                        ? 'bg-[var(--accent-lime)]/10 border-2 border-[var(--accent-lime)]/50'
                        : 'bg-[var(--bg-secondary)] border-2 border-transparent hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      stepProgress.has(item.id)
                        ? 'bg-[var(--accent-lime)] text-black'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                    }`}>
                      {stepProgress.has(item.id) ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{item.order}</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={stepProgress.has(item.id)}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        stepProgress.has(item.id) 
                          ? 'text-[var(--accent-lime)]' 
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {item.text}
                        {item.required && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[var(--auto-none)]/20 text-[var(--auto-none)]">
                            Required
                          </span>
                        )}
                      </p>
                      {item.helpText && (
                        <p className="text-sm text-[var(--text-tertiary)] mt-1">{item.helpText}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tools Used */}
          {currentStep.toolsUsed && currentStep.toolsUsed.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Tools You&apos;ll Use
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentStep.toolsUsed.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent-blue)] transition-colors group"
                  >
                    <div className="w-6 h-6 rounded bg-[var(--accent-blue)]/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)]">
                      {tool.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes Warning */}
          {currentStep.commonMistakes && currentStep.commonMistakes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--auto-none)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Watch Out For
              </h3>
              <div className="space-y-2">
                {currentStep.commonMistakes.slice(0, 2).map((mistake) => (
                  <div key={mistake.id} className="p-3 rounded-lg bg-[var(--auto-none)]/10 border border-[var(--auto-none)]/30">
                    <p className="font-medium text-[var(--text-primary)] text-sm">{mistake.title}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{mistake.howToFix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {currentStep.ownership.owner.name}
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              isStepComplete()
                ? 'bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] text-black hover:opacity-90'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
            }`}
          >
            {currentStepIndex === totalSteps - 1 ? 'Complete Training' : 'Next Step'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
