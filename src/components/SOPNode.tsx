'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SOPNodeData } from '@/types/sop';

const automatableColors = {
  none: { bg: 'bg-red-500/20', border: 'border-red-500/50', badge: 'bg-red-500' },
  partial: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', badge: 'bg-yellow-500' },
  full: { bg: 'bg-green-500/20', border: 'border-green-500/50', badge: 'bg-green-500' },
};

function SOPNode({ data }: NodeProps<SOPNodeData>) {
  const [expanded, setExpanded] = useState(false);
  const colors = automatableColors[data.automatable];

  return (
    <div
      className={`min-w-[280px] max-w-[400px] rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />

      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-blue-400">{data.stepId}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} text-white font-medium`}>
            {data.automatable === 'full' ? 'Automated' : data.automatable === 'partial' ? 'Partial' : 'Manual'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white">{data.label}</h3>
        <p className="text-sm text-gray-300 mt-1">{data.shortDesc}</p>
      </div>

      {/* Meta info */}
      <div className="px-4 py-2 flex items-center gap-4 text-xs text-gray-400 border-b border-white/5">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {data.owner}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {data.duration}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="animate-fade-in">
          {/* Long description */}
          <div className="p-4 border-b border-white/5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Details</h4>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{data.longDesc}</pre>
          </div>

          {/* Video embed */}
          {data.videoUrl && (
            <div className="p-4 border-b border-white/5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Video Guide</h4>
              <div className="aspect-video rounded-lg overflow-hidden bg-black/50">
                <iframe
                  src={data.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          )}

          {/* Linked processes */}
          {data.linkedProcesses && data.linkedProcesses.length > 0 && (
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Linked Processes</h4>
              <div className="flex flex-wrap gap-2">
                {data.linkedProcesses.map((process) => (
                  <span
                    key={process}
                    className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    {process}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expand/collapse button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
      >
        {expanded ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Less
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            More Details
          </>
        )}
      </button>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
}

export default memo(SOPNode);
