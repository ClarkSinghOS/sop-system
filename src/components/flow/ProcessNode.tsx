'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ProcessStep, StepType, AutomationLevel } from '@/types/process';

// Simple color mapping
const TYPE_COLORS: Record<StepType, string> = {
  task: '#3b82f6',
  decision: '#a855f7',
  parallel: '#f97316',
  automated: '#84cc16',
  human_task: '#06b6d4',
  milestone: '#fbbf24',
  subprocess: '#ec4899',
};

interface ProcessNodeData extends ProcessStep {
  isSelected?: boolean;
  onSelect?: (stepId: string) => void;
}

interface ProcessNodeProps {
  data: ProcessNodeData;
  selected?: boolean;
}

function ProcessNode({ data, selected }: ProcessNodeProps) {
  const isSelected = selected || data.isSelected;
  const color = TYPE_COLORS[data.type] || '#6b7280';
  
  return (
    <div 
      className={`
        w-[260px] rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200 ease-out
        ${isSelected 
          ? 'ring-2 ring-[var(--accent-cyan)] shadow-lg scale-[1.02]' 
          : 'hover:shadow-md hover:scale-[1.01]'
        }
      `}
      onClick={() => data.onSelect?.(data.stepId)}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}
    >
      {/* Color Bar */}
      <div className="h-1" style={{ backgroundColor: color }} />
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm text-[var(--text-primary)] leading-snug mb-1">
          {data.name}
        </h3>
        
        {/* Description */}
        {data.shortDescription && (
          <p className="text-xs text-[var(--text-tertiary)] line-clamp-2 mb-3">
            {data.shortDescription}
          </p>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">
            {data.ownership?.owner?.name || 'Unassigned'}
          </span>
          {data.timing?.estimatedDuration && (
            <span className="text-[var(--text-muted)]">
              {data.timing.estimatedDuration}
            </span>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[var(--border-strong)] !border-0 !-top-1"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[var(--border-strong)] !border-0 !-bottom-1"
      />
    </div>
  );
}

export default memo(ProcessNode);
