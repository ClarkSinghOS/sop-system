'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ProcessStep, StepType, AutomationLevel } from '@/types/process';

// Step type configuration
const STEP_CONFIG: Record<StepType, { 
  gradient: string; 
  glow: string; 
  icon: React.ReactNode;
  label: string;
}> = {
  task: {
    gradient: 'from-blue-500/20 to-blue-600/10',
    glow: 'rgba(59, 130, 246, 0.3)',
    label: 'Task',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  decision: {
    gradient: 'from-purple-500/20 to-purple-600/10',
    glow: 'rgba(168, 85, 247, 0.3)',
    label: 'Decision',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  parallel: {
    gradient: 'from-orange-500/20 to-orange-600/10',
    glow: 'rgba(249, 115, 22, 0.3)',
    label: 'Parallel',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
  },
  automated: {
    gradient: 'from-lime-500/20 to-lime-600/10',
    glow: 'rgba(132, 204, 22, 0.3)',
    label: 'Automated',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  human_task: {
    gradient: 'from-cyan-500/20 to-cyan-600/10',
    glow: 'rgba(6, 182, 212, 0.3)',
    label: 'Human Task',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  milestone: {
    gradient: 'from-amber-500/20 to-amber-600/10',
    glow: 'rgba(245, 158, 11, 0.3)',
    label: 'Milestone',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  subprocess: {
    gradient: 'from-pink-500/20 to-pink-600/10',
    glow: 'rgba(236, 72, 153, 0.3)',
    label: 'Subprocess',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
};

const AUTOMATION_CONFIG: Record<AutomationLevel, { color: string; label: string }> = {
  full: { color: 'var(--status-success)', label: 'Fully Automated' },
  partial: { color: 'var(--status-warning)', label: 'Partially Automated' },
  none: { color: 'var(--status-error)', label: 'Manual' },
};

interface ProcessNodeData extends ProcessStep {
  isSelected?: boolean;
  isCompleted?: boolean;
  onSelect?: (stepId: string) => void;
}

interface ProcessNodeProps {
  data: ProcessNodeData;
  selected?: boolean;
}

function ProcessNode({ data, selected }: ProcessNodeProps) {
  const config = STEP_CONFIG[data.type];
  const autoConfig = AUTOMATION_CONFIG[data.automationLevel];
  const isSelected = selected || data.isSelected;

  return (
    <div 
      className={`
        group relative min-w-[280px] max-w-[320px]
        transition-all duration-300 ease-out
        ${isSelected ? 'scale-105 z-10' : 'hover:scale-[1.02]'}
      `}
      onClick={() => data.onSelect?.(data.stepId)}
    >
      {/* Glow Effect */}
      <div 
        className={`
          absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300
          ${isSelected ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}
        `}
        style={{ background: config.glow }}
      />
      
      {/* Card */}
      <div 
        className={`
          relative rounded-2xl overflow-hidden
          bg-gradient-to-br ${config.gradient}
          border transition-all duration-300
          ${isSelected 
            ? 'border-[var(--accent-cyan)] shadow-lg' 
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
          }
        `}
        style={{
          background: `linear-gradient(145deg, var(--bg-elevated) 0%, var(--bg-tertiary) 100%)`,
        }}
      >
        {/* Top Accent */}
        <div 
          className="h-1 w-full"
          style={{ 
            background: `linear-gradient(90deg, ${config.glow}, transparent)`,
          }}
        />
        
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-start gap-3">
          {/* Type Icon */}
          <div 
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ 
              background: config.glow,
              boxShadow: `0 0 20px ${config.glow}`,
            }}
          >
            <span className="text-white">{config.icon}</span>
          </div>
          
          {/* Title & Meta */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {data.stepId}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
              <span className="text-xs text-[var(--text-tertiary)]">
                {config.label}
              </span>
            </div>
          </div>
          
          {/* Completed Indicator */}
          {data.isCompleted && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[var(--status-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="px-4 pb-3">
          {data.shortDescription && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {data.shortDescription}
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-[var(--border-subtle)] bg-black/20">
          {/* Owner */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-tertiary)]">
              {data.ownership?.owner?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">{data.ownership?.owner?.name || 'Unassigned'}</span>
          </div>
          
          {/* Timing & Automation */}
          <div className="flex items-center gap-3">
            {/* Timing */}
            {data.timing?.estimatedDuration && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {data.timing.estimatedDuration}
                </span>
              </div>
            )}
            
            {/* Automation Badge */}
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                background: autoConfig.color,
                boxShadow: `0 0 8px ${autoConfig.color}`,
              }}
              title={autoConfig.label}
            />
          </div>
        </div>
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-cyan)] pointer-events-none" />
        )}
      </div>
      
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[var(--bg-surface)] !border-2 !border-[var(--border-strong)] hover:!border-[var(--accent-cyan)] !-top-1.5 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--bg-surface)] !border-2 !border-[var(--border-strong)] hover:!border-[var(--accent-cyan)] !-bottom-1.5 transition-colors"
      />
    </div>
  );
}

export default memo(ProcessNode);
