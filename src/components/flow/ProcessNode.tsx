'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ProcessStep } from '@/types/process';

interface ProcessNodeData extends ProcessStep {
  onSelect: (stepId: string) => void;
  isSelected: boolean;
}

const typeConfig: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  task: {
    label: 'Task',
    color: 'var(--accent-blue)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  decision: {
    label: 'Decision',
    color: 'var(--accent-purple)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  parallel: {
    label: 'Parallel',
    color: 'var(--accent-orange)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  automated: {
    label: 'Automated',
    color: 'var(--accent-lime)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  human_task: {
    label: 'Human',
    color: 'var(--accent-cyan)',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  milestone: {
    label: 'Milestone',
    color: '#fbbf24',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  subprocess: {
    label: 'Subprocess',
    color: '#ec4899',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
};

const autoConfig: Record<string, { label: string; color: string }> = {
  full: { label: 'Automated', color: 'var(--auto-full)' },
  partial: { label: 'Partial', color: 'var(--auto-partial)' },
  none: { label: 'Manual', color: 'var(--auto-none)' },
};

function ProcessNode({ data }: NodeProps<ProcessNodeData>) {
  const type = typeConfig[data.type] || typeConfig.task;
  const auto = autoConfig[data.automationLevel] || autoConfig.none;
  
  const hasVideo = data.videos && data.videos.length > 0;
  const hasChecklist = data.checklist && data.checklist.items.length > 0;
  const hasDecision = data.type === 'decision' && data.decision;

  return (
    <div
      onClick={() => data.onSelect(data.stepId)}
      className={`group cursor-pointer transition-all duration-200 ${
        data.isSelected ? 'scale-105' : 'hover:scale-[1.02]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--accent-cyan)] !border-2 !border-[var(--bg-primary)]" />
      
      <div
        className={`w-[280px] rounded-xl border overflow-hidden transition-all ${
          data.isSelected
            ? 'border-[var(--accent-cyan)] shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
        }`}
        style={{
          background: `linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))`,
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: `${type.color}20`, color: type.color }}
              >
                {type.icon}
              </div>
              <span className="text-xs font-mono text-[var(--text-tertiary)]">{data.stepId}</span>
            </div>
            <div
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${auto.color}20`, color: auto.color }}
            >
              {auto.label}
            </div>
          </div>
          <h3 className="font-display font-semibold text-[var(--text-primary)] leading-tight">
            {data.name}
          </h3>
        </div>
        
        {/* Description */}
        <div className="p-3 border-b border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
            {data.shortDescription}
          </p>
        </div>
        
        {/* Meta */}
        <div className="p-3 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3">
            {/* Owner */}
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{data.ownership.owner.name}</span>
            </div>
            {/* Duration */}
            {data.timing?.estimatedDuration && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{data.timing.estimatedDuration}</span>
              </div>
            )}
          </div>
          
          {/* Indicators */}
          <div className="flex items-center gap-1.5">
            {hasVideo && (
              <div className="w-5 h-5 rounded bg-[var(--accent-purple)]/20 flex items-center justify-center" title="Has Video">
                <svg className="w-3 h-3 text-[var(--accent-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {hasChecklist && (
              <div className="w-5 h-5 rounded bg-[var(--accent-lime)]/20 flex items-center justify-center" title="Has Checklist">
                <svg className="w-3 h-3 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {hasDecision && (
              <div className="w-5 h-5 rounded bg-[var(--accent-purple)]/20 flex items-center justify-center" title="Decision Point">
                <svg className="w-3 h-3 text-[var(--accent-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--accent-cyan)] !border-2 !border-[var(--bg-primary)]" />
    </div>
  );
}

export default memo(ProcessNode);
