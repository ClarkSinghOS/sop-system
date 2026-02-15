'use client';

import { useState } from 'react';
import ScreenRecorder from './ScreenRecorder';
import VideoProcessor from './VideoProcessor';
import { ProcessStep } from '@/types/process';

interface RecordingFlowProps {
  onStepsGenerated: (steps: Partial<ProcessStep>[]) => void;
  onClose: () => void;
}

type FlowStage = 'record' | 'process' | 'review';

interface ProcessingResult {
  videoUrl: string;
  transcript: string;
  suggestedSteps: Partial<ProcessStep>[];
  chapters: Array<{ time: number; title: string; description: string }>;
}

export default function RecordingFlow({ onStepsGenerated, onClose }: RecordingFlowProps) {
  const [stage, setStage] = useState<FlowStage>('record');
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<Set<number>>(new Set());

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordingBlob(blob);
    setRecordingDuration(duration);
    setStage('process');
  };

  const handleProcessComplete = (processingResult: ProcessingResult) => {
    setResult(processingResult);
    // Select all steps by default
    setSelectedSteps(new Set(processingResult.suggestedSteps.map((_, i) => i)));
    setStage('review');
  };

  const toggleStepSelection = (index: number) => {
    const newSelected = new Set(selectedSteps);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSteps(newSelected);
  };

  const handleConfirm = () => {
    if (result) {
      const stepsToAdd = result.suggestedSteps.filter((_, i) => selectedSteps.has(i));
      onStepsGenerated(stepsToAdd);
    }
  };

  const handleStartOver = () => {
    setStage('record');
    setRecordingBlob(null);
    setRecordingDuration(0);
    setResult(null);
    setSelectedSteps(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-default)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <div>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
              {stage === 'record' && 'Record Process'}
              {stage === 'process' && 'Processing Recording'}
              {stage === 'review' && 'Review & Import Steps'}
            </h2>
            <p className="text-sm text-[var(--text-tertiary)]">
              {stage === 'record' && 'Capture your screen while demonstrating the process'}
              {stage === 'process' && 'AI is analyzing your recording'}
              {stage === 'review' && 'Select which steps to import'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 p-4 border-b border-[var(--border-subtle)]">
          {[
            { id: 'record', label: 'Record' },
            { id: 'process', label: 'Process' },
            { id: 'review', label: 'Review' },
          ].map((step, i) => {
            const isActive = step.id === stage;
            const isComplete = ['record', 'process', 'review'].indexOf(stage) > i;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isComplete ? 'bg-[var(--accent-lime)]/20 text-[var(--accent-lime)]' :
                  isActive ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]' :
                  'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                  {step.label}
                </div>
                {i < 2 && (
                  <svg className="w-4 h-4 mx-2 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Record Stage */}
          {stage === 'record' && (
            <ScreenRecorder
              onRecordingComplete={handleRecordingComplete}
            />
          )}

          {/* Process Stage */}
          {stage === 'process' && recordingBlob && (
            <VideoProcessor
              videoBlob={recordingBlob}
              duration={recordingDuration}
              onProcessComplete={handleProcessComplete}
              onCancel={handleStartOver}
            />
          )}

          {/* Review Stage */}
          {stage === 'review' && result && (
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="rounded-xl overflow-hidden bg-black aspect-video">
                <video
                  src={result.videoUrl || (recordingBlob ? URL.createObjectURL(recordingBlob) : undefined)}
                  className="w-full h-full object-contain"
                  controls
                />
              </div>

              {/* Transcript */}
              {result.transcript && (
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    View Transcript
                  </summary>
                  <div className="mt-3 p-4 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-secondary)] max-h-40 overflow-y-auto">
                    {result.transcript}
                  </div>
                </details>
              )}

              {/* Suggested Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    AI-Suggested Steps ({selectedSteps.size}/{result.suggestedSteps.length} selected)
                  </h3>
                  <button
                    onClick={() => {
                      if (selectedSteps.size === result.suggestedSteps.length) {
                        setSelectedSteps(new Set());
                      } else {
                        setSelectedSteps(new Set(result.suggestedSteps.map((_, i) => i)));
                      }
                    }}
                    className="text-xs text-[var(--accent-cyan)] hover:underline"
                  >
                    {selectedSteps.size === result.suggestedSteps.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2">
                  {result.suggestedSteps.map((step, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedSteps.has(index)
                          ? 'bg-[var(--accent-cyan)]/5 border-[var(--accent-cyan)]/30'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSteps.has(index)}
                        onChange={() => toggleStepSelection(index)}
                        className="mt-1 w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-[var(--accent-cyan)]">Step {index + 1}</span>
                          {step.timing?.estimatedMinutes && (
                            <span className="text-xs text-[var(--text-tertiary)]">
                              ~{step.timing.estimatedMinutes} min
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-[var(--text-primary)]">{step.name}</h4>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{step.shortDescription}</p>
                        {step.ownership?.owner && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-2">
                            Owner: {typeof step.ownership.owner === 'string' ? step.ownership.owner : step.ownership.owner.name}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {result.suggestedSteps.length === 0 && (
                  <div className="text-center py-8 text-[var(--text-tertiary)]">
                    <p>No steps were automatically detected.</p>
                    <p className="text-sm mt-1">Try recording with narration or add steps manually.</p>
                  </div>
                )}
              </div>

              {/* Chapters */}
              {result.chapters && result.chapters.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-3">Video Chapters</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {result.chapters.map((chapter, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[var(--bg-secondary)] text-center">
                        <span className="text-xs font-mono text-[var(--accent-cyan)]">
                          {Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')}
                        </span>
                        <p className="text-sm font-medium text-[var(--text-primary)] mt-1 truncate">
                          {chapter.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={handleStartOver}
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] font-medium"
                >
                  Record Again
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedSteps.size === 0}
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--accent-cyan)] text-black font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {selectedSteps.size} Step{selectedSteps.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
