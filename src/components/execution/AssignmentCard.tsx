'use client';

import { InstanceAssignment } from '@/types/execution';

interface AssignmentCardProps {
  assignments: InstanceAssignment[];
  currentStepId: string | null;
  onAssign?: (stepId: string) => void;
}

export default function AssignmentCard({ assignments, currentStepId, onAssign }: AssignmentCardProps) {
  // Group assignments by step
  const stepAssignments: Record<string, InstanceAssignment[]> = {};
  assignments.forEach(a => {
    if (!stepAssignments[a.step_id]) {
      stepAssignments[a.step_id] = [];
    }
    stepAssignments[a.step_id].push(a);
  });

  const currentAssignments = currentStepId ? stepAssignments[currentStepId] || [] : [];

  if (assignments.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Assignments</h3>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">No one assigned yet</p>
        {currentStepId && onAssign && (
          <button
            onClick={() => onAssign(currentStepId)}
            className="mt-3 w-full px-3 py-2 rounded-lg border border-dashed border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors text-sm"
          >
            + Assign someone
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Current Assignments</h3>
        <span className="text-xs text-[var(--text-tertiary)]">{currentAssignments.length} active</span>
      </div>

      <div className="space-y-2">
        {currentAssignments.map(assignment => (
          <div
            key={assignment.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-tertiary)]"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-lime)] flex items-center justify-center text-black font-semibold text-sm">
              {assignment.assigned_to.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {assignment.assigned_to}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Assigned {formatRelativeTime(assignment.assigned_at)}
              </p>
            </div>

            {/* Status */}
            <span className={`
              text-[10px] px-2 py-0.5 rounded-full font-medium
              ${assignment.status === 'active' 
                ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]' 
                : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'}
            `}>
              {assignment.status}
            </span>
          </div>
        ))}
      </div>

      {currentStepId && onAssign && (
        <button
          onClick={() => onAssign(currentStepId)}
          className="mt-3 w-full px-3 py-2 rounded-lg border border-dashed border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors text-sm"
        >
          + Add assignee
        </button>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
