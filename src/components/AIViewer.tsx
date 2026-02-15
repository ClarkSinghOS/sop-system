'use client';

import { useState } from 'react';
import { SOPAIFormat } from '@/types/sop';

interface AIViewerProps {
  data: SOPAIFormat;
}

export default function AIViewer({ data }: AIViewerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const typeColors: Record<string, string> = {
    task: 'text-blue-400',
    decision: 'text-purple-400',
    parallel: 'text-orange-400',
    subprocess: 'text-cyan-400',
    human_task: 'text-red-400',
    automated: 'text-green-400',
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">AI Executable Format</h3>
          <p className="text-sm text-gray-400">JSON schema for automation</p>
        </div>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2"
        >
          {copySuccess ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy JSON
            </>
          )}
        </button>
      </div>

      {/* Process overview */}
      <div className="p-4 border-b border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-xs text-gray-500">Process ID</span>
          <p className="font-mono text-blue-400">{data.process_id}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Version</span>
          <p className="text-white">{data.version}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Owner</span>
          <p className="text-white">{data.owner}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Triggers</span>
          <p className="text-green-400">{data.triggers.join(', ')}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Inputs</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.inputs).map(([key, type]) => (
            <span key={key} className="text-xs px-2 py-1 rounded bg-slate-800 font-mono">
              <span className="text-cyan-400">{key}</span>
              <span className="text-gray-500">: </span>
              <span className="text-yellow-400">{type}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Steps ({data.steps.length})</h4>
        <div className="space-y-2">
          {data.steps.map((step) => (
            <div
              key={step.step_id}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              {/* Step header */}
              <button
                onClick={() => toggleStep(step.step_id)}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-blue-400">{step.step_id}</span>
                  <span className="text-white">{step.name}</span>
                  <span className={`text-xs ${typeColors[step.type] || 'text-gray-400'}`}>
                    [{step.type}]
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSteps.has(step.step_id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Step details */}
              {expandedSteps.has(step.step_id) && (
                <div className="p-3 border-t border-white/10 bg-black/20 animate-fade-in">
                  <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
                    {JSON.stringify(step, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error handling & Metadata */}
      <div className="p-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Error Handling</h4>
          <pre className="text-xs font-mono bg-slate-800 p-3 rounded-lg text-gray-300">
            {JSON.stringify(data.error_handling, null, 2)}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Metadata</h4>
          <pre className="text-xs font-mono bg-slate-800 p-3 rounded-lg text-gray-300">
            {JSON.stringify(data.metadata, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
