'use client';

import { useState } from 'react';
import { InstanceWithDetails, STATUS_CONFIG, StepStatus } from '@/types/execution';
import { ProcessStep } from '@/types/process';
import StepProgress from './StepProgress';
import AssignmentCard from './AssignmentCard';
import Timeline from './Timeline';
import { TimelineEntry } from '@/types/execution';

interface ExecutionPanelProps {
  instance: InstanceWithDetails;
  timeline: TimelineEntry[];
  loading?: boolean;
  onCompleteStep: (stepId: string) => void;
  onAssignStep: (stepId: string, assignee: string) => void;
  onClose: () => void;
}

type Tab = 'overview' | 'timeline';

export default function ExecutionPanel({
  instance,
  timeline,
  loading = false,
  onCompleteStep,
  onAssignStep,
  onClose,
}: ExecutionPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [assigneeInput, setAssigneeInput] = useState('');

  const processSnapshot = instance.process_snapshot;
  const currentStep = instance.current_step_id
    ? processSnapshot.steps.find(s => s.stepId === instance.current_step_id)
    : null;

  const statusConfig = STATUS_CONFIG[instance.status];
  const completedSteps = instance.steps.filter(s => s.status === 'completed').length;
  const progress = instance.steps.length > 0 
    ? Math.round((completedSteps / instance.steps.length) * 100) 
    : 0;

  const handleAssign = (stepId: string) => {
    if (assigneeInput.trim()) {
      onAssignStep(stepId, assigneeInput.trim());
      setAssigneeInput('');
      setShowAssignModal(null);
    }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-[var(--bg-primary)] border-l border-[var(--border-default)] flex flex-col z-50 animate-slide-in">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusConfig.color }}
            />
            <span className="text-xs font-mono text-[var(--text-tertiary)]">
              INSTANCE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">
          {processSnapshot.name}
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Started by {instance.started_by || 'system'} • {formatDate(instance.started_at)}
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-3 mt-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {progress}% complete
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-[var(--border-subtle)]">
        {(['overview', 'timeline'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab 
                ? 'text-[var(--accent-cyan)] border-b-2 border-[var(--accent-cyan)]' 
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Current Step Card */}
            {currentStep && instance.status !== 'completed' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)]/10 to-[var(--accent-lime)]/10 border border-[var(--accent-cyan)]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--accent-cyan)] font-medium">CURRENT STEP</span>
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">{currentStep.stepId}</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {currentStep.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {currentStep.shortDescription}
                </p>

                <button
                  onClick={() => onCompleteStep(currentStep.stepId)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--accent-lime)] text-black font-medium hover:bg-[var(--accent-lime)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Step
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Completed State */}
            {instance.status === 'completed' && (
              <div className="p-4 rounded-xl bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--status-success)]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--status-success)]">Process Completed</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Finished {instance.completed_at ? formatDate(instance.completed_at) : ''}
                </p>
              </div>
            )}

            {/* Step Progress */}
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Steps</h3>
              <StepProgress
                steps={instance.steps}
                processSteps={processSnapshot.steps}
                currentStepId={instance.current_step_id}
              />
            </div>

            {/* Assignments */}
            <AssignmentCard
              assignments={instance.assignments}
              currentStepId={instance.current_step_id}
              onAssign={(stepId) => setShowAssignModal(stepId)}
            />
          </>
        )}

        {activeTab === 'timeline' && (
          <Timeline events={timeline} maxHeight="calc(100vh - 250px)" />
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-[400px] max-w-[90vw] border border-[var(--border-default)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Assign Step
            </h3>
            <input
              type="text"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              placeholder="Enter name or email..."
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAssign(showAssignModal);
                if (e.key === 'Escape') setShowAssignModal(null);
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAssignModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(showAssignModal)}
                disabled={!assigneeInput.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-medium hover:bg-[var(--accent-cyan)]/90 transition-colors disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
