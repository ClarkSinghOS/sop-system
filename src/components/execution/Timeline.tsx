'use client';

import { TimelineEntry, EventType } from '@/types/execution';

interface TimelineProps {
  events: TimelineEntry[];
  maxHeight?: string;
}

const EVENT_CONFIG: Record<EventType, { icon: string; color: string; bgColor: string }> = {
  instance_started: { icon: '🚀', color: 'var(--accent-cyan)', bgColor: 'rgba(6, 182, 212, 0.15)' },
  instance_completed: { icon: '✅', color: 'var(--status-success)', bgColor: 'rgba(16, 185, 129, 0.15)' },
  instance_failed: { icon: '❌', color: 'var(--status-error)', bgColor: 'rgba(239, 68, 68, 0.15)' },
  instance_blocked: { icon: '⏸️', color: 'var(--status-warning)', bgColor: 'rgba(245, 158, 11, 0.15)' },
  step_started: { icon: '▶️', color: 'var(--accent-lime)', bgColor: 'rgba(132, 204, 22, 0.15)' },
  step_completed: { icon: '✓', color: 'var(--status-success)', bgColor: 'rgba(16, 185, 129, 0.15)' },
  step_failed: { icon: '✗', color: 'var(--status-error)', bgColor: 'rgba(239, 68, 68, 0.15)' },
  step_blocked: { icon: '⏸', color: 'var(--status-warning)', bgColor: 'rgba(245, 158, 11, 0.15)' },
  step_assigned: { icon: '👤', color: 'var(--accent-purple)', bgColor: 'rgba(168, 85, 247, 0.15)' },
  step_reassigned: { icon: '🔄', color: 'var(--accent-orange)', bgColor: 'rgba(249, 115, 22, 0.15)' },
  comment_added: { icon: '💬', color: 'var(--text-secondary)', bgColor: 'var(--bg-tertiary)' },
  variable_updated: { icon: '📝', color: 'var(--accent-blue)', bgColor: 'rgba(59, 130, 246, 0.15)' },
};

export default function Timeline({ events, maxHeight = '400px' }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Activity</h3>
        <p className="text-sm text-[var(--text-tertiary)]">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Activity Timeline</h3>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight }}>
        <div className="p-4 space-y-4">
          {events.map((event, index) => {
            const config = EVENT_CONFIG[event.type];
            
            return (
              <div key={event.id} className="flex gap-3">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[20px] bg-[var(--border-subtle)] mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {event.message || formatEventType(event.type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                    {event.actor && (
                      <>
                        <span>by {event.actor}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatTime(event.created_at)}</span>
                    {event.step_name && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[var(--accent-cyan)]">{event.step_name}</span>
                      </>
                    )}
                  </div>

                  {/* Show metadata if interesting */}
                  {typeof event.metadata?.duration_seconds === 'number' && (
                    <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                      Duration: {formatDuration(event.metadata.duration_seconds)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatEventType(type: EventType): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
